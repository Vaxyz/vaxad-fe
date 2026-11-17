import { useMemo, useState } from 'react';
import {
  useAcademicSessionsQuery, useTermsQuery, useClassesQuery, useSubjectsQuery, useTeachersQuery,
  useTeachingAssignmentsQuery, useAssessmentConfigurationsQuery, useStudentScoresQuery,
  useApproveStudentScoresMutation, useReturnStudentScoresMutation,
} from '../app/api';
import './score-approval.css';

export default function ScoreApproval() {
  const [sessionId, setSessionId] = useState('');
  const [termId, setTermId] = useState('');
  const [classId, setClassId] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [teacherId, setTeacherId] = useState('');
  const [configId, setConfigId] = useState('');
  const [comment, setComment] = useState('');

  const { data: sessions } = useAcademicSessionsQuery();
  const { data: terms } = useTermsQuery(sessionId || undefined);
  const { data: classes } = useClassesQuery();
  const { data: subjects } = useSubjectsQuery();
  const { data: teachers } = useTeachersQuery();
  const { data: assignments } = useTeachingAssignmentsQuery(termId || undefined);
  const assignment = useMemo(() => assignments?.data.find(a => a.academicSessionId === sessionId && a.termId === termId && a.classId === classId && a.subjectId === subjectId && a.teacherId === teacherId), [assignments, sessionId, termId, classId, subjectId, teacherId]);
  const { data: configs } = useAssessmentConfigurationsQuery(assignment?.id);
  const config = configs?.data.find(c => c.id === configId);
  const { data: submitted } = useStudentScoresQuery(assignment && config ? { teachingAssignmentId: assignment.id, assessmentConfigurationId: config.id, status: 'SUBMITTED' } : undefined);
  const { data: returned } = useStudentScoresQuery(assignment && config ? { teachingAssignmentId: assignment.id, assessmentConfigurationId: config.id, status: 'RETURNED' } : undefined);
  const { data: approved } = useStudentScoresQuery(assignment && config ? { teachingAssignmentId: assignment.id, assessmentConfigurationId: config.id, status: 'APPROVED' } : undefined);
  const [approve, approveState] = useApproveStudentScoresMutation();
  const [returnScores, returnState] = useReturnStudentScoresMutation();

  const scores = submitted?.data ?? [];
  const grouped = useMemo(() => {
    const map = new Map<string, { name: string; admission: string; components: Record<string, number>; total: number; max: number }>();
    scores.forEach(s => {
      const row = map.get(s.enrollmentId) ?? { name: s.studentName, admission: s.admissionNumber, components: {}, total: 0, max: 0 };
      row.components[s.componentName] = s.score;
      row.total += s.score;
      row.max += s.maxScore;
      map.set(s.enrollmentId, row);
    });
    return [...map.values()];
  }, [scores]);

  const review = async (action: 'approve' | 'return') => {
    if (!assignment || !config || !comment.trim()) return;
    const body = { teachingAssignmentId: assignment.id, assessmentConfigurationId: config.id, body: { comment: comment.trim() } };
    if (action === 'approve') await approve(body).unwrap(); else await returnScores(body).unwrap();
    setComment('');
  };

  return <main className="page approval-page">
    <header className="approval-header">
      <div><p className="eyebrow">EXAMINATIONS & ASSESSMENT</p><h1>Score Approval</h1><p className="muted">Review submitted scores before they become official results.</p></div>
      <div className="approval-badge">{submitted?.data.length ?? 0} submitted scores</div>
    </header>
    <section className="panel approval-filters">
      <label>Academic Session<select value={sessionId} onChange={e => { setSessionId(e.target.value); setTermId(''); setConfigId(''); }}><option value="">Select session</option>{sessions?.data.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></label>
      <label>Term<select value={termId} onChange={e => { setTermId(e.target.value); setConfigId(''); }} disabled={!sessionId}><option value="">Select term</option>{terms?.data.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}</select></label>
      <label>Class<select value={classId} onChange={e => { setClassId(e.target.value); setConfigId(''); }}><option value="">Select class</option>{classes?.data.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
      <label>Subject<select value={subjectId} onChange={e => { setSubjectId(e.target.value); setConfigId(''); }}><option value="">Select subject</option>{subjects?.data.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></label>
      <label>Teacher<select value={teacherId} onChange={e => { setTeacherId(e.target.value); setConfigId(''); }}><option value="">Select teacher</option>{teachers?.data.map(t => <option key={t.id} value={t.id}>{t.firstName} {t.lastName}</option>)}</select></label>
      <label>Assessment<select value={configId} onChange={e => setConfigId(e.target.value)} disabled={!assignment}><option value="">Select assessment</option>{configs?.data.filter(c => c.active).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
    </section>

    {assignment && config && <>
      <section className="approval-summary">
        <div><span>Submitted</span><strong>{scores.length}</strong></div><div><span>Returned</span><strong>{returned?.data.length ?? 0}</strong></div><div><span>Approved</span><strong>{approved?.data.length ?? 0}</strong></div><div><span>Components</span><strong>{config.components.filter(c => c.active).length}</strong></div>
      </section>
      <section className="panel approval-workspace">
        <div className="workspace-head"><div><h2>{subjects?.data.find(s => s.id === subjectId)?.name} · {classes?.data.find(c => c.id === classId)?.name}</h2><p className="muted">{config.name} · Review all submitted component scores together.</p></div></div>
        {grouped.length === 0 ? <div className="empty-state">No submitted scores are awaiting approval.</div> : <div className="approval-table-wrap"><table><thead><tr><th>Student</th><th>Admission No.</th>{config.components.filter(c => c.active).map(c => <th key={c.id}>{c.name}</th>)}<th>Total</th></tr></thead><tbody>{grouped.map(row => <tr key={row.admission}><td><strong>{row.name}</strong></td><td>{row.admission}</td>{config.components.filter(c => c.active).map(c => <td key={c.id}>{row.components[c.name] ?? '—'}</td>)}<td><strong>{row.total} / {row.max}</strong></td></tr>)}</tbody></table></div>}
        {grouped.length > 0 && <div className="review-actions"><textarea value={comment} onChange={e => setComment(e.target.value)} placeholder="Enter an approval or correction comment…" rows={3} /><div><button className="secondary" onClick={() => review('return')} disabled={!comment.trim() || returnState.isLoading || approveState.isLoading}>Return for correction</button><button onClick={() => review('approve')} disabled={!comment.trim() || approveState.isLoading || returnState.isLoading}>{approveState.isLoading ? 'Approving…' : 'Approve scores'}</button></div></div>}
        {(approveState.isError || returnState.isError) && <p className="error-text">The review action could not be completed. Check your permissions and the submitted score state.</p>}
      </section>
    </>}
    {!assignment && <section className="panel empty-state">Select an academic context and teaching assignment to review submitted scores.</section>}
  </main>;
}
