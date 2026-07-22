import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Edit,
  FileText,
  DollarSign,
  Calendar,
  BookOpen,
  MessageSquare,
} from "lucide-react";
import {
  Card,
  Badge,
  Button,
  StatBlock,
  EmptyState,
} from "../components/common";
import { PageHeader } from "../components/common/PageHeader";
import { PaymentTimeline } from "../components/timeline/PaymentTimeline";
import { formatDZD, formatDate, relativeTime } from "@shared/currency";
import { STUDENT_STATUS_COLORS, STUDENT_STATUS_LABELS } from "@core/enums";

interface Profile {
  student: any;
  totalPaid: number;
  totalOwed: number;
  outstandingBalance: number;
  paymentCount: number;
}

export function StudentProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [timeline, setTimeline] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [ledger, setLedger] = useState<any[]>([]);
  const [auditComments, setAuditComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const [p, t, pays, ledg] = await Promise.all([
          window.elImtiyaz.students.profile(id),
          window.elImtiyaz.students.timeline(id),
          window.elImtiyaz.payments.byStudent(id),
          window.elImtiyaz.ledger.byStudent(id),
        ]);
        setProfile(p as any);
        setTimeline(t as any[]);
        setPayments(pays as any[]);
        setLedger(ledg as any[]);
        if (Array.isArray(ledg) && ledg.length > 0) {
          const entryId = (ledg[0] as any).id.value;
          setAuditComments(
            (await window.elImtiyaz.ledger.auditComments.list(
              entryId,
            )) as any[],
          );
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading || !profile)
    return (
      <div className="el-page">
        <div
          className="flex items-center justify-center"
          style={{ padding: "var(--space-12)" }}
        >
          <div className="el-spinner el-spinner--lg" />
        </div>
      </div>
    );

  const s = profile.student;
  const le = ledger[0] as any | undefined;
  const totalPaid = le ? le.totalVersements : profile.totalPaid;
  const totalOwed = le ? le.devisAnnuel : profile.totalOwed;
  const outstanding = le ? le.totalCreance : profile.outstandingBalance;
  const paymentCount = le
    ? auditComments.length || profile.paymentCount
    : profile.paymentCount;

  return (
    <div className="el-page">
      <PageHeader
        title={s.fullName}
        subtitle={`${s.studentCode} • Enrolled ${formatDate(s.registeredAt)}`}
        actions={
          <>
            <Button
              variant="ghost"
              icon={<ArrowLeft size={14} />}
              onClick={() => navigate("/students")}
            >
              Back
            </Button>
            <Button variant="primary" icon={<Edit size={14} />}>
              Edit
            </Button>
          </>
        }
      />
      <div
        className="grid"
        style={{
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "var(--space-4)",
          marginBottom: "var(--space-6)",
        }}
      >
        <StatBlock
          label="Total Paid"
          value={totalPaid}
          format="currency"
          icon={<DollarSign size={18} />}
        />
        <StatBlock label="Total Owed" value={totalOwed} format="currency" />
        <StatBlock
          label="Outstanding"
          value={outstanding}
          format="currency"
          icon={<FileText size={18} />}
        />
        <StatBlock
          label="Payments"
          value={paymentCount}
          format="number"
          icon={<Calendar size={18} />}
        />
      </div>
      <div
        className="grid"
        style={{ gridTemplateColumns: "1fr 2fr", gap: "var(--space-4)" }}
      >
        <Card title="Student Information">
          <div className="flex flex-col gap-3">
            <div
              className="flex items-center gap-3"
              style={{ marginBottom: "var(--space-3)" }}
            >
              <div className="el-avatar el-avatar--xl">
                {s.fullName
                  .split(" ")
                  .map((n: string) => n[0])
                  .slice(0, 2)
                  .join("")}
              </div>
              <div>
                <div
                  style={{
                    fontSize: "var(--text-lg)",
                    fontWeight: "var(--weight-semibold)",
                  }}
                >
                  {s.fullName}
                </div>
                <Badge
                  color={
                    STUDENT_STATUS_COLORS[
                      s.status as keyof typeof STUDENT_STATUS_COLORS
                    ]
                  }
                >
                  {
                    STUDENT_STATUS_LABELS[
                      s.status as keyof typeof STUDENT_STATUS_LABELS
                    ]
                  }
                </Badge>
              </div>
            </div>
            <div className="el-divider" />
            <Info label="Date of Birth" value={formatDate(s.dateOfBirth)} />
            <Info
              label="Gender"
              value={
                <span style={{ textTransform: "capitalize" }}>{s.gender}</span>
              }
            />
            <Info
              label="Phone Numbers"
              value={s.phoneNumbers.join(", ") || "—"}
            />
            <Info
              label="Address"
              value={`${s.address.line1}, ${s.address.city}, ${s.address.country}`}
            />
            <Info label="Registered" value={formatDate(s.registeredAt)} />
          </div>
        </Card>
        <Card
          title="Payment Timeline"
          subtitle="Monthly payment status overview"
        >
          {timeline.length > 0 ? (
            <PaymentTimeline entries={timeline} />
          ) : (
            <EmptyState
              title="No payment history"
              description="This student has no invoices yet."
            />
          )}
          <div className="el-divider" />
          <div
            className="el-stat__label"
            style={{ marginBottom: "var(--space-3)" }}
          >
            Recent Payments
          </div>
          <div className="flex flex-col gap-2">
            {payments.slice(0, 5).map((p: any) => (
              <div
                key={p.id.value}
                className="flex items-center justify-between"
                style={{
                  padding: "var(--space-3)",
                  borderRadius: "var(--radius-md)",
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid var(--border-subtle)",
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: "var(--text-sm)",
                      fontWeight: "var(--weight-medium)",
                    }}
                  >
                    {p.receiptNumber}
                  </div>
                  <div
                    style={{
                      fontSize: "var(--text-xs)",
                      color: "var(--color-text-tertiary)",
                    }}
                  >
                    {relativeTime(p.paymentDate)} • {p.paymentMethod}
                  </div>
                </div>
                <div
                  style={{
                    fontWeight: "var(--weight-semibold)",
                    color: "var(--color-success)",
                  }}
                >
                  {formatDZD(p.amount)}
                </div>
              </div>
            ))}
            {payments.length === 0 && (
              <div
                style={{
                  padding: "var(--space-4)",
                  textAlign: "center",
                  color: "var(--color-text-tertiary)",
                }}
              >
                No payments recorded.
              </div>
            )}
          </div>
        </Card>
      </div>
      <div style={{ marginTop: "var(--space-6)" }}>
        <Card
          title="Excel Ledger Entry"
          subtitle="Master ledger row linked to this student (ETAT 20262027 equivalent)"
        >
          {le ? (
            <div className="flex flex-col gap-4">
              <div
                className="grid"
                style={{
                  gridTemplateColumns: "repeat(4, 1fr)",
                  gap: "var(--space-3)",
                }}
              >
                <LStat label="REMISE (col J)" value={le.remise} v="warning" />
                <LStat
                  label="DEVIS ANNUEL (col L)"
                  value={le.devisAnnuel}
                  v="primary"
                />
                <LStat
                  label="TOTAL VERSEMENTS (col P)"
                  value={le.totalVersements}
                  v="success"
                />
                <LStat
                  label="TOTAL*CREANCE (col Q)"
                  value={le.totalCreance}
                  v={le.totalCreance > 0 ? "danger" : "neutral"}
                />
              </div>
              <div
                className="grid"
                style={{
                  gridTemplateColumns: "repeat(7, 1fr)",
                  gap: "var(--space-2)",
                  fontSize: "var(--text-xs)",
                }}
              >
                {[
                  { c: "R", l: "FI", val: le.fi },
                  { c: "S", l: "V2", val: le.v2 },
                  { c: "T", l: "2V", val: le.altV2 },
                  { c: "U", l: "v3", val: le.v3 },
                  { c: "W", l: "1T", val: le.t1 },
                  { c: "X", l: "T2", val: le.t2 },
                  { c: "Y", l: "t3", val: le.t3 },
                ].map((x) => (
                  <div
                    key={x.c}
                    style={{
                      padding: "var(--space-2)",
                      borderRadius: "var(--radius-sm)",
                      background: "var(--color-surface-2, #2a2b2c)",
                      textAlign: "center",
                    }}
                  >
                    <div
                      style={{
                        color: "var(--color-text-tertiary)",
                        fontSize: 10,
                      }}
                    >
                      col {x.c}
                    </div>
                    <div style={{ fontWeight: "var(--weight-semibold)" }}>
                      {x.l}
                    </div>
                    <div
                      style={{ color: "var(--color-success)", marginTop: 2 }}
                    >
                      {formatDZD(x.val)}
                    </div>
                  </div>
                ))}
              </div>
              {le.destination && (
                <Info
                  label="Transport destination (col V)"
                  value={le.destination}
                />
              )}
              <div>
                <div
                  className="flex items-center gap-2"
                  style={{ marginBottom: "var(--space-2)" }}
                >
                  <MessageSquare
                    size={14}
                    style={{ color: "var(--color-text-tertiary)" }}
                  />
                  <div className="el-stat__label">
                    Audit Comments (column AM)
                  </div>
                  <Badge>{auditComments.length}</Badge>
                </div>
                {auditComments.length > 0 ? (
                  <div className="flex flex-col gap-2">
                    {auditComments.map((c: any) => (
                      <div
                        key={c.id.value}
                        style={{
                          padding: "var(--space-2) var(--space-3)",
                          borderRadius: "var(--radius-sm)",
                          background: "var(--color-surface-2, #2a2b2c)",
                          borderLeft: c.isClosed
                            ? "3px solid var(--color-success)"
                            : "3px solid var(--color-text-tertiary)",
                          fontSize: "var(--text-sm)",
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <code
                            style={{
                              fontFamily: "monospace",
                              color: "var(--color-text-secondary)",
                            }}
                          >
                            {c.rawText}
                          </code>
                          <div className="flex items-center gap-2">
                            {c.amount !== null && (
                              <span
                                style={{
                                  color: "var(--color-success)",
                                  fontWeight: "var(--weight-semibold)",
                                }}
                              >
                                {formatDZD(c.amount)}
                              </span>
                            )}
                            {c.batch && <Badge>{c.batch}</Badge>}
                            {c.isClosed && (
                              <Badge color="success">CLOSED</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div
                    style={{
                      padding: "var(--space-3)",
                      color: "var(--color-text-tertiary)",
                      fontSize: "var(--text-sm)",
                    }}
                  >
                    No audit comments on this ledger entry.
                  </div>
                )}
              </div>
            </div>
          ) : (
            <EmptyState
              icon={<BookOpen size={24} />}
              title="No linked ledger entry"
              description="This student is not yet linked to a master ledger row."
            />
          )}
        </Card>
      </div>
    </div>
  );
}
function Info({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between">
      <span
        style={{
          color: "var(--color-text-tertiary)",
          fontSize: "var(--text-sm)",
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontSize: "var(--text-sm)",
          fontWeight: "var(--weight-medium)",
        }}
      >
        {value}
      </span>
    </div>
  );
}
function LStat({
  label,
  value,
  v,
}: {
  label: string;
  value: number;
  v: "primary" | "success" | "danger" | "warning" | "neutral";
}) {
  const m: Record<string, string> = {
    primary: "var(--color-primary-blue)",
    success: "var(--color-success)",
    danger: "var(--color-danger)",
    warning: "var(--color-warning)",
    neutral: "var(--color-text-secondary)",
  };
  return (
    <div
      style={{
        padding: "var(--space-3)",
        borderRadius: "var(--radius-md)",
        background: "var(--color-surface-2, #2a2b2c)",
        borderTop: `2px solid ${m[v]}`,
      }}
    >
      <div
        style={{
          fontSize: "var(--text-xs)",
          color: "var(--color-text-tertiary)",
          textTransform: "uppercase",
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: "var(--text-lg)",
          fontWeight: "var(--weight-semibold)",
          color: m[v],
          marginTop: 4,
        }}
      >
        {formatDZD(value)}
      </div>
    </div>
  );
}
