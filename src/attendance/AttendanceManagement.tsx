import { FormEvent, useMemo, useState } from 'react';
import { useAcademicSessionsQuery, useEnrollmentsQuery, useStudentAttendanceQuery, useAttendanceSummaryQuery, useMarkAttendanceMutation, useTermsQuery, useClassesQuery } from '../app/api';
import type { AttendanceStatus } from '../app/api';
import './attendance.css';

const statuses: AttendanceStatus[] = ['PRESENT', 'ABSENT', 'LATE', 'EXCUSED'];

export default function AttendanceManagement() {
  const sessions = useAcademicSessionsQuery();
  const classes = useClassesQuery();
  const [sessionId, setSessionId] = useState('');
  const [termId, setTermId] = useState('');
  const [classId, setClassId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [enrollmentId, setEnrollmentId] = useState('');
  const [status, setStatus] = useState<AttendanceStatus>('PRESENT');
  const [note, setNote] = useState('');
  const terms = useTermsQuery(sessionId || undefined);
  const enrollments = useEnrollmentsQuery({ sessionId: sessionId || undefined, termId: termId || undefined, classId: classId || undefined });
  const attendance = useStudentAttendanceQuery({ sessionId: sessionId || undefined, termId: termId || undefined, classId: classId || undefined, date: date || undefined });
  const summary = useAttendanceSummaryQuery({ sessionId: sessionId || undefined, termId: termId || undefined, classId: classId || undefined });
  const [markAttendance, marking] = useMarkAttendanceMutation();
  const selectedEnrollment = useMemo(() => enrollments.data?.data.find(e => e.id === enrollmentId), [enrollments.data, enrollmentId]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!enrollmentId) return;
    await markAttendance({ enrollmentId, attendanceDate: date, status, note: note || undefined }).unwrap();
    setNote('');
  };

  return <main className="attendance page">
    <header className="attendance-header"><div><p className="eyebrow">ACADEMIC OPERATIONS</p><h1>Student Attendance</h1><p className="muted">Record attendance against the student's academic enrollment.</p></div></header>
    <section className="attendance-filters panel">
      <div><label>Academic session</label><select value={sessionId} onChange={e => { setSessionId(e.target.value); setTermId(''); }}><option value="">All sessions</option>{sessions.data?.data.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
      <div><label>Term</label><select value={termId} onChange={e => setTermId(e.target.value)}><option value="">All terms</option>{terms.data?.data.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}</select></div>
      <div><label>Class</label><select value={classId} onChange={e => setClassId(e.target.value)}><option value="">All classes</option>{classes.data?.data.map(c => <option key={c.id} value={c.id}>{c.code} — {c.name}</option>)}</select></div>
      <div><label>Date</label><input type="date" value={date} onChange={e => setDate(e.target.value)} /></div>
    </section>
    <section className="attendance-grid">
      <article className="attendance-card"><div className="card-heading"><div><p className="eyebrow">DAILY REGISTER</p><h2>Mark attendance</h2></div></div>
        <form className="compact-form" onSubmit={submit}>
          <select value={enrollmentId} onChange={e => setEnrollmentId(e.target.value)} required><option value="">Select enrolled student</option>{enrollments.data?.data.map(e => <option key={e.id} value={e.id}>{e.admissionNumber} — {e.studentName} · {e.classCode}</option>)}</select>
          {selectedEnrollment && <p className="selection-note">{selectedEnrollment.studentName} · {selectedEnrollment.academicSessionName} · {selectedEnrollment.termName} · {selectedEnrollment.className}</p>}
          <div className="status-options">{statuses.map(s => <label key={s} className={`status-option ${status === s ? 'selected' : ''}`}><input type="radio" name="attendance-status" checked={status === s} onChange={() => setStatus(s)} />{s}</label>)}</div>
          <textarea placeholder="Optional note" value={note} onChange={e => setNote(e.target.value)} rows={3} />
          <button type="submit" disabled={marking.isLoading}>{marking.isLoading ? 'Saving…' : 'Record attendance'}</button>
        </form>
      </article>
      <article className="attendance-card"><div className="card-heading"><div><p className="eyebrow">ATTENDANCE OVERVIEW</p><h2>Summary</h2></div><span className="rate">{summary.data?.data.attendanceRate ?? 0}%</span></div>
        <div className="summary-grid"><div><strong>{summary.data?.data.total ?? 0}</strong><span>Total</span></div><div><strong>{summary.data?.data.present ?? 0}</strong><span>Present</span></div><div><strong>{summary.data?.data.absent ?? 0}</strong><span>Absent</span></div><div><strong>{summary.data?.data.late ?? 0}</strong><span>Late</span></div><div><strong>{summary.data?.data.excused ?? 0}</strong><span>Excused</span></div></div>
      </article>
      <article className="attendance-card wide"><div className="card-heading"><div><p className="eyebrow">ATTENDANCE HISTORY</p><h2>{date}</h2></div><span className="count">{attendance.data?.data.length ?? 0}</span></div>
        <div className="attendance-list">{attendance.isLoading ? <p className="muted">Loading attendance…</p> : attendance.data?.data.length ? attendance.data.data.map(a => <div className="attendance-row" key={a.id}><div><strong>{a.studentName}</strong><small>{a.admissionNumber} · {a.classCode} · {a.termName}</small>{a.note && <small>{a.note}</small>}</div><span className={`attendance-badge ${a.status.toLowerCase()}`}>{a.status}</span></div>) : <p className="muted">No attendance recorded for this date and filter.</p>}</div>
      </article>
    </section>
  </main>;
}
