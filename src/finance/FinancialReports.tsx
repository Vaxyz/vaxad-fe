import { useState } from 'react';
import { env } from '../config/env';
import { useAcademicSessionsQuery, useClassesQuery, useFinancialReportQuery, useTermsQuery } from '../app/api';
import './financial-reports.css';

const swaggerUrl = env.swaggerUrl;

const money=(n:number)=>`₦${Number(n||0).toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2})}`;
const entries=(m:Record<string,number>|undefined)=>Object.entries(m??{});

export default function FinancialReports(){
 const sessions=useAcademicSessionsQuery(); const classes=useClassesQuery();
 const [sessionId,setSessionId]=useState(''); const [termId,setTermId]=useState(''); const [classId,setClassId]=useState('');
 const [from,setFrom]=useState(''); const [to,setTo]=useState('');
 const terms=useTermsQuery(sessionId||undefined,{skip:!sessionId});
 const report=useFinancialReportQuery({sessionId:sessionId||undefined,termId:termId||undefined,classId:classId||undefined,from:from||undefined,to:to||undefined});
 const r=report.data?.data; const s=r?.summary;
 return <main className="financial-reports-page">
  <header className="financial-reports-hero"><div><p className="eyebrow">V20-F</p><h1>Financial reporting & integration</h1><p className="muted">A consolidated view of charges, collections, invoices, payment plans, gateway activity and reconciliation.</p></div><a className="swagger-link" href={swaggerUrl} target="_blank" rel="noreferrer">API Documentation ↗</a></header>
  <section className="financial-report-filters">
   <select value={sessionId} onChange={e=>{setSessionId(e.target.value);setTermId('')}}><option value="">All sessions</option>{sessions.data?.data.map(x=><option key={x.id} value={x.id}>{x.name}</option>)}</select>
   <select value={termId} onChange={e=>setTermId(e.target.value)} disabled={!sessionId}><option value="">All terms</option>{terms.data?.data.map(x=><option key={x.id} value={x.id}>{x.name}</option>)}</select>
   <select value={classId} onChange={e=>setClassId(e.target.value)}><option value="">All classes</option>{classes.data?.data.map(x=><option key={x.id} value={x.id}>{x.name}</option>)}</select>
   <input type="date" value={from} onChange={e=>setFrom(e.target.value)} aria-label="From date"/><input type="date" value={to} onChange={e=>setTo(e.target.value)} aria-label="To date"/>
  </section>
  {report.isError&&<div className="financial-report-alert">Unable to load the financial report. Confirm your filters and permissions.</div>}
  {report.isLoading||report.isFetching?<section className="financial-report-card">Loading financial reporting…</section>:r&&<>
   <section className="financial-report-metrics">
    <article><span>Total charges</span><strong>{money(s?.totalCharges??0)}</strong><small>{s?.chargeCount??0} charge lines</small></article>
    <article><span>Collected</span><strong>{money(s?.totalCollected??0)}</strong><small>{s?.unallocatedPayments?`${money(s.unallocatedPayments)} unallocated`: 'All collected funds allocated'}</small></article>
    <article><span>Outstanding</span><strong>{money(s?.outstanding??0)}</strong><small>Current charge balance</small></article>
    <article><span>Invoiced</span><strong>{money(s?.invoiced??0)}</strong><small>{s?.invoiceCount??0} invoices</small></article>
    <article><span>Payment plans</span><strong>{money(s?.paymentPlanAmount??0)}</strong><small>{s?.paymentPlanCount??0} plans</small></article>
    <article><span>Reversed / refunded</span><strong>{money(s?.refundedOrReversed??0)}</strong><small>Completed reversal/refund records</small></article>
   </section>
   <section className="financial-report-grid">
    <ReportTable title="Collection by payment method" rows={r.byPaymentMethod}/>
    <ReportTable title="Outstanding by class" rows={r.byClass}/>
    <ReportTable title="Collection by fee" rows={r.byFee}/>
    <StatusTable title="Invoice totals by status" values={r.invoiceAmountsByStatus}/>
    <StatusTable title="Payment-plan totals by status" values={r.paymentPlanAmountsByStatus}/>
    <StatusTable title="Gateway totals by status" values={r.gatewayAmountsByStatus}/>
   </section>
   <section className="financial-reconciliation-card"><div><p className="eyebrow">RECONCILIATION</p><h2>Financial integration health</h2></div><div className="reconciliation-metrics"><span><strong>{r.reconciliation.runs}</strong> gateway runs</span><span><strong>{r.reconciliation.reconciled}</strong> reconciled</span><span><strong>{r.reconciliation.discrepancies}</strong> discrepancies</span><span><strong>{money(r.reconciliation.gatewayAmount)}</strong> gateway amount</span><span><strong>{money(r.reconciliation.vaxadAmount)}</strong> Vaxad amount</span><span><strong>{money(r.reconciliation.discrepancyAmount)}</strong> discrepancy amount</span></div></section>
  </>}
 </main>;
}

function ReportTable({title,rows}:{title:string;rows:{key:string;count:number;amount:number;paid:number;outstanding:number}[]}){return <section className="financial-report-card"><div className="card-head"><h2>{title}</h2></div><div className="report-table"><div className="report-row report-head"><span>Group</span><span>Count</span><span>Amount</span><span>Paid</span><span>Outstanding</span></div>{rows.length===0&&<div className="report-empty">No data for the selected filters.</div>}{rows.map(x=><div className="report-row" key={x.key}><span><strong>{x.key}</strong></span><span>{x.count}</span><span>{money(x.amount)}</span><span>{money(x.paid)}</span><span>{money(x.outstanding)}</span></div>)}</div></section>}
function StatusTable({title,values}:{title:string;values:Record<string,number>}){return <section className="financial-report-card"><div className="card-head"><h2>{title}</h2></div><div className="status-list">{entries(values).length===0&&<div className="report-empty">No data for the selected filters.</div>}{entries(values).map(([k,v])=><div className="status-row" key={k}><span>{k}</span><strong>{money(v)}</strong></div>)}</div></section>}
