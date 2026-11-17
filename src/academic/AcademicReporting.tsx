import { useState } from 'react';
import { env } from '../config/env';
import { useAcademicSessionsQuery, useTermsQuery, useClassesQuery, useAcademicTermReportQuery, useAcademicClassReportQuery } from '../app/api';
import './academic-reporting.css';

const swaggerUrl = env.swaggerUrl;

export default function AcademicReporting() {
  const {data:sessionsResponse,isLoading:sessionsLoading}=useAcademicSessionsQuery();
  const sessions=sessionsResponse?.data??[];
  const activeSession=sessions.find(s=>s.active) ?? sessions[0];
  const {data:termsResponse}=useTermsQuery(activeSession?.id,{skip:!activeSession?.id});
  const terms=termsResponse?.data??[];
  const [termId,setTermId]=useState('');
  const effectiveTerm=termId||terms.find(t=>t.active)?.id||terms[0]?.id||'';
  const {data:classesResponse}=useClassesQuery();
  const classes=classesResponse?.data??[];
  const [classId,setClassId]=useState('');
  const {data:overviewResponse,isLoading,isFetching,error}=useAcademicTermReportQuery(effectiveTerm,{skip:!effectiveTerm});
  const overview=overviewResponse?.data;
  const selectedClass=overview?.classes.find(c=>c.classId===classId);
  const {data:classResponse}=useAcademicClassReportQuery({classId,termId:effectiveTerm},{skip:!classId||!!selectedClass});
  const classReport=selectedClass ?? classResponse?.data;

  return <main className="academic-reporting-page">
    <header className="reporting-hero"><div><span className="eyebrow">CORE ACADEMIC REPORTING</span><h1>Academic performance intelligence.</h1><p>Bring published results, student enrollment and attendance together for term and class-level reporting.</p></div><a className="swagger-link" href={swaggerUrl} target="_blank" rel="noreferrer">API Documentation ↗</a></header>
    <section className="reporting-controls">
      <label>Academic session<select value={activeSession?.id??''} disabled={sessionsLoading}><option value="">Select session</option>{sessions.map(s=><option key={s.id} value={s.id}>{s.name}{s.active?' · Active':''}</option>)}</select></label>
      <label>Term<select value={effectiveTerm} onChange={e=>setTermId(e.target.value)}><option value="">Select term</option>{terms.map(t=><option key={t.id} value={t.id}>{t.name}</option>)}</select></label>
      <label>Class<select value={classId} onChange={e=>setClassId(e.target.value)}><option value="">All classes</option>{classes.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
    </section>
    {error&&<div className="reporting-alert">Unable to load the academic report. Confirm the selected term and your permissions.</div>}
    {isLoading||isFetching?<div className="reporting-card">Loading academic reporting…</div>:overview&&<>
      <section className="reporting-metrics">
        <div><span>Enrolled students</span><strong>{overview.enrolledStudents}</strong></div>
        <div><span>Students with results</span><strong>{overview.studentsWithPublishedResults}</strong></div>
        <div><span>Published subject results</span><strong>{overview.publishedSubjectResults}</strong></div>
        <div><span>Overall average</span><strong>{overview.overallAverageScore.toFixed(2)}</strong></div>
        <div><span>Attendance rate</span><strong>{overview.attendanceRate.toFixed(2)}%</strong></div>
      </section>
      <section className="reporting-card">
        <div className="card-head"><div><h2>{classReport?`${classReport.className} performance`:'Class performance'}</h2><p>{classReport?'Student-level performance for the selected class.':'Compare academic performance and attendance across classes.'}</p></div></div>
        <div className="table-wrap"><table><thead><tr><th>Class</th><th>Enrolled</th><th>Results</th><th>Average</th><th>Attendance</th></tr></thead><tbody>
          {overview.classes.map(c=><tr key={c.classId} className={c.classId===classId?'selected-row':''} onClick={()=>setClassId(c.classId)}><td><strong>{c.className}</strong></td><td>{c.enrolledStudents}</td><td>{c.studentsWithPublishedResults}</td><td>{c.classAverageScore.toFixed(2)}</td><td>{c.attendanceRate.toFixed(2)}%</td></tr>)}
        </tbody></table></div>
      </section>
      {classReport&&<section className="reporting-card"><div className="card-head"><div><h2>{classReport.className} student performance</h2><p>{classReport.termName} · {classReport.academicSessionName}</p></div></div><div className="table-wrap"><table><thead><tr><th>Student</th><th>Admission No.</th><th>Subjects</th><th>Total</th><th>Average</th><th>Attendance</th></tr></thead><tbody>{classReport.students.map(s=><tr key={s.studentId}><td><strong>{s.studentName}</strong></td><td>{s.admissionNumber}</td><td>{s.subjects}</td><td>{s.totalScore.toFixed(2)}</td><td>{s.averageScore.toFixed(2)}</td><td>{s.attendanceRate.toFixed(2)}%</td></tr>)}</tbody></table></div></section>}
    </>}
  </main>;
}
