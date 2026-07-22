import React, { useState, useEffect, useMemo } from "react";
import {
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Check,
  Search,
} from "lucide-react";
import { Button, Badge } from "../common";
import { formatDZD } from "@shared/currency";
import { CLASSE_DROPDOWN_VALUES } from "@shared/quote-dropdown-values";
import { LEVEL_CODE_LABELS, LEVEL_CODES } from "@shared/level-codes";

export interface LedgerFormValues {
  studentId: string;
  studentName: string;
  level: string;
  classCode: string;
  optionCode: string;
  tutorName: string;
  phoneNumbers: string;
  remise: string;
  justification: string;
  fi: string;
  v2: string;
  altV2: string;
  v3: string;
  destination: string;
  t1: string;
  t2: string;
  t3: string;
  psy1: string;
  psy2: string;
  orth1: string;
  orth2: string;
  ePlant: string;
  ratrapage: string;
  september: string;
  december: string;
  march: string;
  septemberBalance: string;
  infos: string;
  date: string;
}

export const INITIAL_LEDGER_FORM: LedgerFormValues = {
  studentId: "",
  studentName: "",
  level: "PRIM",
  classCode: "",
  optionCode: "",
  tutorName: "",
  phoneNumbers: "",
  remise: "0",
  justification: "",
  fi: "0",
  v2: "0",
  altV2: "0",
  v3: "0",
  destination: "",
  t1: "0",
  t2: "0",
  t3: "0",
  psy1: "0",
  psy2: "0",
  orth1: "0",
  orth2: "0",
  ePlant: "0",
  ratrapage: "0",
  september: "0",
  december: "0",
  march: "0",
  septemberBalance: "0",
  infos: "",
  date: new Date().toISOString().slice(0, 10),
};

const LEVEL_DESC: Record<string, string> = {
  MS: "Moyenne Section — pre-school, age 4",
  GS: "Grande Section — pre-school, age 5",
  PRIM: "Primaire — primary (CP→CM2)",
  COLG: "Collège — middle (1AAM→4AAM)",
  LYC: "Lycée — high (1AS→3AS)",
  AUTISTE: "Specialised autism-education division",
  NV2: "New/special admission NV2",
  NV3: "NV3",
  NV4: "NV4",
  NV5: "NV5",
};
const CLASS_DESC: Record<string, string> = {
  CP: "Cours Préparatoire — 1st yr primary (6)",
  CE1: "2nd yr primary (7)",
  CE2: "3rd yr primary (8)",
  CM1: "4th yr primary (9)",
  CM2: "5th yr primary (10)",
  "1AAM": "1st yr middle (11)",
  "2AAM": "2nd yr middle (12)",
  "3AAM": "3rd yr middle (13)",
  "4AAM": "4th yr middle (14)",
  "1AS": "1st yr high (15)",
  "2AS": "2nd yr high (16)",
  "3AS": "3rd yr high (17)",
};
const OPTION_DESC: Record<string, string> = {
  "": "Standard enrolment — no transport",
  TRNSP: "Transportation active — adds a transport fee by destination",
};

interface Props {
  liveTotals: {
    devisAnnuel: number;
    totalVersements: number;
    totalCreance: number;
    grandTotal: number;
  };
  onValueChange: (field: string, val: string) => void;
  onClear: () => void;
  onSave: () => void;
  values: LedgerFormValues;
}

export function LedgerFormSlider({
  liveTotals,
  onValueChange,
  onClear,
  onSave,
  values,
}: Props) {
  const [step, setStep] = useState(1);
  const [students, setStudents] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [parents, setParents] = useState<any[]>([]);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const steps = [
    { num: 1, label: "Pupil & Details" },
    { num: 2, label: "Core Installments" },
    { num: 3, label: "Transport Logs" },
    { num: 4, label: "Clinical & Extras" },
  ];
  const idOf = (x: any) => x?.id?.value ?? x?.id ?? "";

  const load = () => {
    window.elImtiyaz.students
      .list({ pageSize: 5000 })
      .then((r: any) => Array.isArray(r) && setStudents(r))
      .catch(() => {});
    window.elImtiyaz.classes
      .list()
      .then((r: any) => Array.isArray(r) && setClasses(r))
      .catch(() => {});
    window.elImtiyaz.parents
      .list({ pageSize: 5000 })
      .then((r: any) => Array.isArray(r) && setParents(r))
      .catch(() => {});
  };
  useEffect(() => {
    load();
  }, []);
  useEffect(() => {
    if (step === 1) load(); /* eslint-disable-next-line */
  }, [step]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = !q
      ? students.slice(0, 50)
      : students
          .filter(
            (s) =>
              (s.fullName ?? "").toLowerCase().includes(q) ||
              (s.studentCode ?? "").toLowerCase().includes(q),
          )
          .slice(0, 50);
    return list;
  }, [students, query]);

  const classOptions = useMemo(() => {
    const fromDb = classes.map((c) => ({
      value: c.name,
      title: `${c.grade ?? ""} ${c.section ?? ""}`.trim() || c.name,
    }));
    const have = new Set(fromDb.map((o) => o.value));
    const fromStatic = CLASSE_DROPDOWN_VALUES.filter((v) => !have.has(v)).map(
      (v) => ({ value: v, title: CLASS_DESC[v] ?? "" }),
    );
    return [...fromDb, ...fromStatic];
  }, [classes]);

  const pick = (s: any) => {
    const sid = idOf(s);
    onValueChange("studentId", sid);
    onValueChange("studentName", s.fullName ?? "");
    setQuery(s.fullName ?? "");
    setOpen(false);
    if (s.classId) {
      const c = classes.find((x) => idOf(x) === s.classId);
      if (c) onValueChange("classCode", c.name);
    }
    const p = parents.find(
      (x) => Array.isArray(x.studentIds) && x.studentIds.includes(sid),
    );
    if (p) {
      onValueChange("tutorName", p.fullName ?? "");
      onValueChange("phoneNumbers", p.phone ?? "");
    }
  };

  const drop: React.CSSProperties = {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    zIndex: 100,
    background: "var(--color-panel-bg)",
    border: "1px solid var(--border-default)",
    borderRadius: "var(--radius-md)",
    maxHeight: 180,
    overflowY: "auto",
  };
  const row: React.CSSProperties = {
    padding: "8px 12px",
    cursor: "pointer",
    borderBottom: "1px solid var(--border-subtle)",
    color: "var(--color-text-primary)",
  };

  return (
    <div
      className="el-card flex flex-col gap-4"
      style={{ border: "1px solid var(--border-primary)" }}
    >
      <div
        className="flex items-center justify-between"
        style={{
          paddingBottom: 10,
          borderBottom: "1px solid var(--border-subtle)",
        }}
      >
        <div style={{ display: "flex", gap: "var(--space-2)" }}>
          {steps.map((st) => (
            <div key={st.num} className="flex items-center gap-1">
              <span
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: "50%",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 10,
                  background:
                    step === st.num
                      ? "var(--color-primary-blue)"
                      : "var(--color-slate-gray)",
                  color: "white",
                }}
              >
                {st.num}
              </span>
              {step === st.num && (
                <span
                  style={{
                    fontSize: "var(--text-xs)",
                    fontWeight: "var(--weight-semibold)",
                    color: "var(--color-primary-blue)",
                  }}
                >
                  {st.label}
                </span>
              )}
            </div>
          ))}
        </div>
        <Badge tone={liveTotals.totalCreance > 0 ? "warning" : "success"}>
          Creance: {formatDZD(liveTotals.totalCreance)}
        </Badge>
      </div>

      {step === 1 && (
        <div
          className="grid"
          style={{ gridTemplateColumns: "1fr 1fr", gap: "var(--space-3)" }}
        >
          <div style={{ position: "relative" }}>
            <label className="el-stat__label">NOM (F) — select pupil</label>
            <div className="el-input w-full">
              <Search
                size={14}
                style={{ color: "var(--color-text-tertiary)" }}
              />
              <input
                value={open ? query : values.studentName || query}
                onChange={(e) => {
                  onValueChange("studentName", e.target.value);
                  onValueChange("studentId", "");
                  setQuery(e.target.value);
                  setOpen(true);
                }}
                onFocus={() => {
                  setQuery(values.studentName || "");
                  setOpen(true);
                }}
                placeholder="Type to search, then pick a pupil"
              />
            </div>
            {open && (
              <div style={drop}>
                {filtered.length === 0 ? (
                  <div
                    style={{
                      ...row,
                      cursor: "default",
                      color: "var(--color-text-tertiary)",
                    }}
                  >
                    No match — register the pupil first (Students → New
                    Student).
                  </div>
                ) : (
                  filtered.map((s) => (
                    <div
                      key={idOf(s)}
                      onClick={() => pick(s)}
                      style={row}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background =
                          "var(--color-primary-tint-08)")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = "transparent")
                      }
                    >
                      {s.fullName}{" "}
                      <span style={{ color: "var(--color-text-tertiary)" }}>
                        ({s.studentCode})
                      </span>
                    </div>
                  ))
                )}
                <div
                  style={{ ...row, color: "var(--color-text-tertiary)" }}
                  onClick={() => setOpen(false)}
                >
                  ✕ Close
                </div>
              </div>
            )}
          </div>
          <div>
            <label className="el-stat__label">Niveau (G)</label>
            <select
              className="el-input w-full"
              title={LEVEL_DESC[values.level] ?? ""}
              value={values.level}
              onChange={(e) => onValueChange("level", e.target.value)}
            >
              {LEVEL_CODES.map((c) => (
                <option key={c} value={c} title={LEVEL_DESC[c]}>
                  {c} — {LEVEL_CODE_LABELS[c]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="el-stat__label">CLASSE (H)</label>
            <select
              className="el-input w-full"
              title={CLASS_DESC[values.classCode] ?? ""}
              value={values.classCode}
              onChange={(e) => onValueChange("classCode", e.target.value)}
            >
              <option value="">Unassigned</option>
              {classOptions.map((c) => (
                <option key={c.value} value={c.value} title={c.title}>
                  {c.value}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="el-stat__label">Option (I)</label>
            <select
              className="el-input w-full"
              title={OPTION_DESC[values.optionCode] ?? ""}
              value={values.optionCode}
              onChange={(e) => onValueChange("optionCode", e.target.value)}
            >
              <option value="" title={OPTION_DESC[""]}>
                None (Standard Enrolment)
              </option>
              <option value="TRNSP" title={OPTION_DESC["TRNSP"]}>
                TRNSP (Transportation Active)
              </option>
            </select>
          </div>
          <div>
            <label className="el-stat__label">Tuteur (E) — guardian</label>
            <select
              className="el-input w-full"
              value={values.tutorName}
              onChange={(e) => {
                const p = parents.find((x) => x.fullName === e.target.value);
                onValueChange("tutorName", e.target.value);
                if (p) onValueChange("phoneNumbers", p.phone ?? "");
              }}
            >
              <option value="">Unassigned</option>
              {parents.map((p) => (
                <option key={idOf(p)} value={p.fullName}>
                  {p.fullName} ({p.phone})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="el-stat__label">NEM (D) — phone(s)</label>
            <input
              className="el-input w-full"
              value={values.phoneNumbers}
              onChange={(e) => onValueChange("phoneNumbers", e.target.value)}
              placeholder="0661…/0770…"
            />
          </div>
        </div>
      )}

      {step === 2 && (
        <div
          className="grid"
          style={{ gridTemplateColumns: "1fr 1fr", gap: "var(--space-3)" }}
        >
          <div>
            <label className="el-stat__label">REMISE (J)</label>
            <input
              type="number"
              className="el-input w-full"
              value={values.remise}
              onChange={(e) => onValueChange("remise", e.target.value)}
            />
          </div>
          <div>
            <label className="el-stat__label">Justification (K)</label>
            <input
              className="el-input w-full"
              value={values.justification}
              onChange={(e) => onValueChange("justification", e.target.value)}
            />
          </div>
          <div>
            <label className="el-stat__label">FI Paid (R)</label>
            <input
              type="number"
              className="el-input w-full"
              value={values.fi}
              onChange={(e) => onValueChange("fi", e.target.value)}
            />
          </div>
          <div>
            <label className="el-stat__label">V2 (S)</label>
            <input
              type="number"
              className="el-input w-full"
              value={values.v2}
              onChange={(e) => onValueChange("v2", e.target.value)}
            />
          </div>
          <div>
            <label className="el-stat__label">2V (T)</label>
            <input
              type="number"
              className="el-input w-full"
              value={values.altV2}
              onChange={(e) => onValueChange("altV2", e.target.value)}
            />
          </div>
          <div>
            <label className="el-stat__label">v3 (U)</label>
            <input
              type="number"
              className="el-input w-full"
              value={values.v3}
              onChange={(e) => onValueChange("v3", e.target.value)}
            />
          </div>
        </div>
      )}

      {step === 3 && (
        <div
          className="grid"
          style={{ gridTemplateColumns: "1fr 1fr", gap: "var(--space-3)" }}
        >
          <div>
            <label className="el-stat__label">Destination (V)</label>
            <select
              className="el-input w-full"
              value={values.destination}
              onChange={(e) => onValueChange("destination", e.target.value)}
            >
              <option value="">No Transportation Destination</option>
              <option value="BOUMERDES">BOUMERDES (Zone 1 - 35k DZD)</option>
              <option value="CORSO">CORSO (Zone 1 - 35k DZD)</option>
              <option value="SAHEL">SAHEL (Zone 1 - 35k DZD)</option>
              <option value="BOUDOUAOU">BOUDOUAOU (Zone 3 - 52k DZD)</option>
              <option value="REGHAIA">REGHAIA (Zone 4 - 55k DZD)</option>
              <option value="BORDJ MNAIL">
                BORDJ MNAIL (Zone 4 - 55k DZD)
              </option>
              <option value="ISSER">ISSER (Zone 4 - 55k DZD)</option>
            </select>
          </div>
          <div>
            <label className="el-stat__label">Transport T1 (W)</label>
            <input
              type="number"
              className="el-input w-full"
              value={values.t1}
              onChange={(e) => onValueChange("t1", e.target.value)}
            />
          </div>
          <div>
            <label className="el-stat__label">Transport T2 (X)</label>
            <input
              type="number"
              className="el-input w-full"
              value={values.t2}
              onChange={(e) => onValueChange("t2", e.target.value)}
            />
          </div>
          <div>
            <label className="el-stat__label">Transport t3 (Y)</label>
            <input
              type="number"
              className="el-input w-full"
              value={values.t3}
              onChange={(e) => onValueChange("t3", e.target.value)}
            />
          </div>
        </div>
      )}

      {step === 4 && (
        <div
          className="grid"
          style={{ gridTemplateColumns: "1fr 1fr", gap: "var(--space-2)" }}
        >
          <div>
            <label className="el-stat__label">Psy (1/2)</label>
            <div className="flex gap-1">
              <input
                type="number"
                className="el-input flex-1"
                value={values.psy1}
                onChange={(e) => onValueChange("psy1", e.target.value)}
              />
              <input
                type="number"
                className="el-input flex-1"
                value={values.psy2}
                onChange={(e) => onValueChange("psy2", e.target.value)}
              />
            </div>
          </div>
          <div>
            <label className="el-stat__label">Orth (1/2)</label>
            <div className="flex gap-1">
              <input
                type="number"
                className="el-input flex-1"
                value={values.orth1}
                onChange={(e) => onValueChange("orth1", e.target.value)}
              />
              <input
                type="number"
                className="el-input flex-1"
                value={values.orth2}
                onChange={(e) => onValueChange("orth2", e.target.value)}
              />
            </div>
          </div>
          <div>
            <label className="el-stat__label">E-Plant & Ratrapage</label>
            <div className="flex gap-1">
              <input
                type="number"
                className="el-input flex-1"
                value={values.ePlant}
                onChange={(e) => onValueChange("ePlant", e.target.value)}
              />
              <input
                type="number"
                className="el-input flex-1"
                value={values.ratrapage}
                onChange={(e) => onValueChange("ratrapage", e.target.value)}
              />
            </div>
          </div>
          <div>
            <label className="el-stat__label">September Balance (AG)</label>
            <input
              type="number"
              className="el-input w-full"
              value={values.septemberBalance}
              onChange={(e) =>
                onValueChange("septemberBalance", e.target.value)
              }
            />
          </div>
        </div>
      )}

      <div
        className="flex justify-between items-center mt-3"
        style={{
          padding: 8,
          background: "rgba(52,155,212,0.05)",
          borderRadius: "var(--radius-md)",
        }}
      >
        <div style={{ fontSize: "var(--text-xs)", display: "flex", gap: 12 }}>
          <span>
            <strong>Devis:</strong> {formatDZD(liveTotals.devisAnnuel)}
          </span>
          <span>
            <strong>Versements:</strong> {formatDZD(liveTotals.totalVersements)}
          </span>
          <span>
            <strong>Grand Total:</strong> {formatDZD(liveTotals.grandTotal)}
          </span>
        </div>
      </div>
      <div className="flex justify-between mt-2">
        <Button
          size="sm"
          variant="ghost"
          icon={<RotateCcw size={12} />}
          onClick={onClear}
        >
          Clear
        </Button>
        <div className="flex gap-2">
          {step > 1 && (
            <Button
              size="sm"
              variant="ghost"
              icon={<ChevronLeft size={12} />}
              onClick={() => setStep((s) => Math.max(1, s - 1))}
            >
              Back
            </Button>
          )}
          {step < 4 ? (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setStep((s) => Math.min(4, s + 1))}
            >
              Next <ChevronRight size={12} />
            </Button>
          ) : (
            <Button
              size="sm"
              variant="primary"
              icon={<Check size={12} />}
              onClick={onSave}
            >
              Save Row
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
