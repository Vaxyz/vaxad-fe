import { useState } from 'react';
import { useCreateTeacherMutation, useTeachersQuery, type CreateTeacherRequest } from '../app/api';
import { useAppSelector } from '../app/hooks';
import { hasAnyRole } from '../security/roles';
import './teacher-management.css';

const initial: CreateTeacherRequest = { staffNumber:'', firstName:'', lastName:'', email:'', phone:'' };

export default function TeacherManagement(){
 const user = useAppSelector(state => state.auth.user);
 const canManage = hasAnyRole(user?.roles, ['SUPER_ADMIN','ADMIN','PRINCIPAL','VICE_PRINCIPAL']);
 const {data,isLoading,isError}=useTeachersQuery();
 const [create,{isLoading:creating}]=useCreateTeacherMutation();
 const [form,setForm]=useState(initial);
 const submit=async(e:React.FormEvent)=>{e.preventDefault();await create(form).unwrap();setForm(initial)};

 return <main className="page teacher-page">
   <header className="module-header">
     <div><p className="eyebrow">STAFF DIRECTORY</p><h1>Teachers</h1><p className="muted">{canManage ? 'Maintain the teaching staff used by classes, assignments and teacher attendance.' : 'View the teaching staff available to you.'}</p></div>
     <span className="module-count">{data?.data.length ?? 0} teachers</span>
   </header>
   <section className="module-grid">
     {canManage && <div className="panel"><h2>Add teacher</h2><form className="form-stack" onSubmit={submit}><input placeholder="Staff number" value={form.staffNumber} onChange={e=>setForm({...form,staffNumber:e.target.value})} required/><div className="form-row"><input placeholder="First name" value={form.firstName} onChange={e=>setForm({...form,firstName:e.target.value})} required/><input placeholder="Last name" value={form.lastName} onChange={e=>setForm({...form,lastName:e.target.value})} required/></div><div className="form-row"><input type="email" placeholder="Email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/><input placeholder="Phone" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})}/></div><button disabled={creating}>{creating?'Saving…':'Create teacher'}</button></form></div>}
     <div className={`panel ${canManage ? '' : 'wide'}`}><div className="panel-title"><h2>Teaching staff</h2><span>{data?.data.length ?? 0}</span></div>{isLoading&&<p>Loading teachers…</p>}{isError&&<p className="error-text">Unable to load teachers.</p>}<div className="data-list">{data?.data.map(t=><div className="data-row" key={t.id}><div><strong>{t.firstName} {t.lastName}</strong><span>{t.staffNumber}{t.email?` · ${t.email}`:''}</span></div><span className={`badge ${t.active?'active':''}`}>{t.active?'Active':'Inactive'}</span></div>)}</div></div>
   </section>
 </main>;
}
