import { useMemo, useState } from 'react';
import { useAppSelector } from '../app/hooks';
import {
  useAcademicSessionsQuery,
  useTermsQuery,
  useClassesQuery,
  useTeachersQuery,
  useTeachingAssignmentsQuery,
  useSubjectsQuery,
  useOperationalDaysQuery,
  useTimetablePeriodsQuery,
  useTimetableClassWeeklyQuery,
  useTimetableTeacherWeeklyQuery,
  useTimetableFacilityWeeklyQuery,
  useActiveFacilitiesQuery,
  useTimetablePublicationsQuery,
  type TimetableEntry,
} from '../app/api';
import './timetable-views.css';

const FALLBACK_DAYS = ['MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY'];
const DAY_LABELS: Record<string,string> = { MONDAY:'Monday', TUESDAY:'Tuesday', WEDNESDAY:'Wednesday', THURSDAY:'Thursday', FRIDAY:'Friday', SATURDAY:'Saturday', SUNDAY:'Sunday' };

type Mode = 'class' | 'teacher' | 'facility' | 'today' | 'mine';

export default function TimetableViews({ initialMode = 'class' }: { initialMode?: Mode }) {
  const user = useAppSelector(s => s.auth.user);
  const [mode, setMode] = useState<Mode>(initialMode);
  const { data: sessions } = useAcademicSessionsQuery();
  const [sessionId, setSessionId] = useState('');
  const { data: terms } = useTermsQuery(sessionId || undefined);
  const [termId, setTermId] = useState('');
  const { data: classes } = useClassesQuery();
  const { data: teachers } = useTeachersQuery();
  const { data: assignments } = useTeachingAssignmentsQuery(termId || undefined);
  const { data: subjects } = useSubjectsQuery();
  const { data: daysResponse } = useOperationalDaysQuery();
  const { data: periodsResponse } = useTimetablePeriodsQuery();
  const [classId, setClassId] = useState('');
  const [teacherId, setTeacherId] = useState('');
  const [facilityId, setFacilityId] = useState('');
  const { data: facilities } = useActiveFacilitiesQuery();

  const myTeacher = useMemo(() => {
    if (!user?.email) return undefined;
    return (teachers?.data ?? []).find(t => t.email?.toLowerCase() === user.email.toLowerCase());
  }, [teachers, user]);

  const effectiveTeacherId = mode === 'mine' ? myTeacher?.id ?? '' : teacherId;
  const classQuery = useTimetableClassWeeklyQuery({ classId: classId || '', termId: termId || '' }, { skip: !termId || !classId || (mode !== 'class' && mode !== 'today') });
  const facilityQuery = useTimetableFacilityWeeklyQuery({ facilityId: facilityId || '', termId: termId || '' }, { skip: !termId || !facilityId || mode !== 'facility' });
  const teacherQuery = useTimetableTeacherWeeklyQuery({ teacherId: effectiveTeacherId || '', termId: termId || '' }, { skip: !termId || !effectiveTeacherId || (mode !== 'teacher' && mode !== 'mine') });
  const entries = mode === 'facility' ? (facilityQuery?.data?.data ?? []) : ((mode === 'class' || mode === 'today') ? classQuery?.data?.data : teacherQuery?.data?.data) ?? [];

  const activeDays = useMemo(() => (daysResponse?.data ?? []).filter(d => d.active).sort((a,b)=>a.sequence-b.sequence), [daysResponse]);
  const teachingPeriods = useMemo(() => (periodsResponse?.data ?? []).filter(p => p.active && p.type === 'TEACHING').sort((a,b)=>a.sequence-b.sequence), [periodsResponse]);
  const entryMap = useMemo(() => {
    const m = new Map<string, TimetableEntry>();
    entries.forEach(e => m.set(`${e.day}:${e.periodId}`, e));
    return m;
  }, [entries]);
  const assignmentMap = useMemo(() => new Map((assignments?.data ?? []).map(a => [a.id,a])), [assignments]);
  const classMap = useMemo(() => new Map((classes?.data ?? []).map(c => [c.id, c])), [classes]);
  const teacherMap = useMemo(() => new Map((teachers?.data ?? []).map(t => [t.id, t])), [teachers]);
  const subjectMap = useMemo(() => new Map((subjects?.data ?? []).map(s => [s.id, s.name])), [subjects]);
  const facilityMap = useMemo(() => new Map((facilities?.data ?? []).map(f => [f.id, `${f.code} · ${f.name}`])), [facilities]);

  // Subjects are already part of teaching assignments but this screen intentionally keeps
  // the display lightweight; the builder remains the source for assignment details.
  const title = mode === 'class' ? (classMap.get(classId)?.name ?? 'Class timetable') : mode === 'mine' ? 'My timetable' : mode === 'teacher' ? `${teacherMap.get(effectiveTeacherId)?.firstName ?? ''} ${teacherMap.get(effectiveTeacherId)?.lastName ?? ''}`.trim() || 'Teacher timetable' : mode === 'facility' ? (facilities?.data?.find(f => f.id === facilityId)?.name ?? 'Facility timetable') : "Today's schedule";
  const today = new Date().toLocaleDateString('en-US', { weekday:'long' }).toUpperCase();
  const todayEntries = mode === 'today' ? entries.filter(e => e.day === new Date().toLocaleDateString('en-US', { weekday:'long' }).toUpperCase()) : [];
  const visibleEntries = mode === 'today' ? todayEntries : entries;
  const visibleEntryMap = useMemo(() => { const m=new Map<string, TimetableEntry>(); visibleEntries.forEach(e=>m.set(`${e.day}:${e.periodId}`,e)); return m; }, [visibleEntries]);
  void todayEntries; void today;

  return <div className="timetable-views page">
    <section className="schedule-hero">
      <div><span className="eyebrow">SCHOOL OPERATIONS</span><h1>{title}</h1><p>One timetable, multiple views — always derived from the same validated schedule.</p></div>
      <div className="view-switcher">
        <button className={mode==='class'?'active':''} onClick={()=>setMode('class')}>Class</button>
        <button className={mode==='teacher'?'active':''} onClick={()=>setMode('teacher')}>Teacher</button>
        <button className={mode==='facility'?'active':''} onClick={()=>setMode('facility')}>Facility</button>
        <button className={mode==='mine'?'active':''} onClick={()=>setMode('mine')}>My Schedule</button><button className={mode==='today'?'active':''} onClick={()=>setMode('today')}>Today</button>
      </div>
    </section>

    <section className="schedule-controls card">
      <label>Academic Session<select value={sessionId} onChange={e=>{setSessionId(e.target.value);setTermId('')}}><option value="">Select session</option>{sessions?.data?.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select></label>
      <label>Term<select value={termId} onChange={e=>setTermId(e.target.value)}><option value="">Select term</option>{terms?.data?.map(t=><option key={t.id} value={t.id}>{t.name}</option>)}</select></label>
      {mode==='class' && <label>Class<select value={classId} onChange={e=>setClassId(e.target.value)}><option value="">Select class</option>{classes?.data?.map(c=><option key={c.id} value={c.id}>{c.code} — {c.name}</option>)}</select></label>}
      {mode==='facility' && <label>Facility<select value={facilityId} onChange={e=>setFacilityId(e.target.value)}><option value="">Select facility</option>{facilities?.data?.map(f=><option key={f.id} value={f.id}>{f.code} — {f.name}</option>)}</select></label>}
      {mode==='teacher' && <label>Teacher<select value={teacherId} onChange={e=>setTeacherId(e.target.value)}><option value="">Select teacher</option>{teachers?.data?.map(t=><option key={t.id} value={t.id}>{t.firstName} {t.lastName}</option>)}</select></label>}
      {mode==='today' && <label>Class<select value={classId} onChange={e=>setClassId(e.target.value)}><option value="">Select class</option>{classes?.data?.map(c=><option key={c.id} value={c.id}>{c.code} — {c.name}</option>)}</select></label>}
      {mode==='mine' && <div className="identity-chip">{myTeacher ? `${myTeacher.firstName} ${myTeacher.lastName}` : 'No teacher profile linked to this account'}</div>}
    </section>

    {mode==='mine' && !myTeacher && <div className="info-banner">Your account is not currently linked to a teacher profile by email. An administrator can select your teacher schedule from the Teacher view.</div>}
    {!termId && <div className="empty-state card"><strong>Select an academic session and term.</strong><span>The timetable is scoped to a specific academic term.</span></div>}
    {termId && ((mode==='class' && !classId) || (mode==='today' && !classId) || (mode==='teacher' && !teacherId) || (mode==='facility' && !facilityId)) && <div className="empty-state card"><strong>Select a {mode==='teacher'?'teacher':mode==='facility'?'facility':'class'}.</strong><span>Choose a schedule above to load the weekly view.</span></div>}

    {termId && ((mode==='class' && classId) || (mode==='today' && classId) || ((mode==='teacher'||mode==='mine') && effectiveTeacherId) || (mode==='facility' && facilityId)) && <section className="weekly-card card">
      <div className="weekly-head"><div><span className="eyebrow">{mode==='today'?'TODAY':'WEEKLY VIEW'}</span><h2>{title}</h2></div><span className="entry-count">{entries.length} scheduled periods</span></div>
      <div className="weekly-grid" style={{gridTemplateColumns:`110px repeat(${activeDays.length || FALLBACK_DAYS.length}, minmax(150px,1fr))`}}>
        <div className="grid-corner">Period</div>
        {(activeDays.length ? activeDays : FALLBACK_DAYS.map((d,i)=>({day:d,label:DAY_LABELS[d],sequence:i+1,active:true}))).map(d=><div className="grid-day" key={d.day}>{d.label}</div>)}
        {teachingPeriods.map(p=><div className="grid-row" key={p.id} style={{display:'contents'}}>
          <div className="grid-period"><strong>{p.name}</strong><small>{p.startTime} – {p.endTime}</small></div>
          {(activeDays.length ? activeDays : FALLBACK_DAYS.map((d,i)=>({day:d,label:DAY_LABELS[d],sequence:i+1,active:true}))).map(d=>{
            const e=(mode==='today' ? visibleEntryMap : entryMap).get(`${d.day}:${p.id}`); const a=e ? assignmentMap.get(e.teachingAssignmentId) : undefined; const teacher=a ? teacherMap.get(a.teacherId) : undefined; const cls=a ? classMap.get(a.classId) : undefined;
            return <div className="grid-slot" key={`${d.day}-${p.id}`}>{e && a ? <div className="schedule-entry"><strong>{subjectMap.get(a.subjectId) ?? a.subjectId}</strong><span>{teacher ? `${teacher.firstName} ${teacher.lastName}` : 'Teacher'}</span><small>{cls ? `${cls.code} — ${cls.name}` : ''}</small>{e.facilityId && <small>📍 {facilityMap.get(e.facilityId) ?? 'Facility'}</small>}</div> : <span className="slot-open">Open</span>}</div>;
          })}
        </div>)}
      </div>
    </section>}
  </div>;
}
