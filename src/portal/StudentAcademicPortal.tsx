import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAppSelector } from '../app/hooks';
import { isStudent } from '../security/roles';
import { useAcademicPortalStudentsQuery, useAcademicPortalWorkspaceQuery } from '../app/api';
import './student-academic-portal.css';

export default function StudentAcademicPortal(){
  const navigate=useNavigate();
  const user = useAppSelector(state => state.auth.user);
  const studentAccount = isStudent(user?.roles);
  const {data:studentsResponse,isLoading:studentsLoading,error:studentsError}=useAcademicPortalStudentsQuery();
  const students=studentsResponse?.data??[];
  const [selectedId,setSelectedId]=useState('');
  const activeId=selectedId||students[0]?.id||'';
  const {data:workspaceResponse,isLoading:workspaceLoading,error:workspaceError}=useAcademicPortalWorkspaceQuery(activeId,{skip:!activeId});
  const w=workspaceResponse?.data;
  const s=w?.summary;
  return <section className="academic-portal-page">
    <div className="academic-portal-hero"><div><span className="eyebrow">STUDENT / PARENT PORTAL</span><h1>Academic Experience</h1><p>View the academic information available to this student, including results, report cards, attendance, timetable and school announcements.</p></div><button type="button" onClick={()=>navigate(`/portal/payments?studentId=${s?.studentId ?? ""}`)}>Make school-fee payment</button></div>
    {studentsError&&<div className="academic-alert">Unable to load the students available to this account.</div>}
    {!studentAccount && <div className="academic-portal-card student-picker"><label>Student<select value={activeId} onChange={e=>setSelectedId(e.target.value)} disabled={studentsLoading||students.length===0}><option value="">Select student</option>{students.map(x=><option key={x.id} value={x.id}>{x.firstName} {x.lastName} — {x.admissionNumber}</option>)}</select></label></div>}
    {workspaceError&&<div className="academic-alert">You are not authorized to view this student's academic workspace.</div>}
    {workspaceLoading&&<div className="academic-portal-card">Loading academic workspace…</div>}
    {s&&<>
      <div className="academic-student-card"><div><strong>{s.studentName}</strong><span>{s.admissionNumber}</span></div><div><strong>{s.className}</strong><span>{s.academicSessionName} · {s.termName}</span></div></div>
      <div className="academic-metrics"><div><span>Attendance</span><strong>{s.attendanceRate}%</strong><small>{s.presentDays} present / {s.attendanceTotal} recorded</small></div><div><span>Published results</span><strong>{w.results.length}</strong><small>Available to this account</small></div><div><span>Report cards</span><strong>{w.reportCards.length}</strong><small>Published report cards</small></div><div><span>Timetable entries</span><strong>{w.timetable.length}</strong><small>Published class timetable</small></div></div>
      <div className="academic-grid">
        <div className="academic-portal-card"><div className="card-head"><h2>Results</h2><span>{w.results.length}</span></div><div className="result-list">{w.results.length===0?<p className="muted">No published results are available.</p>:w.results.slice(0,8).map(r=><div className="result-row" key={r.id}><div><strong>{r.studentName}</strong><span>{r.remark}</span></div><b>{r.totalScore} · {r.grade}</b></div>)}</div></div>
        <div className="academic-portal-card"><div className="card-head"><h2>Attendance</h2><span>{w.attendance.length}</span></div><div className="attendance-list">{w.attendance.length===0?<p className="muted">No attendance records for the active term.</p>:w.attendance.slice(0,8).map(a=><div className="attendance-row" key={a.id}><span>{a.attendanceDate}</span><b className={`status-${a.status.toLowerCase()}`}>{a.status}</b></div>)}</div></div>
        <div className="academic-portal-card wide"><div className="card-head"><h2>Timetable</h2><span>{w.timetable.length}</span></div><div className="table-wrap"><table><thead><tr><th>Day</th><th>Period</th><th>Subject</th><th>Time</th><th>Facility</th></tr></thead><tbody>{w.timetable.length===0?<tr><td colSpan={5}>No published timetable is available.</td></tr>:w.timetable.map(t=><tr key={t.id}><td>{t.day}</td><td>{t.periodName}</td><td><strong>{t.subjectCode}</strong> {t.subjectName}</td><td>{t.startTime}–{t.endTime}</td><td>{t.facilityName||'—'}</td></tr>)}</tbody></table></div></div>
        <div className="academic-portal-card wide"><div className="card-head"><h2>Report cards</h2><span>{w.reportCards.length}</span></div><div className="report-list">{w.reportCards.length===0?<p className="muted">No published report cards are available.</p>:w.reportCards.map(r=><div className="report-row" key={r.id}><div><strong>{r.academicSessionName} · {r.termName}</strong><span>{r.totalSubjects} subjects · {r.presentDays} present · {r.absentDays} absent</span></div><b>{r.averageScore.toFixed(2)} average</b></div>)}</div></div>
        <div className="academic-portal-card wide"><div className="card-head"><h2>Announcements</h2><span>{w.announcements.length}</span></div><div className="announcement-list">{w.announcements.length===0?<p className="muted">No announcements are currently available.</p>:w.announcements.slice(0,6).map(a=><article key={a.id}><strong>{a.title}</strong><span>{a.publishedAt?.slice(0,10)||''}</span><p>{a.content}</p></article>)}</div></div>
      </div>
    </>}
  </section>;
}
