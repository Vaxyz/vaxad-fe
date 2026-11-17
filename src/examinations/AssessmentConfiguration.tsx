import { useMemo, useState } from 'react';
import type { AssessmentComponentRequest, AssessmentComponentType, CreateAssessmentConfigurationRequest } from '../app/api';
import { useAcademicSessionsQuery, useTermsQuery, useClassesQuery, useSubjectsQuery, useTeachersQuery, useTeachingAssignmentsQuery, useAssessmentConfigurationsQuery, useCreateAssessmentConfigurationMutation, useDeleteAssessmentConfigurationMutation, useActivateAssessmentConfigurationMutation } from '../app/api';
import './assessment.css';

const types: AssessmentComponentType[] = ['CONTINUOUS_ASSESSMENT', 'EXAMINATION', 'PROJECT', 'PRACTICAL', 'OTHER'];

export default function AssessmentConfiguration() {
  const [sessionId, setSessionId] = useState(''); const [termId, setTermId] = useState(''); const [classId, setClassId] = useState(''); const [subjectId, setSubjectId] = useState(''); const [teacherId, setTeacherId] = useState('');
  const [name, setName] = useState('Standard Assessment');
  const [components, setComponents] = useState<AssessmentComponentRequest[]>([
    { name: 'Continuous Assessment', type: 'CONTINUOUS_ASSESSMENT', maxScore: 40, weight: 40, sequence: 1 },
    { name: 'Examination', type: 'EXAMINATION', maxScore: 60, weight: 60, sequence: 2 },
  ]);
  const { data: sessions } = useAcademicSessionsQuery(); const { data: terms } = useTermsQuery(sessionId || undefined); const { data: classes } = useClassesQuery(); const { data: subjects } = useSubjectsQuery(); const { data: teachers } = useTeachersQuery();
  const { data: assignments } = useTeachingAssignmentsQuery(termId || undefined);
  const selectedAssignment = useMemo(() => assignments?.data.find(a => a.academicSessionId === sessionId && a.termId === termId && a.classId === classId && a.subjectId === subjectId && a.teacherId === teacherId), [assignments, sessionId, termId, classId, subjectId, teacherId]);
  const { data: configs, isLoading } = useAssessmentConfigurationsQuery(selectedAssignment?.id);
  const [createConfig, createState] = useCreateAssessmentConfigurationMutation(); const [deleteConfig] = useDeleteAssessmentConfigurationMutation(); const [activateConfig] = useActivateAssessmentConfigurationMutation();
  const totalWeight = components.reduce((sum, c) => sum + Number(c.weight || 0), 0);
  const canSave = !!selectedAssignment && !!name.trim() && components.length > 0 && totalWeight === 100 && components.every(c => c.name.trim() && Number(c.maxScore) > 0 && Number(c.weight) > 0);
  const updateComponent = (index: number, patch: Partial<AssessmentComponentRequest>) => setComponents(current => current.map((c, i) => i === index ? { ...c, ...patch } : c));
  const addComponent = () => setComponents(current => [...current, { name: '', type: 'OTHER', maxScore: 100, weight: 1, sequence: current.length + 1 }]);
  const removeComponent = (index: number) => setComponents(current => current.filter((_, i) => i !== index).map((c, i) => ({ ...c, sequence: i + 1 })));
  const submit = async (e: React.FormEvent) => { e.preventDefault(); if (!selectedAssignment || !canSave) return; const body: CreateAssessmentConfigurationRequest = { teachingAssignmentId: selectedAssignment.id, name: name.trim(), components: components.map(c => ({ ...c, maxScore: Number(c.maxScore), weight: Number(c.weight) })) }; await createConfig(body).unwrap(); };
  return <main className="page exam-page">
    <header className="exam-header"><div><p className="eyebrow">EXAMINATIONS & ASSESSMENT</p><h1>Assessment Configuration</h1><p className="muted">Define how a subject is assessed before scores are entered.</p></div></header>
    <section className="exam-grid">
      <form className="panel assessment-form" onSubmit={submit}><h2>Assessment scheme</h2>
        <div className="form-grid">
          <label>Academic Session<select value={sessionId} onChange={e => { setSessionId(e.target.value); setTermId(''); }}><option value="">Select session</option>{sessions?.data.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></label>
          <label>Term<select value={termId} onChange={e => setTermId(e.target.value)} disabled={!sessionId}><option value="">Select term</option>{terms?.data.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}</select></label>
          <label>Class<select value={classId} onChange={e => setClassId(e.target.value)}><option value="">Select class</option>{classes?.data.map(c => <option key={c.id} value={c.id}>{c.name} ({c.code})</option>)}</select></label>
          <label>Subject<select value={subjectId} onChange={e => setSubjectId(e.target.value)}><option value="">Select subject</option>{subjects?.data.map(s => <option key={s.id} value={s.id}>{s.name} ({s.code})</option>)}</select></label>
          <label>Teacher<select value={teacherId} onChange={e => setTeacherId(e.target.value)}><option value="">Select teacher</option>{teachers?.data.map(t => <option key={t.id} value={t.id}>{t.firstName} {t.lastName} ({t.staffNumber})</option>)}</select></label>
          <label>Configuration name<input value={name} onChange={e => setName(e.target.value)} /></label>
        </div>
        <div className="component-head"><h3>Components</h3><span className={totalWeight === 100 ? 'weight-ok' : 'weight-warning'}>{totalWeight}% weight</span></div>
        <div className="component-list">{components.map((component, index) => <div className="component-row" key={index}>
          <input value={component.name} onChange={e => updateComponent(index, { name: e.target.value })} placeholder="Component name" />
          <select value={component.type} onChange={e => updateComponent(index, { type: e.target.value as AssessmentComponentType })}>{types.map(t => <option key={t} value={t}>{t.replaceAll('_', ' ')}</option>)}</select>
          <input type="number" min="1" value={component.maxScore} onChange={e => updateComponent(index, { maxScore: Number(e.target.value) })} />
          <input type="number" min="1" max="100" value={component.weight} onChange={e => updateComponent(index, { weight: Number(e.target.value) })} />
          <button type="button" className="danger-link" onClick={() => removeComponent(index)} disabled={components.length === 1}>Remove</button>
        </div>)}</div>
        <div className="form-actions"><button type="button" className="secondary" onClick={addComponent}>+ Add component</button><button type="submit" disabled={!canSave || createState.isLoading}>{createState.isLoading ? 'Saving…' : 'Create configuration'}</button></div>
        {createState.isError && <p className="error-text">Could not create configuration. Check the teaching assignment and component weights.</p>}
        {!selectedAssignment && <p className="hint">Select a session, term, class, subject and teacher that already have a teaching assignment.</p>}
      </form>
      <section className="panel"><div className="section-title"><div><h2>Configured assessments</h2><p className="muted">{selectedAssignment ? 'For the selected teaching assignment.' : 'Select a teaching assignment to view its configuration.'}</p></div></div>
        {isLoading && <p>Loading…</p>}{selectedAssignment && configs?.data.length === 0 && <div className="empty-state">No assessment configuration yet.</div>}
        <div className="config-list">{configs?.data.map(config => <article className="config-card" key={config.id}><div><strong>{config.name}</strong><span className={config.active ? 'badge active' : 'badge'}>{config.active ? 'ACTIVE' : 'INACTIVE'}</span></div><p>{config.components.map(c => `${c.name} ${c.weight}%`).join(' · ')}</p><div className="config-actions">{!config.active && <button className="secondary" onClick={() => activateConfig(config.id)}>Activate</button>}<button className="danger-link" onClick={() => deleteConfig(config.id)}>Delete</button></div></article>)}</div>
      </section>
    </section>
  </main>;
}
