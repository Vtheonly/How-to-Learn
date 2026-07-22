import { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, GraduationCap } from 'lucide-react';
import { Card, Button, Badge, EmptyState, Modal } from '../components/common';
import { PageHeader } from '../components/common/PageHeader';
import { DataGrid, Column } from '../components/data/DataGrid';
import toast from 'react-hot-toast';

interface ClassRow {
  id: string;
  grade: string;
  section: string;
  name: string;
  classroom?: string;
  capacity: number;
  enrolledCount: number;
}

export function Classes() {
  const [classes, setClasses] = useState<ClassRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [activeAcademicYearId, setActiveAcademicYearId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const [rows, years] = await Promise.all([
        window.elImtiyaz.classes.list(),
        window.elImtiyaz.academicYears.list()
      ]);
      setClasses((rows as any[]).map((c) => ({
        id: c.id.value || c.id,
        grade: c.grade,
        section: c.section,
        name: c.name,
        classroom: c.classroom,
        capacity: c.capacity,
        enrolledCount: c.enrolledCount
      })));
      const activeY = (years as any[]).find(y => y.isActive);
      if (activeY) setActiveAcademicYearId(activeY.id.value || activeY.id);
    } catch {
      toast.error("Failed to load school classes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const columns: Column<ClassRow>[] = [
    { key: 'name', header: 'Class Name', sortable: true, render: (r) => <strong>{r.name}</strong> },
    { key: 'grade', header: 'Grade', width: 140 },
    { key: 'section', header: 'Section', width: 120 },
    { key: 'classroom', header: 'Room', width: 120, render: (r) => r.classroom ?? '—' },
    {
      key: 'enrolledCount',
      header: 'Enrolment',
      width: 180,
      render: (r) => {
        const pct = (r.enrolledCount / r.capacity) * 100;
        const tone = pct >= 100 ? 'danger' : pct >= 80 ? 'warning' : 'success';
        return (
          <div className="flex items-center gap-2">
            <div className="el-progress" style={{ flex: 1, maxWidth: 80 }}>
              <div className="el-progress__fill" style={{ width: `${Math.min(pct, 100)}%` }} />
            </div>
            <Badge tone={tone}>{r.enrolledCount}/{r.capacity}</Badge>
          </div>
        );
      }
    },
    {
      key: 'actions',
      header: '',
      width: 80,
      render: () => (
        <div className="flex gap-1">
          <button className="el-btn el-btn--ghost el-btn--icon el-btn--sm"><Edit size={14} /></button>
          <button className="el-btn el-btn--ghost el-btn--icon el-btn--sm"><Trash2 size={14} /></button>
        </div>
      )
    }
  ];

  return (
    <div className="el-page">
      <PageHeader
        title="Classes"
        subtitle={`${classes.length} classes`}
        actions={
          <Button variant="primary" icon={<Plus size={14} />} onClick={() => setShowModal(true)}>
            New Class
          </Button>
        }
      />

      <Card>
        <DataGrid
          columns={columns}
          data={classes}
          rowKey={(r) => r.id}
          loading={loading}
          emptyState={<EmptyState icon={<GraduationCap size={24} />} title="No classes" description="Create your first class to get started." />}
        />
      </Card>

      <NewClassModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onSaved={load}
        activeYearId={activeAcademicYearId}
      />
    </div>
  );
}

function NewClassModal({ open, onClose, onSaved, activeYearId }: { open: boolean; onClose: () => void; onSaved: () => void, activeYearId: string | null }) {
  const [grade, setGrade] = useState('');
  const [section, setSection] = useState('');
  const [capacity, setCapacity] = useState('30');
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!grade || !section) return;
    setSaving(true);
    try {
      await window.elImtiyaz.classes.create({
        grade,
        section,
        capacity: parseInt(capacity, 10),
        academicYearId: activeYearId || undefined
      });
      toast.success("Successfully registered new class!");
      onSaved();
      onClose();
      setGrade(''); setSection(''); setCapacity('30');
    } catch (err) {
      toast.error(`Error saving class: ${(err as Error).message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="New Class"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button variant="primary" onClick={submit} disabled={!grade || !section || saving}>
            {saving ? 'Creating...' : 'Create'}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <div>
          <label className="el-stat__label" style={{ display: 'block', marginBottom: 6 }}>Grade</label>
          <input className="el-input" style={{ width: '100%' }} placeholder="e.g. Grade 1" value={grade} onChange={(e) => setGrade(e.target.value)} />
        </div>
        <div>
          <label className="el-stat__label" style={{ display: 'block', marginBottom: 6 }}>Section</label>
          <input className="el-input" style={{ width: '100%' }} placeholder="e.g. A" value={section} onChange={(e) => setSection(e.target.value)} />
        </div>
        <div>
          <label className="el-stat__label" style={{ display: 'block', marginBottom: 6 }}>Capacity</label>
          <input type="number" className="el-input" style={{ width: '100%' }} value={capacity} onChange={(e) => setCapacity(e.target.value)} />
        </div>
      </div>
    </Modal>
  );
}