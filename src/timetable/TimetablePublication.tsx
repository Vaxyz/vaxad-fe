import { useState } from 'react';
import { useAcademicSessionsQuery, useTermsQuery, useClassesQuery, useTimetablePublicationsQuery, usePublishTimetableMutation, useReopenTimetableMutation } from '../app/api';
import './timetable-publication.css';

export default function TimetablePublication(){
  const {data:sessions}=useAcademicSessionsQuery(); const [sessionId,setSessionId]=useState('');
  const {data:terms}=useTermsQuery(sessionId||undefined); const [termId,setTermId]=useState('');
  const {data:classes}=useClassesQuery(); const [classId,setClassId]=useState('');
  const {data:pubs}=useTimetablePublicationsQuery(termId?{termId}:undefined);
  const [publish,{isLoading}]=usePublishTimetableMutation(); const [reopen]=useReopenTimetableMutation(); const [error,setError]=useState('');
  const rows=(classes?.data??[]).filter(c=>!classId||c.id===classId).map(c=>({cls:c,pub:(pubs?.data??[]).find(p=>p.classId===c.id)}));
  async function doPublish(c:string){setError('');try{await publish({academicSessionId:sessionId,termId,classId:c}).unwrap()}catch(e:any){setError(e?.data?.message??'Unable to publish timetable.')}}
  async function doReopen(id:string){const reason=window.prompt('Reason for reopening this timetable?');if(!reason?.trim())return;try{await reopen({id,body:{reason}}).unwrap()}catch(e:any){setError(e?.data?.message??'Unable to reopen timetable.')}}
  return <div className="page timetable-publication"><section className="publication-hero"><div><span className="eyebrow">ACADEMIC OPERATIONS</span><h1>Timetable Publication</h1><p>Review and publish class schedules when they are ready for students and staff.</p></div></section>
    <section className="publication-controls card"><label>Academic Session<select value={sessionId} onChange={e=>{setSessionId(e.target.value);setTermId('')}}><option value="">Select session</option>{sessions?.data?.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select></label><label>Term<select value={termId} onChange={e=>setTermId(e.target.value)}><option value="">Select term</option>{terms?.data?.map(t=><option key={t.id} value={t.id}>{t.name}</option>)}</select></label><label>Class<select value={classId} onChange={e=>setClassId(e.target.value)}><option value="">All classes</option>{classes?.data?.map(c=><option key={c.id} value={c.id}>{c.code} — {c.name}</option>)}</select></label></section>
    {error&&<div className="error-banner">{error}</div>}
    {!termId?<div className="empty-state card"><strong>Select an academic session and term.</strong><span>Publication is scoped to a class timetable within a term.</span></div>:<section className="publication-list card"><div className="publication-list-head"><div><h2>Class timetable status</h2><span>{rows.length} classes</span></div></div>{rows.map(({cls,pub})=><div className="publication-row" key={cls.id}><div><strong>{cls.code} — {cls.name}</strong><span>{pub?`Last published ${new Date(pub.publishedAt).toLocaleString()}`:'Not published yet'}</span></div><span className={`status-pill ${pub?.status==='PUBLISHED'?'published':'reopened'}`}>{pub?.status??'DRAFT'}</span><div className="publication-actions">{(!pub||pub.status==='REOPENED')&&<button className="primary" disabled={isLoading||!sessionId} onClick={()=>doPublish(cls.id)}>Publish</button>}{pub?.status==='PUBLISHED'&&<button className="secondary" onClick={()=>doReopen(pub.id)}>Reopen</button>}</div></div>)}</section>}
  </div>
}
