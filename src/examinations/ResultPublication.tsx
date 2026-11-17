import { useMemo, useState } from 'react';
import { skipToken } from '@reduxjs/toolkit/query/react';
import {
  useAcademicSessionsQuery, useTermsQuery, useClassesQuery, useSubjectsQuery, useTeachersQuery,
  useTeachingAssignmentsQuery, useAssessmentConfigurationsQuery, useGradingSchemesQuery,
  useCalculatedResultsQuery, usePublishedResultsQuery, usePublishResultsMutation,
  useReopenPublishedResultMutation,
} from '../app/api';
import './result-publication.css';

export default function ResultPublication() {
  const [sessionId, setSessionId] = useState('');
  const [termId, setTermId] = useState('');
  const [classId, setClassId] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [teacherId, setTeacherId] = useState('');
  const [configId, setConfigId] = useState('');
  const [reason, setReason] = useState('');
  const [reopenId, setReopenId] = useState<string | null>(null);

  const { data: sessions } = useAcademicSessionsQuery();
  const { data: terms } = useTermsQuery(sessionId || undefined);
  const { data: classes } = useClassesQuery();
  const { data: subjects } = useSubjectsQuery();
  const { data: teachers } = useTeachersQuery();
  const { data: assignments } = useTeachingAssignmentsQuery(termId || undefined);
  const { data: schemes } = useGradingSchemesQuery();

  const assignment = useMemo(() => assignments?.data.find(a =>
    a.academicSessionId === sessionId && a.termId === termId && a.classId === classId &&
    a.subjectId === subjectId && a.teacherId === teacherId),
    [assignments, sessionId, termId, classId, subjectId, teacherId]);

  const { data: configs } = useAssessmentConfigurationsQuery(assignment?.id);
  const config = configs?.data.find(c => c.id === configId);
  const { data: calculated } = useCalculatedResultsQuery(
    assignment && config ? { teachingAssignmentId: assignment.id, assessmentConfigurationId: config.id } : skipToken
  );
  const { data: published } = usePublishedResultsQuery(
    assignment && config ? { teachingAssignmentId: assignment.id, assessmentConfigurationId: config.id } : skipToken
  );

  const [publish, publishState] = usePublishResultsMutation();
  const [reopen, reopenState] = useReopenPublishedResultMutation();
  const activeScheme = schemes?.data.find(s => s.active);

  const publicationCount = published?.data.length ?? 0;
  const calculatedCount = calculated?.data.length ?? 0;
  const allPublished = calculatedCount > 0 && publicationCount === calculatedCount;

  const doPublish = async () => {
    if (!assignment || !config) return;
    await publish({ teachingAssignmentId: assignment.id, assessmentConfigurationId: config.id }).unwrap();
  };

  const doReopen = async () => {
    if (!reopenId || !reason.trim()) return;
    await reopen({ id: reopenId, body: { reason: reason.trim() } }).unwrap();
    setReopenId(null);
    setReason('');
  };

  return (
    <main className="page publication-page">
      <header className="publication-hero">
        <div>
          <p className="eyebrow">EXAMINATIONS & ASSESSMENT</p>
          <h1>Result Publication</h1>
          <p className="muted">Move verified calculated results into the official student-facing record with a controlled publication trail.</p>
        </div>
        <div className="publication-status-card">
          <span>Publication status</span>
          <strong>{allPublished ? 'Published' : 'Ready for review'}</strong>
          <small>{publicationCount} of {calculatedCount} calculated results published</small>
        </div>
      </header>

      <section className="panel publication-filters">
        <div className="section-title"><div><h2>Result set</h2><p className="muted">Choose the exact teaching assignment and assessment configuration.</p></div></div>
        <div className="publication-form-grid">
          <label>Academic Session<select value={sessionId} onChange={e => { setSessionId(e.target.value); setTermId(''); setConfigId(''); }}><option value="">Select session</option>{sessions?.data.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></label>
          <label>Term<select value={termId} onChange={e => { setTermId(e.target.value); setConfigId(''); }} disabled={!sessionId}><option value="">Select term</option>{terms?.data.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}</select></label>
          <label>Class<select value={classId} onChange={e => { setClassId(e.target.value); setConfigId(''); }}><option value="">Select class</option>{classes?.data.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
          <label>Subject<select value={subjectId} onChange={e => { setSubjectId(e.target.value); setConfigId(''); }}><option value="">Select subject</option>{subjects?.data.map(s => <option key={s.id} value={s.id}>{s.code} — {s.name}</option>)}</select></label>
          <label>Teacher<select value={teacherId} onChange={e => { setTeacherId(e.target.value); setConfigId(''); }}><option value="">Select teacher</option>{teachers?.data.map(t => <option key={t.id} value={t.id}>{t.firstName} {t.lastName}</option>)}</select></label>
          <label>Assessment<select value={configId} onChange={e => setConfigId(e.target.value)} disabled={!assignment}><option value="">Select assessment</option>{configs?.data.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
        </div>
      </section>

      <section className="publication-layout">
        <section className="panel publication-review">
          <div className="section-title">
            <div><h2>Publication review</h2><p className="muted">Only calculated results are eligible. Publishing records who made the decision.</p></div>
            <button className="primary-button" onClick={doPublish} disabled={!assignment || !config || !calculatedCount || allPublished || publishState.isLoading}>{publishState.isLoading ? 'Publishing…' : allPublished ? 'Already published' : 'Publish results'}</button>
          </div>
          {!assignment || !config ? <div className="empty-state">Select a complete result set to review.</div> : !calculatedCount ? <div className="empty-state">No calculated results are available. Calculate and verify the result set first.</div> : (
            <div className="result-table-wrap"><table><thead><tr><th>Student</th><th>Admission No.</th><th>Total</th><th>Grade</th><th>Remark</th><th>Publication</th></tr></thead><tbody>
              {(calculated?.data ?? []).map(r => { const p = published?.data.find(x => x.enrollmentId === r.enrollmentId); return <tr key={r.id}><td><strong>{r.studentName}</strong></td><td>{r.admissionNumber}</td><td>{r.totalScore.toFixed(2)}</td><td><span className="grade-pill">{r.grade}</span></td><td>{r.remark}</td><td>{p ? <span className={`publication-pill ${p.status.toLowerCase()}`}>{p.status}</span> : <span className="publication-pill pending">PENDING</span>}</td></tr>; })}
            </tbody></table></div>
          )}
          {publishState.isError && <p className="error-text">The result set could not be published. Confirm all calculated results are valid and not already published.</p>}
        </section>

        <aside className="panel publication-side">
          <h2>Publication checklist</h2>
          <div className="check-item"><span className={calculatedCount ? 'check done' : 'check'}>✓</span><div><strong>Results calculated</strong><small>{calculatedCount} result(s)</small></div></div>
          <div className="check-item"><span className={activeScheme ? 'check done' : 'check'}>✓</span><div><strong>Active grading scheme</strong><small>{activeScheme?.name ?? 'Not configured'}</small></div></div>
          <div className="check-item"><span className={allPublished ? 'check done' : 'check'}>✓</span><div><strong>Publication complete</strong><small>{publicationCount}/{calculatedCount} published</small></div></div>
          <div className="notice">Published results become the student/parent-facing academic record. Reopening requires an explicit reason and is audited.</div>
        </aside>
      </section>

      <section className="panel published-history">
        <div className="section-title"><div><h2>Published result history</h2><p className="muted">Use reopening only for an authorized correction workflow.</p></div></div>
        {published?.data.length ? <div className="history-list">{published.data.map(p => <article key={p.id} className="history-row"><div><strong>{p.studentName}</strong><span>{p.admissionNumber} · {p.totalScore.toFixed(2)} · {p.grade}</span></div><div><span className={`publication-pill ${p.status.toLowerCase()}`}>{p.status}</span><small>Published {new Date(p.publishedAt).toLocaleString()} by {p.publishedBy}</small></div><button className="ghost-button" onClick={() => setReopenId(p.id)} disabled={p.status !== 'PUBLISHED'}>Reopen</button></article>)}</div> : <div className="empty-state">No published results for this result set yet.</div>}
      </section>

      {reopenId && <div className="modal-backdrop"><section className="modal-card"><h2>Reopen result</h2><p className="muted">Provide the reason for reopening. This action is recorded in the publication audit trail.</p><textarea value={reason} onChange={e => setReason(e.target.value)} placeholder="Reason for reopening" rows={4}/><div className="modal-actions"><button className="ghost-button" onClick={() => { setReopenId(null); setReason(''); }}>Cancel</button><button className="danger-button" onClick={doReopen} disabled={!reason.trim() || reopenState.isLoading}>{reopenState.isLoading ? 'Reopening…' : 'Reopen result'}</button></div></section></div>}
    </main>
  );
}
