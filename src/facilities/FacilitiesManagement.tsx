import { FormEvent, useMemo, useState } from 'react';
import { useFacilitiesQuery, useCreateFacilityMutation, useUpdateFacilityMutation, useActivateFacilityMutation, useDeactivateFacilityMutation, useDeleteFacilityMutation, type FacilityType } from '../app/api';
import './facilities.css';

const TYPES: { value: FacilityType; label: string }[] = [
  {value:'CLASSROOM',label:'Classroom'}, {value:'LABORATORY',label:'Laboratory'}, {value:'COMPUTER_LAB',label:'Computer Lab'}, {value:'LIBRARY',label:'Library'},
  {value:'EXAMINATION_HALL',label:'Examination Hall'}, {value:'ASSEMBLY_HALL',label:'Assembly Hall'}, {value:'SPORTS_FACILITY',label:'Sports Facility'}, {value:'OFFICE',label:'Office'}, {value:'OTHER',label:'Other'}
];

export default function FacilitiesManagement() {
  const [search, setSearch] = useState('');
  const [type, setType] = useState<FacilityType | ''>('');
  const [showInactive, setShowInactive] = useState(false);
  const { data, isLoading, isFetching } = useFacilitiesQuery({ ...(type ? {type} : {}), active: showInactive ? undefined : true, ...(search ? {search} : {}) });
  const [createFacility, createState] = useCreateFacilityMutation();
  const [updateFacility] = useUpdateFacilityMutation();
  const [activateFacility] = useActivateFacilityMutation();
  const [deactivateFacility] = useDeactivateFacilityMutation();
  const [deleteFacility] = useDeleteFacilityMutation();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({code:'', name:'', type:'CLASSROOM' as FacilityType, location:'', capacity:''});
  const facilities = data?.data ?? [];
  const stats = useMemo(() => ({ total: facilities.length, active: facilities.filter(f=>f.active).length, capacity: facilities.reduce((n,f)=>n+(f.capacity ?? 0),0) }), [facilities]);
  const reset = () => { setEditingId(null); setForm({code:'',name:'',type:'CLASSROOM',location:'',capacity:''}); };
  const submit = async (e: FormEvent) => { e.preventDefault(); const body = { code:form.code.trim(), name:form.name.trim(), type:form.type, location:form.location.trim() || undefined, capacity:form.capacity ? Number(form.capacity) : undefined }; if (editingId) await updateFacility({id:editingId, body:{...body, active:true}}).unwrap(); else await createFacility(body).unwrap(); reset(); };
  const edit = (f: typeof facilities[number]) => { setEditingId(f.id); setForm({code:f.code,name:f.name,type:f.type,location:f.location ?? '',capacity:f.capacity?.toString() ?? ''}); window.scrollTo({top:0,behavior:'smooth'}); };
  return <div className="facilities-page">
    <section className="facilities-hero"><div><span className="facility-eyebrow">SCHOOL OPERATIONS</span><h1>Facilities & Rooms</h1><p>A shared facility directory for classrooms, laboratories, halls and other school resources.</p></div><div className="facility-stat-strip"><div><strong>{stats.total}</strong><span>Shown</span></div><div><strong>{stats.active}</strong><span>Active</span></div><div><strong>{stats.capacity}</strong><span>Capacity</span></div></div></section>
    <div className="facilities-layout">
      <section className="facility-card facility-form-card"><div className="facility-card-head"><div><span className="facility-eyebrow">CONFIGURATION</span><h2>{editingId ? 'Edit facility' : 'Add facility'}</h2></div>{editingId && <button className="ghost-button" onClick={reset}>Cancel</button>}</div>
        <form onSubmit={submit} className="facility-form"><div className="facility-form-grid"><label>Code<input value={form.code} onChange={e=>setForm({...form,code:e.target.value})} placeholder="ROOM-01" required /></label><label>Name<input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="JSS 1 Classroom" required /></label></div><div className="facility-form-grid"><label>Type<select value={form.type} onChange={e=>setForm({...form,type:e.target.value as FacilityType})}>{TYPES.map(t=><option key={t.value} value={t.value}>{t.label}</option>)}</select></label><label>Capacity<input type="number" min="1" value={form.capacity} onChange={e=>setForm({...form,capacity:e.target.value})} placeholder="40" /></label></div><label>Location<input value={form.location} onChange={e=>setForm({...form,location:e.target.value})} placeholder="Main Block · Floor 1" /></label><button className="primary-button" disabled={createState.isLoading}>{editingId ? 'Save changes' : 'Create facility'}</button></form>
        <div className="facility-note"><strong>Shared domain</strong><span>These facilities can later be reused by timetable, examinations, CBT and school events.</span></div>
      </section>
      <section className="facility-card"><div className="facility-card-head"><div><span className="facility-eyebrow">DIRECTORY</span><h2>School facilities</h2></div><span className="facility-count">{isFetching ? 'Refreshing…' : `${facilities.length} records`}</span></div>
        <div className="facility-filters"><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search code, name or location…" /><select value={type} onChange={e=>setType(e.target.value as FacilityType | '')}><option value="">All types</option>{TYPES.map(t=><option key={t.value} value={t.value}>{t.label}</option>)}</select><label className="check-filter"><input type="checkbox" checked={showInactive} onChange={e=>setShowInactive(e.target.checked)} /> Include inactive</label></div>
        {isLoading ? <div className="facility-empty">Loading facilities…</div> : facilities.length === 0 ? <div className="facility-empty"><strong>No facilities yet</strong><span>Create your first classroom, laboratory or shared facility.</span></div> : <div className="facility-list">{facilities.map(f=><article className="facility-row" key={f.id}><div className="facility-icon">{f.type === 'LABORATORY' || f.type === 'COMPUTER_LAB' ? 'LAB' : f.type === 'LIBRARY' ? 'LIB' : 'ROOM'}</div><div className="facility-main"><div className="facility-title"><strong>{f.name}</strong><span className={f.active ? 'status-pill active' : 'status-pill'}>{f.active ? 'Active' : 'Inactive'}</span></div><small>{f.code} · {TYPES.find(t=>t.value===f.type)?.label}{f.location ? ` · ${f.location}` : ''}{f.capacity ? ` · ${f.capacity} seats` : ''}</small></div><div className="facility-actions"><button className="ghost-button" onClick={()=>edit(f)}>Edit</button>{f.active ? <button className="ghost-button danger" onClick={()=>deactivateFacility(f.id)}>Deactivate</button> : <><button className="ghost-button" onClick={()=>activateFacility(f.id)}>Activate</button><button className="ghost-button danger" onClick={()=>deleteFacility(f.id)}>Delete</button></>}</div></article>)}</div>}
      </section>
    </div>
  </div>;
}
