import { useNavigate } from 'react-router-dom';
import { useRoleDashboardQuery } from '../app/api';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { logout } from '../features/auth/authSlice';
import './dashboard.css';

export function Dashboard() {
  const navigate = useNavigate(); const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const { data, isLoading, isError, error, refetch } = useRoleDashboardQuery();
  const model=data?.data;
  const signOut=()=>{dispatch(logout());navigate('/login',{replace:true});};
  const role=(model?.role ?? user?.roles?.[0] ?? 'USER').toUpperCase();
  const cards = role==='STUDENT' ? [
    ['Notifications',model?.unreadNotifications ?? 0],['Payments',model?.paymentCount ?? 0],['Admission Number',model?.admissionNumber ?? '—'],['Status','Active']
  ] : role==='PARENT' ? [
    ['Children',model?.childrenCount ?? 0],['Payments',model?.paymentCount ?? 0],['Notifications',model?.unreadNotifications ?? 0],['Account','Active']
  ] : role==='BURSAR' ? [
    ['Payments',model?.payments ?? 0],['Students',model?.students ?? 0],['Guardians',model?.guardians ?? 0],['Unread Notifications',model?.unreadNotifications ?? 0]
  ] : role==='TEACHER' ? [
    ['Students',model?.students ?? 0],['Unread Notifications',model?.unreadNotifications ?? 0],['Payments','View only'],['Role','Teacher']
  ] : [
    ['Students',model?.students ?? 0],['Guardians',model?.guardians ?? 0],['Payments',model?.payments ?? 0],['Unread Notifications',model?.unreadNotifications ?? 0]
  ];
  return <main className="dashboard page">
    <header className="dashboard-header"><div><p className="eyebrow">VAXAD SCHOOL PLATFORM</p><h1>{role==='STUDENT'?'Student Dashboard':role==='PARENT'?'Guardian Dashboard':role==='PRINCIPAL'?'Principal Dashboard':role==='BURSAR'?'Bursar Dashboard':role==='TEACHER'?'Teacher Dashboard':role==='VICE_PRINCIPAL'?'Vice Principal Dashboard':(role==='ADMIN'||role==='SUPER_ADMIN')?'Administrator Dashboard':'School Dashboard'}</h1><p className="muted">Welcome, {model?.name ?? user?.firstName ?? user?.username}.</p></div><div className="header-actions"><span className="status">{role}</span><button className="secondary" onClick={()=>navigate('/notifications')}>Notifications</button><button className="secondary" onClick={()=>navigate('/portal/financial')}>Financial Account</button>{(role==='STUDENT'||role==='PARENT')&&<button className="secondary" onClick={()=>navigate('/portal/payments')}>Make Payment</button>}<button className="secondary" onClick={signOut}>Sign out</button></div></header>
    {isLoading&&<div className="panel">Loading dashboard…</div>}
    {isError&&<div className="panel error"><strong>Dashboard could not be loaded.</strong><p>{JSON.stringify(error)}</p><button className="secondary" onClick={()=>refetch()}>Retry</button></div>}
    {model&&<><section className="grid">{cards.map(([label,value])=><article className="card" key={label}><span>{label}</span><strong>{value}</strong></article>)}</section>
      {role==='PARENT'&&<section className="panel" style={{marginTop:20}}><h2>My Children</h2>{(model.children??[]).length===0?<p className="muted">No linked students.</p>:<div className="list">{model.children?.map(c=><div className="list-item" key={c.id}><div><strong>{c.name}</strong><small>{c.admissionNumber}</small></div><button className="secondary" onClick={()=>navigate(`/portal/payments?studentId=${c.id}`)}>Pay Fees</button><button className="secondary" onClick={()=>navigate('/portal/academic')}>Academic Portal</button></div>)}</div>}</section>}
      {role==='STUDENT'&&<section className="panel" style={{marginTop:20}}><h2>{model.studentName}</h2><p className="muted">Admission number: {model.admissionNumber}</p><button className="secondary" onClick={()=>navigate(`/portal/payments?studentId=${model.studentId??''}`)}>Make School-Fee Payment</button><button className="secondary" onClick={()=>navigate('/portal/academic')}>Open Academic Portal</button></section>}
      {(role==='PRINCIPAL'||role==='VICE_PRINCIPAL'||role==='ADMIN'||role==='BURSAR'||role==='SUPER_ADMIN')&&<section className="panel" style={{marginTop:20}}><h2>School Operations</h2><div className="header-actions"><button className="secondary" onClick={()=>navigate('/finance/reports')}>Financial Reports</button><button className="secondary" onClick={()=>navigate('/finance/payment-reconciliation')}>Payment Reconciliation</button><button className="secondary" onClick={()=>navigate('/announcements')}>Communication</button></div></section>}
    </>}
  </main>;
}
