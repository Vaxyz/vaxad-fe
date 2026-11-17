import { useMemo, useState } from 'react';
import { useAcademicSessionsQuery, useFinancialStatementQuery, useStudentsQuery, useTermsQuery } from '../app/api';
import './financial-accounts.css';

const money = (v:number) => `₦${Number(v || 0).toLocaleString(undefined,{minimumFractionDigits:2})}`;

export default function FinancialAccounts() {
  const students = useStudentsQuery();
  const sessions = useAcademicSessionsQuery();
  const [studentId,setStudentId] = useState('');
  const [sessionId,setSessionId] = useState('');
  const [termId,setTermId] = useState('');
  const [from,setFrom] = useState('');
  const [to,setTo] = useState('');
  const terms = useTermsQuery(sessionId || undefined);
  const statement = useFinancialStatementQuery({studentId, sessionId:sessionId || undefined, termId:termId || undefined, from:from || undefined, to:to || undefined},{skip:!studentId});
  const account = statement.data?.data;
  const transactions = account?.transactions ?? [];
  const selectedStudent = students.data?.data.find(s=>s.id===studentId);
  const status = useMemo(()=>statement.isLoading?'Loading account…':statement.isError?'Unable to load financial account.':'', [statement.isLoading, statement.isError]);

  return <main className="financial-accounts page">
    <header className="financial-header"><div><p className="eyebrow">FINANCIAL ACCOUNT</p><h1>Student statements</h1><p className="muted">A chronological account built from the existing charges, payments and reversals.</p></div></header>
    <section className="account-filters">
      <select value={studentId} onChange={e=>setStudentId(e.target.value)}><option value="">Select student</option>{students.data?.data.map(s=><option key={s.id} value={s.id}>{s.admissionNumber} — {s.firstName} {s.lastName}</option>)}</select>
      <select value={sessionId} onChange={e=>{setSessionId(e.target.value);setTermId('')}}><option value="">All sessions</option>{sessions.data?.data.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select>
      <select value={termId} onChange={e=>setTermId(e.target.value)} disabled={!sessionId}><option value="">All terms</option>{terms.data?.data.map(t=><option key={t.id} value={t.id}>{t.name}</option>)}</select>
      <input type="date" value={from} onChange={e=>setFrom(e.target.value)} aria-label="From date" />
      <input type="date" value={to} onChange={e=>setTo(e.target.value)} aria-label="To date" />
    </section>
    {!studentId && <section className="empty-account"><strong>Select a student</strong><span>Choose a student above to view charges, payments, reversals and the current balance.</span></section>}
    {status && <p className="muted account-status">{status}</p>}
    {account && <>
      <section className="account-hero"><div><p className="eyebrow">{account.admissionNumber}</p><h2>{account.studentName}</h2><span>Student financial account</span></div><div className="account-balance"><span>Outstanding balance</span><strong>{money(account.outstandingBalance)}</strong></div></section>
      <section className="account-cards"><article><span>Total charges</span><strong>{money(account.totalCharges)}</strong></article><article><span>Total paid</span><strong>{money(account.totalPaid)}</strong></article><article><span>Outstanding</span><strong>{money(account.outstandingBalance)}</strong></article></section>
      <section className="statement-card"><div className="statement-heading"><div><p className="eyebrow">ACCOUNT STATEMENT</p><h2>Transaction history</h2></div><button className="secondary" onClick={()=>window.print()}>Print statement</button></div>
        <div className="statement-table"><div className="statement-row statement-head"><span>Date</span><span>Description</span><span>Debit</span><span>Credit</span><span>Balance</span></div>{transactions.length===0 && <div className="statement-empty">No transactions match the selected filters.</div>}{transactions.map(t=><div className="statement-row" key={`${t.type}-${t.id}`}><span>{t.date}</span><span><strong>{t.description}</strong><small>{t.type} · {t.reference}</small></span><span>{t.debit ? money(t.debit) : '—'}</span><span>{t.credit ? money(t.credit) : '—'}</span><span>{money(t.balance)}</span></div>)}</div>
      </section>
    </>}
  </main>;
}
