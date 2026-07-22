import React, { useEffect, useState, useMemo } from "react";
import { Search, RefreshCw } from "lucide-react";
import { Card, Button, StatBlock } from "../components/common";
import { PageHeader } from "../components/common/PageHeader";
import { DataGrid, Column } from "../components/data/DataGrid";
import {
  LedgerFormSlider,
  INITIAL_LEDGER_FORM,
  LedgerFormValues,
} from "../components/forms/LedgerFormSlider";
import { formatDZD } from "@shared/currency";
import {
  resolveRegistration,
  resolveTuition,
  resolveTransportAmount,
} from "@shared/pricing";
import toast from "react-hot-toast";

interface LedgerRow {
  id: string;
  studentId: string;
  studentName: string;
  level: string;
  classCode: string;
  optionCode: string;
  remise: number;
  justification: string;
  devisAnnuel: number;
  totalVersements: number;
  totalCreance: number;
  grandTotal: number;
  fi: number;
  v2: number;
  altV2: number;
  v3: number;
  destination: string;
  t1: number;
  t2: number;
  t3: number;
  psy1: number;
  psy2: number;
  orth1: number;
  orth2: number;
  ePlant: number;
  ratrapage: number;
  september: number;
  december: number;
  march: number;
  septemberBalance: number;
  infos: string;
  createdAt: string;
}

const num = (s: string) => parseFloat(s) || 0;
const sumV = (v: LedgerFormValues) =>
  num(v.fi) +
  num(v.v2) +
  num(v.altV2) +
  num(v.v3) +
  num(v.t1) +
  num(v.t2) +
  num(v.t3);

export function Payments() {
  const [ledger, setLedger] = useState<LedgerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<LedgerFormValues>({
    ...INITIAL_LEDGER_FORM,
  });

  const loadLedger = async () => {
    setLoading(true);
    try {
      const rows = await window.elImtiyaz.ledger.list({ pageSize: 1000 });
      setLedger(
        (rows as any[]).map((e) => ({
          id: e.id.value || e.id,
          studentId: e.studentId ?? "",
          studentName: e.studentName,
          level: e.level,
          classCode: e.classCode,
          optionCode: e.optionCode,
          remise: e.remise,
          justification: e.justification || "",
          devisAnnuel: e.devisAnnuel,
          totalVersements: e.totalVersements,
          totalCreance: e.totalCreance,
          grandTotal: e.grandTotal,
          fi: e.fi,
          v2: e.v2,
          altV2: e.altV2,
          v3: e.v3,
          destination: e.destination || "",
          t1: e.t1,
          t2: e.t2,
          t3: e.t3,
          psy1: e.psy1,
          psy2: e.psy2,
          orth1: e.orth1,
          orth2: e.orth2,
          ePlant: e.ePlant,
          ratrapage: e.ratrapage,
          september: e.september,
          december: e.december,
          march: e.march,
          septemberBalance: e.septemberBalance || 0,
          infos: e.infos || "",
          createdAt: e.createdAt,
        })),
      );
    } catch {
      toast.error("Failed to load school ledger rows.");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    loadLedger();
  }, []);

  const set = (key: string, value: string) =>
    setFormValues((p) => ({ ...p, [key]: value }));

  const clear = () => {
    setEditingEntryId(null);
    setFormValues({
      ...INITIAL_LEDGER_FORM,
      date: new Date().toISOString().slice(0, 10),
    });
  };

  const edit = (r: LedgerRow) => {
    setEditingEntryId(r.id);
    setFormValues({
      studentId: r.studentId ?? "",
      studentName: r.studentName,
      level: r.level || "PRIM",
      classCode: r.classCode,
      optionCode: r.optionCode,
      tutorName: (r as any).tutorName ?? "",
      phoneNumbers: (r as any).phoneNumbers ?? "",
      remise: String(r.remise),
      justification: r.justification,
      fi: String(r.fi),
      v2: String(r.v2),
      altV2: String(r.altV2),
      v3: String(r.v3),
      destination: r.destination,
      t1: String(r.t1),
      t2: String(r.t2),
      t3: String(r.t3),
      psy1: String(r.psy1),
      psy2: String(r.psy2),
      orth1: String(r.orth1),
      orth2: String(r.orth2),
      ePlant: String(r.ePlant),
      ratrapage: String(r.ratrapage),
      september: String(r.september),
      december: String(r.december),
      march: String(r.march),
      septemberBalance: String(r.septemberBalance),
      infos: r.infos,
      date: r.createdAt?.slice(0, 10) || new Date().toISOString().slice(0, 10),
    });
  };

  const save = async () => {
    if (!formValues.studentName.trim()) {
      toast.error("Pupil name cannot be empty.");
      return;
    }
    if (!formValues.studentId) {
      toast.error("Pick a registered pupil from the NOM dropdown first.");
      return;
    }
    const newV = sumV(formValues);
    const prevV = editingEntryId
      ? (ledger.find((r) => r.id === editingEntryId)?.totalVersements ?? 0)
      : 0;
    const payload = {
      studentId: formValues.studentId || undefined,
      studentName: formValues.studentName,
      level: formValues.level,
      classCode: formValues.classCode,
      optionCode: formValues.optionCode,
      tutorName: formValues.tutorName,
      phoneNumbers: formValues.phoneNumbers,
      remise: num(formValues.remise),
      justification: formValues.justification,
      fi: num(formValues.fi),
      v2: num(formValues.v2),
      altV2: num(formValues.altV2),
      v3: num(formValues.v3),
      destination: formValues.destination,
      t1: num(formValues.t1),
      t2: num(formValues.t2),
      t3: num(formValues.t3),
      psy1: num(formValues.psy1),
      psy2: num(formValues.psy2),
      orth1: num(formValues.orth1),
      orth2: num(formValues.orth2),
      ePlant: num(formValues.ePlant),
      ratrapage: num(formValues.ratrapage),
      september: num(formValues.september),
      december: num(formValues.december),
      march: num(formValues.march),
      septemberBalance: num(formValues.septemberBalance),
      infos: formValues.infos,
    };
    try {
      if (editingEntryId)
        await window.elImtiyaz.ledger.update(editingEntryId, payload);
      else await window.elImtiyaz.ledger.create(payload as any);
      const delta = newV - prevV;
      if (delta > 0 && payload.studentId) {
        try {
          await window.elImtiyaz.payments.create({
            studentId: payload.studentId,
            amount: delta,
            paymentMethod: "cash",
            paymentDate:
              formValues.date || new Date().toISOString().slice(0, 10),
            notes: `Ledger payment — ${payload.studentName}`,
          });
          toast.success("Row saved — receipt generated.");
        } catch (e) {
          toast.error("Saved, but receipt failed: " + (e as Error).message);
        }
      } else {
        toast.success(
          editingEntryId
            ? "Successfully updated entry."
            : "Added pupil to the master ledger.",
        );
      }
      clear();
      loadLedger();
    } catch (err) {
      toast.error(`Error saving: ${(err as Error).message}`);
    }
  };

  const liveTotals = useMemo(() => {
    const remise = num(formValues.remise);
    const registration = resolveRegistration(formValues.level);
    const tuition = resolveTuition(formValues.level);
    const transport =
      formValues.optionCode === "TRNSP" && formValues.destination?.trim()
        ? resolveTransportAmount(formValues.destination)
        : 0;
    const devisAnnuel = registration + tuition + transport - remise;
    const totalVersements = sumV(formValues);
    const grandTotal =
      totalVersements +
      num(formValues.psy1) +
      num(formValues.psy2) +
      num(formValues.orth1) +
      num(formValues.orth2) +
      num(formValues.ePlant) +
      num(formValues.ratrapage) +
      num(formValues.september) +
      num(formValues.december) +
      num(formValues.march);
    return {
      devisAnnuel,
      totalVersements,
      totalCreance: devisAnnuel - totalVersements,
      grandTotal,
    };
  }, [formValues]);

  const columns: Column<LedgerRow>[] = [
    { key: "studentName", header: "NOM", sortable: true },
    { key: "classCode", header: "H (Classe)", sortable: true, width: 80 },
    {
      key: "devisAnnuel",
      header: "L (Devis)",
      align: "right",
      render: (r) => formatDZD(r.devisAnnuel),
    },
    {
      key: "totalVersements",
      header: "P (Versements)",
      align: "right",
      render: (r) => formatDZD(r.totalVersements),
    },
    {
      key: "totalCreance",
      header: "Q (Creance)",
      align: "right",
      render: (r) => formatDZD(r.totalCreance),
    },
    {
      key: "actions",
      header: "",
      width: 120,
      render: (r) => (
        <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
          <Button size="sm" variant="ghost" onClick={() => edit(r)}>
            Edit
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={async () => {
              if (confirm("Delete row?")) {
                await window.elImtiyaz.ledger.delete(r.id);
                loadLedger();
              }
            }}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="el-page">
      <PageHeader
        title="Ledger Management"
        subtitle={`${ledger.length} active logs`}
        actions={
          <Button
            variant="ghost"
            icon={<RefreshCw size={14} />}
            onClick={loadLedger}
          >
            Refresh
          </Button>
        }
      />
      <div
        className="grid"
        style={{
          gridTemplateColumns: "1.2fr 2fr",
          gap: "var(--space-4)",
          marginBottom: "var(--space-4)",
        }}
      >
        <LedgerFormSlider
          liveTotals={liveTotals}
          onValueChange={set}
          onClear={clear}
          onSave={save}
          values={formValues}
        />
        <Card title="Recalculated System Summaries">
          <div
            className="grid"
            style={{ gridTemplateColumns: "1fr 1fr", gap: "var(--space-3)" }}
          >
            <StatBlock
              label="Active Pupil Count"
              value={ledger.length}
              format="number"
            />
            <StatBlock
              label="Outstanding Balance"
              value={ledger.reduce((a, r) => a + r.totalCreance, 0)}
              format="currency"
            />
          </div>
        </Card>
      </div>
      <Card>
        <div
          className="el-search-bar"
          style={{ marginBottom: "var(--space-3)" }}
        >
          <Search size={14} />
          <input
            placeholder="Fuzzy find pupil or class…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <DataGrid
          columns={columns}
          data={ledger.filter((r) =>
            r.studentName?.toLowerCase().includes(search.toLowerCase()),
          )}
          rowKey={(r) => r.id}
          loading={loading}
        />
      </Card>
    </div>
  );
}
