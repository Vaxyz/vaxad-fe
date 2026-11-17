import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePortalFinancialAccountQuery, usePortalFinancialStudentsQuery } from '../app/api';
import './parent-financial-portal.css';

const money=(value:number)=>new Intl.NumberFormat('en-NG',{style:'currency',currency:'NGN',maximumFractionDigits:2}).format(value);

export default function ParentFinancialPortal(){
  const navigate=useNavigate();
  const {data:studentsResponse,isLoading:studentsLoading,error:studentsError}=usePortalFinancialStudentsQuery();
  const students=studentsResponse?.data??[];
  const [selectedId,setSelectedId]=useState('');
  const activeId=selectedId||students[0]?.id||'';
  const {data:accountResponse,isLoading:accountLoading,error:accountError}=usePortalFinancialAccountQuery({studentId:activeId},{skip:!activeId});
  const account=accountResponse?.data?.account;

  return <section className="portal-page">
    <div className="portal-hero"><div><span className="eyebrow">PARENT / STUDENT PORTAL</span><h1>Financial Account</h1><p>View school charges, payments and outstanding balances for your linked student.</p></div></div>
    {studentsError && <div className="portal-alert">Unable to load linked students. Please sign in again or contact the school.</div>}
    <div className="portal-card"><label>Student<select value={activeId} onChange={e=>setSelectedId(e.target.value)} disabled={studentsLoading||students.length===0}><option value="">Select student</option>{students.map(s=><option key={s.id} value={s.id}>{s.firstName} {s.lastName} — {s.admissionNumber}</option>)}</select></label>{students.length===0&&!studentsLoading&&<p className="muted">No student is linked to this account.</p>}</div>
    {accountError&&<div className="portal-alert">You are not authorized to view this student's account.</div>}
    {accountLoading&&<div className="portal-card">Loading financial account…</div>}
    {account&&<>
      <div className="portal-student"><div><strong>{account.studentName}</strong><span>{account.admissionNumber}</span></div><button type="button" onClick={()=>navigate(`/portal/payments?studentId=${account.studentId}`)}>Make payment</button></div>
      <div className="portal-metrics"><div className="metric"><span>Total charges</span><strong>{money(account.totalCharges)}</strong></div><div className="metric"><span>Total paid</span><strong>{money(account.totalPaid)}</strong></div><div className="metric outstanding"><span>Outstanding</span><strong>{money(account.outstandingBalance)}</strong></div></div>
      <div className="portal-card"><div className="portal-card-head"><h2>Financial statement</h2><span>{account.transactions.length} transaction(s)</span></div><div className="table-wrap"><table><thead><tr><th>Date</th><th>Reference</th><th>Description</th><th>Debit</th><th>Credit</th><th>Balance</th></tr></thead><tbody>{account.transactions.length===0?<tr><td colSpan={6}>No financial transactions.</td></tr>:account.transactions.map(t=><tr key={t.id}><td>{t.date||'—'}</td><td>{t.reference}</td><td>{t.description}</td><td>{t.debit?money(t.debit):'—'}</td><td>{t.credit?money(t.credit):'—'}</td><td>{money(t.balance)}</td></tr>)}</tbody></table></div></div>
    </>}
  </section>;
}
