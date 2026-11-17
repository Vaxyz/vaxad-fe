import { FormEvent, useMemo, useState } from 'react';
import type { FeeItemType } from '../app/api';
import { useAcademicSessionsQuery, useClassesQuery, useCreateFeeStructureMutation, useFeeStructuresQuery, useTermsQuery } from '../app/api';
import FeeCharges from './FeeCharges';
import Payments from './Payments';
import ReceiptReconciliation from './ReceiptReconciliation';
import './payments.css';
import './fees.css';

const feeTypes: FeeItemType[] = ['TUITION','REGISTRATION','EXAMINATION','LIBRARY','TRANSPORT','BOARDING','UNIFORM','MEALS','SPORTS','OTHER'];
const blankItem = { code: '', name: '', type: 'TUITION' as FeeItemType, amount: '', required: true };

export default function FeesManagement() {
  const sessions = useAcademicSessionsQuery();
  const classes = useClassesQuery();
  const [sessionId, setSessionId] = useState('');
  const terms = useTermsQuery(sessionId || undefined);
  const structures = useFeeStructuresQuery({ sessionId: sessionId || undefined });
  const [createStructure] = useCreateFeeStructureMutation();
  const [name, setName] = useState('');
  const [termId, setTermId] = useState('');
  const [classId, setClassId] = useState('');
  const [items, setItems] = useState([{...blankItem}]);

  const total = useMemo(() => items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0), [items]);
  const addItem = () => setItems([...items, {...blankItem}]);
  const removeItem = (index: number) => setItems(items.filter((_, i) => i !== index));
  const updateItem = (index: number, key: string, value: string | boolean) => setItems(items.map((item, i) => i === index ? {...item, [key]: value} : item));

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    await createStructure({ academicSessionId: sessionId, termId, classId, name, items: items.map(item => ({ code: item.code, name: item.name, type: item.type, amount: Number(item.amount), required: item.required })) }).unwrap();
    setName(''); setTermId(''); setClassId(''); setItems([{...blankItem}]);
  };

  return <main className="fees page">
    <header className="fees-header"><div><p className="eyebrow">FINANCE</p><h1>Fee Structures</h1><p className="muted">Define term fee structures and apply them to enrolled students as auditable charges.</p></div><div className="fee-total"><span>Draft total</span><strong>₦{total.toLocaleString(undefined,{minimumFractionDigits:2})}</strong></div></header>
    <section className="fees-grid">
      <article className="fee-card composer">
        <div className="card-heading"><div><p className="eyebrow">STRUCTURE SETUP</p><h2>Create fee structure</h2></div></div>
        <form onSubmit={submit} className="fee-form">
          <input placeholder="Structure name (e.g. 2026/2027 First Term Fees)" value={name} onChange={e=>setName(e.target.value)} required />
          <div className="form-row"><select value={sessionId} onChange={e=>{setSessionId(e.target.value);setTermId('')}} required><option value="">Academic session</option>{sessions.data?.data.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select><select value={termId} onChange={e=>setTermId(e.target.value)} required disabled={!sessionId}><option value="">Term</option>{terms.data?.data.map(t=><option key={t.id} value={t.id}>{t.name}</option>)}</select></div>
          <select value={classId} onChange={e=>setClassId(e.target.value)} required><option value="">Class</option>{classes.data?.data.map(c=><option key={c.id} value={c.id}>{c.code} — {c.name}{c.section ? ` · ${c.section}` : ''}</option>)}</select>
          <div className="items-heading"><div><strong>Fee items</strong><small>Each item becomes a future student charge category.</small></div><button type="button" className="secondary" onClick={addItem}>+ Add item</button></div>
          <div className="fee-items">{items.map((item,index)=><div className="fee-item" key={index}><input placeholder="Code" value={item.code} onChange={e=>updateItem(index,'code',e.target.value)} required /><input placeholder="Name" value={item.name} onChange={e=>updateItem(index,'name',e.target.value)} required /><select value={item.type} onChange={e=>updateItem(index,'type',e.target.value)}>{feeTypes.map(type=><option key={type}>{type}</option>)}</select><input type="number" min="0.01" step="0.01" placeholder="Amount" value={item.amount} onChange={e=>updateItem(index,'amount',e.target.value)} required /><label className="check"><input type="checkbox" checked={item.required} onChange={e=>updateItem(index,'required',e.target.checked)}/> Required</label>{items.length > 1 && <button type="button" className="remove" onClick={()=>removeItem(index)}>Remove</button>}</div>)}</div>
          <div className="form-footer"><strong>Total: ₦{total.toLocaleString(undefined,{minimumFractionDigits:2})}</strong><button type="submit">Create fee structure</button></div>
        </form>
      </article>
      <article className="fee-card"><div className="card-heading"><div><p className="eyebrow">CONFIGURED FEES</p><h2>Structures</h2></div><span className="count">{structures.data?.data.length ?? 0}</span></div><div className="fee-list">{structures.isLoading && <p className="muted">Loading fee structures…</p>}{!structures.isLoading && !structures.data?.data.length && <p className="muted">No fee structures configured for the selected session.</p>}{structures.data?.data.map(s=><div className="structure" key={s.id}><div className="structure-top"><div><strong>{s.name}</strong><small>{s.classCode} · {s.className} · {s.termName}</small></div><span className={`badge ${s.active ? 'active' : ''}`}>{s.active ? 'ACTIVE' : 'DRAFT'}</span></div><div className="structure-items">{s.items.map(i=><div key={i.id}><span>{i.name}<small>{i.code} · {i.type}{i.required ? ' · Required' : ''}</small></span><strong>₦{Number(i.amount).toLocaleString(undefined,{minimumFractionDigits:2})}</strong></div>)}</div><div className="structure-total"><span>Total</span><strong>₦{Number(s.totalAmount).toLocaleString(undefined,{minimumFractionDigits:2})}</strong></div></div>)}</div></article>
    </section>
    <FeeCharges />
    <Payments />
    <ReceiptReconciliation />
  </main>;
}
