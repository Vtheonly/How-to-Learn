/**
 * Phone-number parsing & formatting helpers.
 *
 * Background (issue 8.5 in software_review.md): Excel stores phone numbers
 * in column D (NEM) as a single slash-separated string, e.g.
 *   `0663701834/0660800317`
 *
 * The `LedgerEntry.phoneNumbers` field mirrors that raw string (correct —
 * it's a faithful copy of the spreadsheet cell). But the `Student` entity
 * models `phoneNumbers: string[]` (an array), so when ledger data is
 * promoted into a Student record the raw string must be split.
 *
 * The original codebase stored the raw string directly into the array
 * field, creating a type mismatch (a `string[]` field holding a single
 * comma/slash-bearing string). These helpers fix that mismatch by
 * providing explicit parse / format functions that any caller can use.
 */

/**
 * Default delimiters recognised when splitting a raw phone-number string.
 * Ordered by priority: slash first (the spreadsheet's canonical separator),
 * then comma, then semicolon, then whitespace.
 */
const PHONE_DELIMITERS = ["/", ",", ";", /\s+/] as const;

/**
 * Parse a raw phone-number string from Excel column D (NEM) into an array
 * of normalised phone-number strings.
 *
 * Examples:
 *   parsePhoneNumbers("0663701834/0660800317")
 *     → ["0663701834", "0660800317"]
 *   parsePhoneNumbers("0663701834, 0660800317")
 *     → ["0663701834", "0660800317"]
 *   parsePhoneNumbers("0663701834")
 *     → ["0663701834"]
 *   parsePhoneNumbers("")
 *     → []
 *   parsePhoneNumbers(undefined)
 *     → []
 *
 * @param raw The raw cell value from Excel column D.
 * @returns An array of trimmed, non-empty phone-number strings.
 */
export function parsePhoneNumbers(raw: string | null | undefined): string[] {
  if (raw === null || raw === undefined) return [];
  const s = String(raw).trim();
  if (!s) return [];

  // Try each delimiter in order; the first one that splits the string
  // into >1 piece wins. This avoids accidentally splitting a single
  // number that happens to contain a delimiter character.
  for (const delim of PHONE_DELIMITERS) {
    const parts = s.split(delim).map((p) => p.trim()).filter(Boolean);
    if (parts.length > 1) {
      return parts;
    }
  }

  return [s];
}

/**
 * Format an array of phone numbers back into the Excel column-D
 * representation (slash-separated). This is the inverse of
 * `parsePhoneNumbers` and is used when exporting ledger data back to
 * a spreadsheet.
 *
 * Examples:
 *   formatPhoneNumbers(["0663701834", "0660800317"])
 *     → "0663701834/0660800317"
 *   formatPhoneNumbers([])
 *     → ""
 *   formatPhoneNumbers(["0663701834"])
 *     → "0663701834"
 */
export function formatPhoneNumbers(phones: string[] | null | undefined): string {
  if (!phones || phones.length === 0) return "";
  return phones
    .map((p) => String(p ?? "").trim())
    .filter(Boolean)
    .join("/");
}

/**
 * Type guard-ish check: returns true if the value looks like a raw,
 * unparsed phone-number string (i.e. contains a recognised delimiter).
 * Useful for callers that want to detect the type mismatch at runtime.
 */
export function isRawPhoneNumbersString(
  value: unknown,
): value is string {
  if (typeof value !== "string") return false;
  return PHONE_DELIMITERS.some((d) => {
    try {
      return value.split(d).some((part, i) => i > 0 && part.trim().length > 0);
    } catch {
      return false;
    }
  });
}
