import { useMemo, useState } from 'react';
import {
  useAcademicSessionsQuery,
  useTermsQuery,
  useClassesQuery,
  useTeachingAssignmentsQuery,
  useTeachersQuery,
  useSubjectsQuery,
  useActiveFacilitiesQuery,
  useOperationalDaysQuery,
  useTimetablePeriodsQuery,
  useTimetableEntriesQuery,
  useCreateTimetableEntryMutation,
  useDeleteTimetableEntryMutation,
  type TimetableEntry,
} from '../app/api';
import './timetable-builder.css';

const days = ['MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY'];

export default function TimetableBuilder() {
  const { data: sessions } = useAcademicSessionsQuery();
  const [sessionId, setSessionId] = useState('');
  const { data: terms } = useTermsQuery(sessionId || undefined);
  const [termId, setTermId] = useState('');
  const { data: classes } = useClassesQuery();
  const [classId, setClassId] = useState('');
  const { data: assignments } = useTeachingAssignmentsQuery(termId || undefined);
  const { data: teachers } = useTeachersQuery();
  const { data: subjects } = useSubjectsQuery();
  const { data: facilities } = useActiveFacilitiesQuery();
  const { data: operationalDays } = useOperationalDaysQuery();
  const { data: periods } = useTimetablePeriodsQuery();
  const { data: entriesResponse, isFetching } = useTimetableEntriesQuery({ termId: termId || undefined, classId: classId || undefined });
  const [createEntry, { isLoading: creating }] = useCreateTimetableEntryMutation();
  const [deleteEntry] = useDeleteTimetableEntryMutation();
  const [selectedDay, setSelectedDay] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('');
  const [selectedAssignment, setSelectedAssignment] = useState('');
  const [selectedFacility, setSelectedFacility] = useState('');
  const [error, setError] = useState('');

  const activeDays = useMemo(() => (operationalDays?.data ?? []).filter(d => d.active && days.includes(d.day)), [operationalDays]);
  const teachingPeriods = useMemo(() => (periods?.data ?? []).filter(p => p.active && p.type === 'TEACHING'), [periods]);
  const entryMap = useMemo(() => {
    const map = new Map<string, TimetableEntry>();
    (entriesResponse?.data ?? []).forEach(e => map.set(`${e.day}:${e.periodId}`, e));
    return map;
  }, [entriesResponse]);
  const className = (id: string) => { const c = classes?.data?.find(x => x.id === id); return c ? `${c.code} — ${c.name}` : id; };
  const teacherName = (id: string) => { const t = teachers?.data?.find(x => x.id === id); return t ? `${t.firstName} ${t.lastName}` : 'Teacher'; };
  const subjectName = (id: string) => { const s = subjects?.data?.find(x => x.id === id); return s ? s.name : 'Subject'; };
  const assignmentFor = (id: string) => assignments?.data?.find(a => a.id === id);
  const facilityName = (id?: string) => { const f = facilities?.data?.find(x => x.id === id); return f ? `${f.code} · ${f.name}` : ''; };

  async function addEntry() {
    setError('');
    if (!sessionId || !termId || !selectedAssignment || !selectedDay || !selectedPeriod) { setError('Select session, term, class, teaching assignment, day and period.'); return; }
    try { await createEntry({ academicSessionId: sessionId, termId, teachingAssignmentId: selectedAssignment, day: selectedDay, periodId: selectedPeriod, facilityId: selectedFacility || undefined }).unwrap(); setSelectedAssignment(''); setSelectedFacility(''); }
    catch (e: any) { setError(e?.data?.message ?? 'Unable to create timetable entry.'); }
  }

  async function remove(id: string) {
    try { await deleteEntry(id).unwrap(); } catch (e:any) { setError(e?.data?.message ?? 'Unable to remove timetable entry.'); }
  }

  return <div className="timetable-builder page">
    <div className="builder-head">
      <div><p className="eyebrow">ACADEMIC OPERATIONS</p><h1>Timetable Builder</h1><p>Build conflict-free class schedules from existing teaching assignments.</p></div>
    </div>
    <div className="builder-filters card">
      <label>Academic Session<select value={sessionId} onChange={e => {setSessionId(e.target.value);setTermId('')}}><option value="">Select session</option>{sessions?.data?.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select></label>
      <label>Term<select value={termId} onChange={e=>setTermId(e.target.value)}><option value="">Select term</option>{terms?.data?.map(t=><option key={t.id} value={t.id}>{t.name}</option>)}</select></label>
      <label>Class<select value={classId} onChange={e=>setClassId(e.target.value)}><option value="">Select class</option>{classes?.data?.map(c=><option key={c.id} value={c.id}>{c.code} — {c.name}</option>)}</select></label>
      <label>Day<select value={selectedDay} onChange={e=>setSelectedDay(e.target.value)}><option value="">Day</option>{activeDays.map(d=><option key={d.day} value={d.day}>{d.label}</option>)}</select></label>
      <label>Period<select value={selectedPeriod} onChange={e=>setSelectedPeriod(e.target.value)}><option value="">Period</option>{teachingPeriods.map(p=><option key={p.id} value={p.id}>{p.name} · {p.startTime}–{p.endTime}</option>)}</select></label>
      <label>Teaching Assignment<select value={selectedAssignment} onChange={e=>setSelectedAssignment(e.target.value)}><option value="">Assignment</option>{assignments?.data?.filter(a=>!classId || a.classId===classId).map(a=><option key={a.id} value={a.id}>{subjectName(a.subjectId)} · {teacherName(a.teacherId)}</option>)}</select></label><label>Facility<select value={selectedFacility} onChange={e=>setSelectedFacility(e.target.value)}><option value="">No facility assigned</option>{facilities?.data?.map(f=><option key={f.id} value={f.id}>{f.code} — {f.name}</option>)}</select></label>
      <button className="primary" disabled={creating} onClick={addEntry}>{creating ? 'Saving…' : 'Add to Timetable'}</button>
    </div>
    {error && <div className="error-banner">{error}</div>}
    <div className="timetable-card card">
      <div className="table-title"><div><h2>{classId ? className(classId) : 'Weekly timetable'}</h2><span>{isFetching ? 'Refreshing…' : `${entriesResponse?.data?.length ?? 0} scheduled entries`}</span></div></div>
      <div className="week-grid" style={{gridTemplateColumns:`120px repeat(${activeDays.length || 1}, minmax(180px,1fr))`}}>
        <div className="corner">Period</div>{activeDays.map(d=><div className="day-head" key={d.day}>{d.label}</div>)}
        {teachingPeriods.map(p=><>
          <div className="period-head" key={`p-${p.id}`}><strong>{p.name}</strong><span>{p.startTime}–{p.endTime}</span></div>
          {activeDays.map(d=>{const e=entryMap.get(`${d.day}:${p.id}`); const a=e && assignmentFor(e.teachingAssignmentId); return <div className="slot" key={`${d.day}-${p.id}`}>{e && a ? <div className="entry"><strong>{subjectName(a.subjectId)}</strong><span>{teacherName(a.teacherId)}</span><small>{className(a.classId)}</small>{e.facilityId && <small>{facilityName(e.facilityId)}</small>}<button onClick={()=>remove(e.id)} aria-label="Remove timetable entry">×</button></div> : <span className="empty-slot">Available</span>}</div>})}
        </>)}
      </div>
    </div>
  </div>;
}
