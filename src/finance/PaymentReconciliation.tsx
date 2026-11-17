import { useState } from 'react';
import { usePaymentReconciliationHistoryQuery, usePaymentReconciliationQuery, useRunPaymentReconciliationMutation } from '../app/api';
import './payment-reconciliation.css';

export default function PaymentReconciliation() {
  const [date,setDate]=useState(new Date().toISOString().slice(0,10));
  const summary=usePaymentReconciliationQuery(date);
  const history=usePaymentReconciliationHistoryQuery();
  const [run,{isLoading}]=useRunPaymentReconciliationMutation();
  const money=(n:number)=>`₦${Number(n||0).toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2})}`;
  const execute=async()=>{await run(date).unwrap();};
  return <main className="payment-reconciliation-page">
    <header className="finance-section-heading"><div><p className="eyebrow">V20-C</p><h1>Gateway payment reconciliation</h1><p className="muted">Compare successful gateway transactions with Vaxad online fee payments and surface discrepancies.</p></div><button onClick={execute} disabled={isLoading}>{isLoading?'Reconciling…':'Run reconciliation'}</button></header>
    <section className="pr-grid">
      <article className="pr-card"><label>Date<input type="date" value={date} onChange={e=>setDate(e.target.value)}/></label>{summary.data?.data && <><div className="pr-status"><strong>{summary.data.data.status}</strong><span>{summary.data.data.discrepancyCount} discrepancy item(s)</span></div><div className="pr-metrics"><div><small>Gateway</small><strong>{summary.data.data.gatewayCount}</strong><span>{money(summary.data.data.gatewayAmount)}</span></div><div><small>Vaxad Online</small><strong>{summary.data.data.vaxadCount}</strong><span>{money(summary.data.data.vaxadAmount)}</span></div><div><small>Matched</small><strong>{summary.data.data.matchedCount}</strong><span>{money(summary.data.data.matchedAmount)}</span></div><div><small>Difference</small><strong>{money(summary.data.data.discrepancyAmount)}</strong></div></div></>}</article>
      <article className="pr-card"><h2>Discrepancies</h2>{!summary.data?.data.items.length && <p className="muted">No discrepancies recorded for this date.</p>}{summary.data?.data.items.map(i=><div className="pr-item" key={i.id}><strong>{i.issueType.replaceAll('_',' ')}</strong><span>{i.message}</span><small>{i.gatewayReference||i.paymentReference||''}{i.gatewayAmount!=null?` · Gateway ${money(i.gatewayAmount)}`:''}{i.paymentAmount!=null?` · Vaxad ${money(i.paymentAmount)}`:''}</small></div>)}</article>
    </section>
    <section className="pr-card pr-history"><h2>Reconciliation history</h2>{history.data?.data.map(r=><div className="pr-history-row" key={r.id}><span><strong>{r.date}</strong><small>{r.status}</small></span><span>Gateway {money(r.gatewayAmount)}</span><span>Vaxad {money(r.vaxadAmount)}</span><strong>{r.discrepancyCount} issue(s)</strong></div>)}</section>
  </main>;
}
