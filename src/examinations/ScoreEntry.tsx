import { useMemo, useState } from 'react';
import {
  useAcademicSessionsQuery, useTermsQuery, useClassesQuery, useSubjectsQuery, useTeachersQuery,
  useTeachingAssignmentsQuery, useAssessmentConfigurationsQuery, useEnrollmentsQuery,
  useStudentScoresQuery, useSaveStudentScoresBulkMutation, useSubmitStudentScoresMutation,
} from '../app/api';
import './score-entry.css';

export default function ScoreEntry() {
  const [sessionId, setSessionId] = useState('');
  const [termId, setTermId] = useState('');
  const [classId, setClassId] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [teacherId, setTeacherId] = useState('');
  const [configId, setConfigId] = useState('');
  const [componentId, setComponentId] = useState('');
  const [scores, setScores] = useState<Record<string, number | ''>>({});

  const { data: sessions } = useAcademicSessionsQuery();
  const { data: terms } = useTermsQuery(sessionId || undefined);
  const { data: classes } = useClassesQuery();
  const { data: subjects } = useSubjectsQuery();
  const { data: teachers } = useTeachersQuery();
  const { data: assignments } = useTeachingAssignmentsQuery(termId || undefined);
  const assignment = useMemo(() => assignments?.data.find(a => a.academicSessionId === sessionId && a.termId === termId && a.classId === classId && a.subjectId === subjectId && a.teacherId === teacherId), [assignments, sessionId, termId, classId, subjectId, teacherId]);
  const { data: configs } = useAssessmentConfigurationsQuery(assignment?.id);
  const config = configs?.data.find(c => c.id === configId) ?? configs?.data.find(c => c.active);
  const component = config?.components.find(c => c.id === componentId) ?? config?.components.find(c => c.active);
  const { data: enrollments, isLoading: enrollmentsLoading } = useEnrollmentsQuery(assignment ? { sessionId, termId, classId } : undefined);
  const { data: existing } = useStudentScoresQuery(assignment && config && component ? { teachingAssignmentId: assignment.id, assessmentConfigurationId: config.id, assessmentComponentId: component.id } : undefined);
  const [saveBulk, saveState] = useSaveStudentScoresBulkMutation();
  const [submitScores, submitState] = useSubmitStudentScoresMutation();

  const rows = (enrollments?.data ?? []).filter(e => e.status === 'ACTIVE');
  const existingMap = useMemo(() => new Map((existing?.data ?? []).map(s => [s.enrollmentId, s])), [existing]);

  const effectiveComponentId = component?.id ?? '';
  const getScore = (enrollmentId: string) => scores[enrollmentId] ?? existingMap.get(enrollmentId)?.score ?? '';
  const setScore = (id: string, value: string) => setScores(current => ({ ...current, [id]: value === '' ? '' : Number(value) }));
  const canWork = !!assignment && !!config?.active && !!component?.active && rows.length > 0;
  const draftRows = rows.filter(r => getScore(r.id) !== '');

  const save = async () => {
    if (!assignment || !config || !effectiveComponentId) return;
    await saveBulk({ scores: draftRows.map(row => ({ enrollmentId: row.id, teachingAssignmentId: assignment.id, assessmentConfigurationId: config.id, assessmentComponentId: effectiveComponentId, score: Number(getScore(row.id)) })) }).unwrap();
  };

  const submit = async () => {
    if (!assignment || !config) return;
    if (draftRows.length === 0) return;
    await save();
    await submitScores({ teachingAssignmentId: assignment.id, assessmentConfigurationId: config.id }).unwrap();
  };

  return <main className="page score-page">
    <header className="score-header"><div><p className="eyebrow">EXAMINATIONS & ASSESSMENT</p><h1>Teacher Score Entry</h1><p className="muted">Enter raw scores against the existing student enrollment and assessment configuration.</p></div><div className="score-pill">{component ? `${component.name} · ${component.maxScore} marks` : 'Select an assessment component'}</div></header>
    <section className="score-panel panel">
      <div className="score-filters">
        <label>Academic Session<select value={sessionId} onChange={e => { setSessionId(e.target.value); setTermId(''); setConfigId(''); }}><option value="">Select session</option>{sessions?.data.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></label>
        <label>Term<select value={termId} onChange={e => { setTermId(e.target.value); setConfigId(''); }} disabled={!sessionId}><option value="">Select term</option>{terms?.data.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}</select></label>
        <label>Class<select value={classId} onChange={e => { setClassId(e.target.value); setConfigId(''); }}><option value="">Select class</option>{classes?.data.map(c => <option key={c.id} value={c.id}>{c.name} ({c.code})</option>)}</select></label>
        <label>Subject<select value={subjectId} onChange={e => { setSubjectId(e.target.value); setConfigId(''); }}><option value="">Select subject</option>{subjects?.data.map(s => <option key={s.id} value={s.id}>{s.name} ({s.code})</option>)}</select></label>
        <label>Teacher<select value={teacherId} onChange={e => { setTeacherId(e.target.value); setConfigId(''); }}><option value="">Select teacher</option>{teachers?.data.map(t => <option key={t.id} value={t.id}>{t.firstName} {t.lastName}</option>)}</select></label>
        <label>Assessment<select value={config?.id ?? configId} onChange={e => { setConfigId(e.target.value); setComponentId(''); }} disabled={!assignment}><option value="">Select assessment</option>{configs?.data.filter(c => c.active).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
        <label>Component<select value={component?.id ?? componentId} onChange={e => setComponentId(e.target.value)} disabled={!config}><option value="">Select component</option>{config?.components.filter(c => c.active).map(c => <option key={c.id} value={c.id}>{c.name} · {c.maxScore}</option>)}</select></label>
      </div>
      {!assignment && <div className="score-hint">Select a session, term, class, subject and teacher that have an existing teaching assignment.</div>}
      {assignment && !config && <div className="score-hint">Create an active assessment configuration for this teaching assignment first.</div>}
      {assignment && config && !component && <div className="score-hint">Select the component whose raw scores you want to enter.</div>}
    </section>

    {canWork && <section className="panel score-workspace">
      <div className="workspace-head"><div><h2>{subjectId ? subjects?.data.find(s => s.id === subjectId)?.name : 'Scores'} · {classes?.data.find(c => c.id === classId)?.name}</h2><p className="muted">{component?.name} · Maximum {component?.maxScore}</p></div><div className="workspace-actions"><button className="secondary" onClick={save} disabled={saveState.isLoading || draftRows.length === 0}>{saveState.isLoading ? 'Saving…' : 'Save draft'}</button><button onClick={submit} disabled={saveState.isLoading || submitState.isLoading || draftRows.length === 0}>{submitState.isLoading ? 'Submitting…' : 'Submit scores'}</button></div></div>
      <div className="score-table-wrap"><table className="score-table"><thead><tr><th>#</th><th>Student</th><th>Admission No.</th><th>Score / {component?.maxScore}</th><th>Status</th></tr></thead><tbody>{rows.map((row, index) => { const value = getScore(row.id); const saved = existingMap.get(row.id); return <tr key={row.id}><td>{index + 1}</td><td><strong>{row.studentName}</strong></td><td>{row.admissionNumber}</td><td><input className="score-input" type="number" min="0" max={component?.maxScore} step="0.01" value={value} onChange={e => setScore(row.id, e.target.value)} /></td><td><span className={`score-status ${saved?.status?.toLowerCase() ?? 'new'}`}>{saved?.status ?? 'NEW'}</span></td></tr>; })}</tbody></table></div>
      {saveState.isError && <p className="error-text">Some scores could not be saved. Check the values and try again.</p>}
      {submitState.isError && <p className="error-text">Scores could not be submitted.</p>}
    </section>}
    {assignment && enrollmentsLoading && <section className="panel"><p>Loading enrolled students…</p></section>}
    {assignment && !enrollmentsLoading && rows.length === 0 && <section className="panel empty-state">No active students are enrolled in this class for the selected term.</section>}
  </main>;
}
