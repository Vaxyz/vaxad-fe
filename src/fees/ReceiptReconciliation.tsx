import { FormEvent, useMemo, useState } from 'react';
import { useReconciliationHistoryQuery, useReconcileDayMutation, useReceiptByPaymentQuery, useReceiptsQuery } from '../app/api';
import './receipt-reconciliation.css';

export default function ReceiptReconciliation() {
  const today = new Date().toISOString().slice(0, 10);
  const [selectedPayment, setSelectedPayment] = useState('');
  const [date, setDate] = useState(today);
  const [actual, setActual] = useState('');
  const [note, setNote] = useState('');
  const receipts = useReceiptsQuery();
  const receipt = useReceiptByPaymentQuery(selectedPayment, { skip: !selectedPayment });
  const history = useReconciliationHistoryQuery({ from: date, to: date });
  const [reconcile] = useReconcileDayMutation();
  const selected = receipt.data?.data;
  const summary = history.data?.data?.[0];
  const formatted = useMemo(() => (value:number) => `₦${value.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, []);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    await reconcile({ date, actualAmount: Number(actual), note: note || undefined }).unwrap();
  };

  return <section className="receipt-reconciliation">
    <div className="finance-section-heading"><div><p className="eyebrow">RECEIPTS</p><h2>Payment receipts</h2><p className="muted">Every completed payment remains traceable to its allocation records.</p></div><span className="count">{receipts.data?.data.length ?? 0}</span></div>
    <div className="receipt-grid">
      <article className="receipt-card">
        <h3>Receipt history</h3>
        {!receipts.data?.data.length && <p className="muted">No completed payments have receipts yet.</p>}
        {receipts.data?.data.map(r => <button className={`receipt-row ${selectedPayment===r.paymentId?'selected':''}`} key={r.paymentId} onClick={()=>setSelectedPayment(r.paymentId)}><span><strong>{r.receiptNumber}</strong><small>{r.paymentDate} · {r.studentName} · {r.method}</small></span><strong>{formatted(r.amount)}</strong></button>)}
      </article>
      <article className="receipt-card receipt-detail">
        <h3>Receipt details</h3>
        {!selected && <p className="muted">Select a receipt to view its details.</p>}
        {selected && <><div className="receipt-meta"><div><span>Receipt</span><strong>{selected.receiptNumber}</strong></div><div><span>Reference</span><strong>{selected.paymentReference}</strong></div><div><span>Student</span><strong>{selected.studentName}</strong><small>{selected.admissionNumber}</small></div><div><span>Date</span><strong>{selected.paymentDate}</strong></div></div><div className="receipt-lines">{selected.allocations.length ? selected.allocations.map(line=><div key={line.feeChargeId}><span>{line.feeName}</span><strong>{formatted(line.amount)}</strong></div>) : <p className="muted">This payment has not been allocated to a fee charge.</p>}</div><div className="receipt-total"><span>Total paid</span><strong>{formatted(selected.amount)}</strong></div><button className="secondary" onClick={()=>window.print()}>Print receipt</button></>}
      </article>
    </div>
    <div className="finance-section-heading reconciliation-heading"><div><p className="eyebrow">RECONCILIATION</p><h2>Daily collection reconciliation</h2><p className="muted">Recorded payments are compared with the amount physically reconciled.</p></div></div>
    <div className="reconciliation-grid">
      <article className="receipt-card"><label>Date<input type="date" value={date} onChange={e=>setDate(e.target.value)}/></label>{summary && <div className="method-grid"><div>Cash<strong>{formatted(summary.cash)}</strong></div><div>Bank Transfer<strong>{formatted(summary.bankTransfer)}</strong></div><div>POS<strong>{formatted(summary.pos)}</strong></div><div>Card<strong>{formatted(summary.card)}</strong></div><div>Online<strong>{formatted(summary.online)}</strong></div><div>Other<strong>{formatted(summary.other)}</strong></div></div>}<div className="reconciliation-total"><span>Recorded collection</span><strong>{formatted(summary?.totalCollected ?? 0)}</strong></div></article>
      <article className="receipt-card"><h3>Reconcile collection</h3><form onSubmit={submit} className="reconcile-form"><input type="number" min="0" step="0.01" placeholder="Actual reconciled amount" value={actual} onChange={e=>setActual(e.target.value)} required/><textarea placeholder="Optional reconciliation note" value={note} onChange={e=>setNote(e.target.value)}/><button type="submit">Reconcile day</button></form>{summary && <div className={`reconciliation-status ${summary.status.toLowerCase()}`}><strong>{summary.status}</strong><span>Difference: {formatted(summary.difference)}</span></div>}</article>
    </div>
    <div className="reconciliation-history">{history.data?.data.map(item=><div className="reconciliation-history-row" key={item.id}><span><strong>{item.date}</strong><small>{item.status}</small></span><span>Recorded {formatted(item.totalCollected)}</span><span>Actual {formatted(item.actualAmount)}</span><strong>Difference {formatted(item.difference)}</strong></div>)}</div>
  </section>;
}
