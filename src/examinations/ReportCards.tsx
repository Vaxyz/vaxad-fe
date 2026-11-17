import { useMemo, useState } from 'react';
import {
  useEnrollmentsQuery,
  useGenerateReportCardMutation,
  usePublishReportCardMutation,
  useReopenReportCardMutation,
  useStudentReportCardsQuery,
} from '../app/api';
import './report-cards.css';

export default function ReportCards() {
  const { data: enrollments } = useEnrollmentsQuery();
  const [enrollmentId, setEnrollmentId] = useState('');
  const [teacherComment, setTeacherComment] = useState('');
  const [principalComment, setPrincipalComment] = useState('');
  const [studentId, setStudentId] = useState('');
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [reopenReason, setReopenReason] = useState('');

  const selectedEnrollment = useMemo(() => enrollments?.data.find(e => e.id === enrollmentId), [enrollments, enrollmentId]);
  const { data: cards, isFetching } = useStudentReportCardsQuery(studentId, { skip: !studentId });
  const [generate, generateState] = useGenerateReportCardMutation();
  const [publish, publishState] = usePublishReportCardMutation();
  const [reopen, reopenState] = useReopenReportCardMutation();

  const generateCard = async () => {
    if (!enrollmentId) return;
    const result = await generate({
      enrollmentId,
      teacherComment: teacherComment.trim() || undefined,
      principalComment: principalComment.trim() || undefined,
    }).unwrap();
    setStudentId(result.data.studentId);
    setSelectedCard(result.data.id);
  };

  const current = cards?.data.find(c => c.id === selectedCard) ?? cards?.data[0];

  return <main className="page report-cards-page">
    <header className="report-card-hero">
      <div><p className="eyebrow">EXAMINATIONS & ASSESSMENT</p><h1>Report Cards</h1><p className="muted">Generate, review and publish term report cards from the official published results and student attendance record.</p></div>
      <div className="report-card-kpi"><span>Student</span><strong>{selectedEnrollment?.studentName ?? current?.studentName ?? 'Select a student'}</strong><small>{selectedEnrollment?.termName ?? current?.termName ?? 'Term report card'}</small></div>
    </header>

    <section className="panel report-card-generator">
      <div className="section-title"><div><h2>Generate report card</h2><p className="muted">Only published subject results for the selected enrollment are included.</p></div></div>
      <div className="report-card-form">
        <label>Enrollment<select value={enrollmentId} onChange={e => { setEnrollmentId(e.target.value); const selected = enrollments?.data.find(x => x.id === e.target.value); setStudentId(selected?.studentId ?? ''); }}><option value="">Select student / term</option>{enrollments?.data.map(e => <option key={e.id} value={e.id}>{e.studentName} · {e.admissionNumber} · {e.termName}</option>)}</select></label>
        <label>Teacher comment<textarea value={teacherComment} onChange={e => setTeacherComment(e.target.value)} rows={3} placeholder="Academic comment" /></label>
        <label>Principal comment<textarea value={principalComment} onChange={e => setPrincipalComment(e.target.value)} rows={3} placeholder="Principal / head-of-school comment" /></label>
        <button className="primary-button" onClick={generateCard} disabled={!enrollmentId || generateState.isLoading}>{generateState.isLoading ? 'Generating…' : 'Generate report card'}</button>
      </div>
      {generateState.isError && <p className="error-text">The report card could not be generated. Confirm that the selected student has published results for this term.</p>}
    </section>

    <section className="report-card-layout">
      <section className="panel report-card-list">
        <div className="section-title"><div><h2>Published report cards</h2><p className="muted">Select a student above to view available published cards.</p></div></div>
        {isFetching ? <div className="empty-state">Loading report cards…</div> : !cards?.data.length ? <div className="empty-state">No published report cards are available for the selected student.</div> : <div className="card-list">{cards.data.map(card => <button key={card.id} className={`card-list-item ${current?.id === card.id ? 'selected' : ''}`} onClick={() => setSelectedCard(card.id)}><span><strong>{card.termName}</strong><small>{card.academicSessionName} · {card.className}</small></span><span><b>{card.averageScore.toFixed(2)}%</b><small>{card.totalSubjects} subjects</small></span></button>)}</div>}
      </section>

      {current && <section className="panel report-card-preview">
        <div className="report-card-toolbar"><div><span className={`status-pill ${current.status.toLowerCase()}`}>{current.status}</span><h2>{current.studentName}</h2><p className="muted">{current.admissionNumber} · {current.className} · {current.termName}</p></div><div className="toolbar-actions"><button className="ghost-button" onClick={() => window.print()}>Print / PDF</button>{current.status === 'GENERATED' && <button className="primary-button" onClick={() => publish(current.id)} disabled={publishState.isLoading}>{publishState.isLoading ? 'Publishing…' : 'Publish'}</button>}{current.status === 'PUBLISHED' && <button className="danger-button" onClick={() => { const reason = window.prompt('Reason for reopening'); if (reason?.trim()) { setReopenReason(reason.trim()); reopen({ id: current.id, body: { reason: reason.trim() } }); } }}>{reopenState.isLoading ? 'Reopening…' : 'Reopen'}</button>}</div></div>
        <div className="report-card-summary"><div><span>Subjects</span><strong>{current.totalSubjects}</strong></div><div><span>Total score</span><strong>{current.totalScore.toFixed(2)}</strong></div><div><span>Average</span><strong>{current.averageScore.toFixed(2)}%</strong></div><div><span>Present</span><strong>{current.presentDays}</strong></div><div><span>Absent</span><strong>{current.absentDays}</strong></div><div><span>Late</span><strong>{current.lateDays}</strong></div><div><span>Excused</span><strong>{current.excusedDays}</strong></div></div>
        <div className="result-table-wrap"><table><thead><tr><th>Subject</th><th>Score</th><th>Grade</th><th>Remark</th></tr></thead><tbody>{current.subjects.map(s => <tr key={s.id}><td><strong>{s.subjectName}</strong><small>{s.subjectCode}</small></td><td>{s.totalScore.toFixed(2)}</td><td><span className="grade-pill">{s.grade}</span></td><td>{s.remark}</td></tr>)}</tbody></table></div>
        <div className="comment-grid"><article><h3>Teacher comment</h3><p>{current.teacherComment || 'No teacher comment recorded.'}</p></article><article><h3>Principal comment</h3><p>{current.principalComment || 'No principal comment recorded.'}</p></article></div>
        {reopenReason && <p className="muted">Reopen request submitted with reason: {reopenReason}</p>}
      </section>}
    </section>
  </main>;
}
