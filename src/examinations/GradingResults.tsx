import { useMemo, useState } from 'react';
import {
  useAcademicSessionsQuery, useTermsQuery, useClassesQuery, useSubjectsQuery, useTeachersQuery,
  useTeachingAssignmentsQuery, useAssessmentConfigurationsQuery, useGradingSchemesQuery,
  useCreateGradingSchemeMutation, useActivateGradingSchemeMutation, useCalculateResultsMutation, useCalculatedResultsQuery,
} from '../app/api';
import './grading-results.css';

const defaultBands = [
  { minimum: 70, maximum: 100, grade: 'A', remark: 'Excellent', sequence: 1 },
  { minimum: 60, maximum: 69.99, grade: 'B', remark: 'Very Good', sequence: 2 },
  { minimum: 50, maximum: 59.99, grade: 'C', remark: 'Good', sequence: 3 },
  { minimum: 45, maximum: 49.99, grade: 'D', remark: 'Fair', sequence: 4 },
  { minimum: 40, maximum: 44.99, grade: 'E', remark: 'Pass', sequence: 5 },
  { minimum: 0, maximum: 39.99, grade: 'F', remark: 'Fail', sequence: 6 },
];

export default function GradingResults() {
  const [sessionId, setSessionId] = useState(''); const [termId, setTermId] = useState('');
  const [classId, setClassId] = useState(''); const [subjectId, setSubjectId] = useState(''); const [teacherId, setTeacherId] = useState(''); const [configId, setConfigId] = useState('');
  const [schemeName, setSchemeName] = useState('Standard 0–100 Grading'); const [bands, setBands] = useState(defaultBands);
  const { data: sessions } = useAcademicSessionsQuery(); const { data: terms } = useTermsQuery(sessionId || undefined); const { data: classes } = useClassesQuery(); const { data: subjects } = useSubjectsQuery(); const { data: teachers } = useTeachersQuery();
  const { data: assignments } = useTeachingAssignmentsQuery(termId || undefined);
  const assignment = useMemo(() => assignments?.data.find(a => a.academicSessionId===sessionId && a.termId===termId && a.classId===classId && a.subjectId===subjectId && a.teacherId===teacherId), [assignments,sessionId,termId,classId,subjectId,teacherId]);
  const { data: configs } = useAssessmentConfigurationsQuery(assignment?.id); const config = configs?.data.find(c=>c.id===configId);
  const { data: schemes } = useGradingSchemesQuery(); const [createScheme, createState] = useCreateGradingSchemeMutation(); const [activateScheme, activateState] = useActivateGradingSchemeMutation(); const [calculate, calcState] = useCalculateResultsMutation();
  const { data: results } = useCalculatedResultsQuery(assignment && config ? { teachingAssignmentId: assignment.id, assessmentConfigurationId: config.id } : undefined);
  const totalWeight = config?.totalWeight ?? 0;
  const updateBand=(i:number, patch:Partial<typeof bands[number]>)=>setBands(v=>v.map((b,index)=>index===i?{...b,...patch}:b));
  const canCreate=!!schemeName.trim() && bands.length>0 && bands.every(b=>b.minimum>=0&&b.maximum<=100&&b.minimum<=b.maximum&&b.grade.trim()&&b.remark.trim());
  const create=async()=>{if(!canCreate)return; await createScheme({name:schemeName.trim(),bands}).unwrap();};
  const selectedScheme=schemes?.data.find(s=>s.active);
  const runCalculation=async()=>{if(!assignment||!config||!selectedScheme)return; await calculate({teachingAssignmentId:assignment.id,assessmentConfigurationId:config.id,gradingSchemeId:selectedScheme.id}).unwrap();};
  return <main className="page grading-page">
    <header className="grading-header"><div><p className="eyebrow">EXAMINATIONS & ASSESSMENT</p><h1>Grading & Results</h1><p className="muted">Turn approved component scores into calculated academic results using a configurable grading scheme.</p></div><div className="grading-stat"><span>Weight</span><strong>{totalWeight}%</strong></div></header>
    <section className="grading-grid">
      <section className="panel grading-scheme-panel"><div className="section-title"><div><h2>Grading schemes</h2><p className="muted">Configure grade bands once and reuse them across results.</p></div></div>
        <div className="scheme-create"><input value={schemeName} onChange={e=>setSchemeName(e.target.value)} placeholder="Scheme name" /><button onClick={create} disabled={!canCreate||createState.isLoading}>{createState.isLoading?'Creating…':'Create scheme'}</button></div>
        <div className="band-list">{bands.map((b,i)=><div className="band-row" key={i}><input type="number" min="0" max="100" value={b.minimum} onChange={e=>updateBand(i,{minimum:Number(e.target.value)})}/><span>to</span><input type="number" min="0" max="100" value={b.maximum} onChange={e=>updateBand(i,{maximum:Number(e.target.value)})}/><input value={b.grade} onChange={e=>updateBand(i,{grade:e.target.value})} placeholder="Grade"/><input value={b.remark} onChange={e=>updateBand(i,{remark:e.target.value})} placeholder="Remark"/></div>)}</div>
        {createState.isError&&<p className="error-text">The grading scheme could not be created. Bands must cover 0–100 without gaps or overlaps.</p>}
        <div className="scheme-cards">{schemes?.data.map(s=><article className="scheme-card" key={s.id}><div><strong>{s.name}</strong><span className="badge active">{s.active?'ACTIVE':'INACTIVE'}</span></div><p>{s.bands.map(b=>`${b.minimum}–${b.maximum}: ${b.grade}`).join(' · ')}</p>{!s.active&&<button className="ghost-button" onClick={()=>activateScheme(s.id)} disabled={activateState.isLoading}>{activateState.isLoading?'Activating…':'Make active'}</button>}</article>)}</div>
      </section>
      <section className="panel result-panel"><h2>Calculate results</h2><p className="muted">Only approved scores are used. Final scores are calculated from component weights.</p>
        <div className="form-grid"><label>Academic Session<select value={sessionId} onChange={e=>{setSessionId(e.target.value);setTermId('');setConfigId('')}}><option value="">Select session</option>{sessions?.data.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select></label><label>Term<select value={termId} onChange={e=>{setTermId(e.target.value);setConfigId('')}} disabled={!sessionId}><option value="">Select term</option>{terms?.data.map(t=><option key={t.id} value={t.id}>{t.name}</option>)}</select></label><label>Class<select value={classId} onChange={e=>{setClassId(e.target.value);setConfigId('')}}><option value="">Select class</option>{classes?.data.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></label><label>Subject<select value={subjectId} onChange={e=>{setSubjectId(e.target.value);setConfigId('')}}><option value="">Select subject</option>{subjects?.data.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select></label><label>Teacher<select value={teacherId} onChange={e=>{setTeacherId(e.target.value);setConfigId('')}}><option value="">Select teacher</option>{teachers?.data.map(t=><option key={t.id} value={t.id}>{t.firstName} {t.lastName}</option>)}</select></label><label>Assessment<select value={configId} onChange={e=>setConfigId(e.target.value)} disabled={!assignment}><option value="">Select assessment</option>{configs?.data.filter(c=>c.active).map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></label></div>
        <div className="result-action"><div><span className="muted">Active scheme</span><strong>{selectedScheme?.name ?? 'Create a grading scheme first'}</strong></div><button onClick={runCalculation} disabled={!assignment||!config||!selectedScheme||totalWeight!==100||calcState.isLoading}>{calcState.isLoading?'Calculating…':'Calculate approved results'}</button></div>
        {calcState.isError&&<p className="error-text">Results could not be calculated. Ensure every active student has approved scores for every active assessment component.</p>}
        {!assignment||!config?<div className="empty-state">Select the academic context and assessment configuration.</div>:<div className="result-table-wrap"><table><thead><tr><th>Student</th><th>Admission No.</th><th>Total</th><th>Grade</th><th>Remark</th></tr></thead><tbody>{results?.data.map(r=><tr key={r.id}><td><strong>{r.studentName}</strong></td><td>{r.admissionNumber}</td><td>{r.totalScore.toFixed(2)}</td><td><span className="grade-pill">{r.grade}</span></td><td>{r.remark}</td></tr>)}</tbody></table>{results?.data.length===0&&<div className="empty-state">No calculated results yet.</div>}</div>}
      </section>
    </section>
  </main>;
}
