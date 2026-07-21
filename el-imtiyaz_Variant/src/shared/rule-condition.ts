/**
 * Rule condition evaluator — a tiny safe mini-language for the
 * `FormulaRule.condition` field (issue 10.4 / #13 in
 * software_review.md).
 *
 * Background: the `condition` field has existed on the `FormulaRule`
 * entity since iteration 1 but was never read by any service. It was
 * pure architectural dead weight. This module gives it a real
 * semantics: a `condition` is a boolean expression that is evaluated
 * against the row's `ctx.fields` dictionary; when it returns `false`,
 * the rule is skipped for that row.
 *
 * The mini-language is intentionally limited — we do NOT want to embed
 * a full expression engine here (the existing FormulaEngine already
 * handles arithmetic, and reusing it would re-introduce the parsing
 * complexity that the `condition` field was meant to avoid). Instead
 * we support exactly the patterns that show up in the Excel operator's
 * decision process:
 *
 *   1. Atomic comparisons:
 *        field = "value"            (string equality, case-insensitive)
 *        field = 123                (numeric equality)
 *        field != "value"
 *        field > 100                (numeric comparison)
 *        field >= 100
 *        field < 100
 *        field <= 100
 *        field IS NULL              (field missing or empty string)
 *        field IS NOT NULL
 *
 *   2. Boolean composition:
 *        <atom> AND <atom>
 *        <atom> OR  <atom>
 *        NOT (<atom>)
 *        (<atoms>)                  (parentheses)
 *
 *   3. Whitespace is allowed everywhere.
 *
 * Examples:
 *   level = "PRIM"
 *   optionCode = "TRNSP" AND remise > 0
 *   (level = "LYC" OR level = "COLG") AND destination IS NOT NULL
 *
 * Unknown fields evaluate to `0` (numeric) / `""` (string) — matching
 * the convention used by the formula engine's `resolveField()`. A
 * parse error is returned as `{ ok: false, error: "..." }` so the
 * caller can decide whether to log and skip, or hard-fail.
 */

export interface RuleConditionResult {
  ok: boolean;
  /** Present only when `ok` is true. */
  value?: boolean;
  /** Present only when `ok` is false. */
  error?: string;
}

// ── Tokenizer ──────────────────────────────────────────────────────────

type TokenType =
  | "IDENT"        // a field name (lowercase letters, digits, underscore)
  | "STRING"       // a double-quoted string literal
  | "NUMBER"       // a numeric literal (integer or decimal, optional sign)
  | "OP"           // =, !=, >, >=, <, <=
  | "LPAREN"
  | "RPAREN"
  | "AND"
  | "OR"
  | "NOT"
  | "IS"
  | "NULL"
  | "EOF";

interface Token {
  type: TokenType;
  value: string;
  pos: number;
}

const KEYWORDS: ReadonlySet<string> = new Set([
  "AND", "OR", "NOT", "IS", "NULL",
]);

function tokenize(input: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  while (i < input.length) {
    const c = input[i];
    // Skip whitespace
    if (/\s/.test(c)) { i++; continue; }
    // Parens
    if (c === "(") { tokens.push({ type: "LPAREN", value: c, pos: i }); i++; continue; }
    if (c === ")") { tokens.push({ type: "RPAREN", value: c, pos: i }); i++; continue; }
    // String literal (double-quoted, no escape sequences — keep it minimal)
    if (c === '"') {
      let j = i + 1;
      while (j < input.length && input[j] !== '"') j++;
      if (j >= input.length) {
        throw new Error(`Unterminated string literal at position ${i}`);
      }
      tokens.push({ type: "STRING", value: input.slice(i + 1, j), pos: i });
      i = j + 1;
      continue;
    }
    // Number literal (optional sign, digits, optional decimal)
    if (c === "-" || c === "+" || /[0-9]/.test(c)) {
      let j = i;
      if (c === "-" || c === "+") j++;
      while (j < input.length && /[0-9.]/.test(input[j])) j++;
      const num = input.slice(i, j);
      if (num === "-" || num === "+" || num === "" ) {
        // Not a number — fall through to operator handling
      } else {
        tokens.push({ type: "NUMBER", value: num, pos: i });
        i = j;
        continue;
      }
    }
    // Operators (two-char first)
    if (c === "!" && input[i + 1] === "=") { tokens.push({ type: "OP", value: "!=", pos: i }); i += 2; continue; }
    if (c === ">" && input[i + 1] === "=") { tokens.push({ type: "OP", value: ">=", pos: i }); i += 2; continue; }
    if (c === "<" && input[i + 1] === "=") { tokens.push({ type: "OP", value: "<=", pos: i }); i += 2; continue; }
    if (c === "=") { tokens.push({ type: "OP", value: "=", pos: i }); i++; continue; }
    if (c === ">") { tokens.push({ type: "OP", value: ">", pos: i }); i++; continue; }
    if (c === "<") { tokens.push({ type: "OP", value: "<", pos: i }); i++; continue; }
    // Identifier or keyword
    if (/[a-zA-Z_]/.test(c)) {
      let j = i;
      while (j < input.length && /[a-zA-Z0-9_]/.test(input[j])) j++;
      const word = input.slice(i, j);
      const upper = word.toUpperCase();
      if (KEYWORDS.has(upper)) {
        tokens.push({ type: upper as TokenType, value: word, pos: i });
      } else {
        tokens.push({ type: "IDENT", value: word, pos: i });
      }
      i = j;
      continue;
    }
    throw new Error(`Unexpected character '${c}' at position ${i}`);
  }
  tokens.push({ type: "EOF", value: "", pos: input.length });
  return tokens;
}

// ── Parser (recursive descent) ─────────────────────────────────────────
//
// Grammar:
//   orExpr   := andExpr ( OR andExpr )*
//   andExpr  := notExpr ( AND notExpr )*
//   notExpr  := NOT notExpr | atom
//   atom     := LPAREN orExpr RPAREN
//             | IDENT OP literal
//             | IDENT IS [ NOT ] NULL
//   literal  := STRING | NUMBER

type AstNode =
  | { kind: "or"; left: AstNode; right: AstNode }
  | { kind: "and"; left: AstNode; right: AstNode }
  | { kind: "not"; operand: AstNode }
  | { kind: "cmp"; field: string; op: string; literal: string | number; isString: boolean }
  | { kind: "isNull"; field: string; negated: boolean };

class Parser {
  private pos = 0;
  constructor(private readonly tokens: Token[]) {}

  /** Peek at the next token without consuming it. Public for the top-level evaluator. */
  peek(): Token { return this.tokens[this.pos]; }
  private next(): Token { return this.tokens[this.pos++]; }

  parseOr(): AstNode {
    let left = this.parseAnd();
    while (this.peek().type === "OR") {
      this.next();
      const right = this.parseAnd();
      left = { kind: "or", left, right };
    }
    return left;
  }

  parseAnd(): AstNode {
    let left = this.parseNot();
    while (this.peek().type === "AND") {
      this.next();
      const right = this.parseNot();
      left = { kind: "and", left, right };
    }
    return left;
  }

  parseNot(): AstNode {
    if (this.peek().type === "NOT") {
      this.next();
      const operand = this.parseNot();
      return { kind: "not", operand };
    }
    return this.parseAtom();
  }

  parseAtom(): AstNode {
    const tok = this.peek();
    if (tok.type === "LPAREN") {
      this.next();
      const inner = this.parseOr();
      if (this.peek().type !== "RPAREN") {
        throw new Error("Expected ')' to close parenthesised expression");
      }
      this.next();
      return inner;
    }
    if (tok.type !== "IDENT") {
      throw new Error(`Expected field name or '(' but got '${tok.value || tok.type}' at position ${tok.pos}`);
    }
    const field = this.next().value;

    const next = this.peek();
    if (next.type === "IS") {
      this.next();
      let negated = false;
      if (this.peek().type === "NOT") { negated = true; this.next(); }
      if (this.peek().type !== "NULL") {
        throw new Error(`Expected 'NULL' after 'IS' [NOT] for field '${field}'`);
      }
      this.next();
      return { kind: "isNull", field, negated };
    }
    if (next.type !== "OP") {
      throw new Error(`Expected operator (=, !=, >, >=, <, <=) after field '${field}' but got '${next.value || next.type}' at position ${next.pos}`);
    }
    const op = this.next().value;
    const literalTok = this.next();
    if (literalTok.type === "STRING") {
      return { kind: "cmp", field, op, literal: literalTok.value, isString: true };
    }
    if (literalTok.type === "NUMBER") {
      return { kind: "cmp", field, op, literal: Number(literalTok.value), isString: false };
    }
    throw new Error(`Expected string or number literal after operator '${op}' but got '${literalTok.value || literalTok.type}' at position ${literalTok.pos}`);
  }
}

// ── Evaluator ──────────────────────────────────────────────────────────

function getField(fields: Record<string, unknown>, name: string): unknown {
  if (name in fields) return fields[name];
  // Field name is case-insensitive — the formula engine resolves the same way.
  const lower = name.toLowerCase();
  for (const k of Object.keys(fields)) {
    if (k.toLowerCase() === lower) return fields[k];
  }
  return undefined;
}

function toStr(v: unknown): string {
  if (v === undefined || v === null) return "";
  return String(v);
}

function toNum(v: unknown): number {
  if (typeof v === "number") return v;
  if (typeof v === "string") {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  }
  if (typeof v === "boolean") return v ? 1 : 0;
  return 0;
}

function evalNode(node: AstNode, fields: Record<string, unknown>): boolean {
  switch (node.kind) {
    case "or":
      return evalNode(node.left, fields) || evalNode(node.right, fields);
    case "and":
      return evalNode(node.left, fields) && evalNode(node.right, fields);
    case "not":
      return !evalNode(node.operand, fields);
    case "isNull": {
      const v = getField(fields, node.field);
      const isEmpty = v === undefined || v === null || v === "";
      return node.negated ? !isEmpty : isEmpty;
    }
    case "cmp": {
      const raw = getField(fields, node.field);
      if (node.isString) {
        const lhs = toStr(raw).trim().toUpperCase();
        const rhs = String(node.literal).trim().toUpperCase();
        switch (node.op) {
          case "=":  return lhs === rhs;
          case "!=": return lhs !== rhs;
          case ">":  return lhs > rhs;
          case ">=": return lhs >= rhs;
          case "<":  return lhs < rhs;
          case "<=": return lhs <= rhs;
          default:   return false;
        }
      } else {
        const lhs = toNum(raw);
        const rhs = Number(node.literal);
        switch (node.op) {
          case "=":  return lhs === rhs;
          case "!=": return lhs !== rhs;
          case ">":  return lhs > rhs;
          case ">=": return lhs >= rhs;
          case "<":  return lhs < rhs;
          case "<=": return lhs <= rhs;
          default:   return false;
        }
      }
    }
  }
}

/**
 * Evaluate a rule condition against the row's fields.
 *
 * Returns `{ ok: true, value: boolean }` on success, or
 * `{ ok: false, error: string }` when the condition cannot be parsed
 * or contains a syntactic error. The caller is expected to log the
 * error and treat the rule as "no condition" (i.e. apply it).
 */
export function evaluateRuleCondition(
  condition: string,
  fields: Record<string, unknown>,
): RuleConditionResult {
  if (!condition || !String(condition).trim()) {
    return { ok: true, value: true };
  }
  try {
    const tokens = tokenize(condition);
    const parser = new Parser(tokens);
    const ast = parser.parseOr();
    if (parser.peek().type !== "EOF") {
      const leftover = parser.peek();
      return {
        ok: false,
        error: `Trailing tokens after condition at position ${leftover.pos}: '${leftover.value || leftover.type}'`,
      };
    }
    return { ok: true, value: !!evalNode(ast, fields) };
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }
}
