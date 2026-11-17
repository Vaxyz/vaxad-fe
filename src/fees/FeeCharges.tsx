import { FormEvent, useState } from 'react';
import { useAcademicSessionsQuery, useClassesQuery, useEnrollmentsQuery, useFeeChargesQuery, useFeeStructuresQuery, useGenerateFeeChargesMutation, useTermsQuery } from '../app/api';

export default function FeeCharges() {
  const sessions = useAcademicSessionsQuery();
  const classes = useClassesQuery();
  const [sessionId, setSessionId] = useState('');
  const [termId, setTermId] = useState('');
  const [classId, setClassId] = useState('');
  const [enrollmentId, setEnrollmentId] = useState('');
  const [structureId, setStructureId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const terms = useTermsQuery(sessionId || undefined);
  const enrollments = useEnrollmentsQuery({ sessionId: sessionId || undefined, termId: termId || undefined, classId: classId || undefined });
  const structures = useFeeStructuresQuery({ sessionId: sessionId || undefined, termId: termId || undefined, classId: classId || undefined });
  const charges = useFeeChargesQuery({ sessionId: sessionId || undefined, termId: termId || undefined, classId: classId || undefined });
  const [generate, generation] = useGenerateFeeChargesMutation();

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    await generate({ enrollmentId, feeStructureId: structureId, dueDate: dueDate || undefined }).unwrap();
  };

  return <section className="fee-card charges-card">
    <div className="card-heading"><div><p className="eyebrow">STUDENT CHARGES</p><h2>Generate charges</h2><p className="muted">Apply an active fee structure to an enrolled student. Existing charges are never duplicated.</p></div><span className="count">{charges.data?.data.length ?? 0}</span></div>
    <form className="fee-form" onSubmit={submit}>
      <div className="form-row"><select value={sessionId} onChange={e=>{setSessionId(e.target.value);setTermId('');setClassId('');setEnrollmentId('');setStructureId('')}} required><option value="">Academic session</option>{sessions.data?.data.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select><select value={termId} onChange={e=>{setTermId(e.target.value);setEnrollmentId('');setStructureId('')}} disabled={!sessionId} required><option value="">Term</option>{terms.data?.data.map(t=><option key={t.id} value={t.id}>{t.name}</option>)}</select></div>
      <select value={classId} onChange={e=>{setClassId(e.target.value);setEnrollmentId('');setStructureId('')}} required><option value="">Class</option>{classes.data?.data.map(c=><option key={c.id} value={c.id}>{c.code} — {c.name}</option>)}</select>
      <select value={enrollmentId} onChange={e=>setEnrollmentId(e.target.value)} required><option value="">Student enrollment</option>{enrollments.data?.data.map(e=><option key={e.id} value={e.id}>{e.admissionNumber} — {e.studentName}</option>)}</select>
      <select value={structureId} onChange={e=>setStructureId(e.target.value)} required><option value="">Active fee structure</option>{structures.data?.data.filter(s=>s.active).map(s=><option key={s.id} value={s.id}>{s.name} — ₦{Number(s.totalAmount).toLocaleString(undefined,{minimumFractionDigits:2})}</option>)}</select>
      <input type="date" value={dueDate} onChange={e=>setDueDate(e.target.value)} />
      <div className="form-footer"><span className="muted">Charges are snapshots of the selected structure items.</span><button type="submit" disabled={generation.isLoading || !enrollmentId || !structureId}>{generation.isLoading ? 'Generating…' : 'Generate charges'}</button></div>
    </form>
    <div className="fee-list charge-list">
      {charges.isLoading && <p className="muted">Loading charges…</p>}
      {!charges.isLoading && !charges.data?.data.length && <p className="muted">No student charges have been generated yet.</p>}
      {charges.data?.data.map(c=><div className="structure charge" key={c.id}><div className="structure-top"><div><strong>{c.feeName}</strong><small>{c.admissionNumber} · {c.studentName} · {c.termName}</small></div><span className={`badge ${c.status === 'PAID' || c.status === 'WAIVED' ? 'active' : ''}`}>{c.status}</span></div><div className="charge-values"><span>Original <strong>₦{Number(c.originalAmount).toLocaleString(undefined,{minimumFractionDigits:2})}</strong></span><span>Discount <strong>₦{Number(c.discountAmount).toLocaleString(undefined,{minimumFractionDigits:2})}</strong></span><span>Waiver <strong>₦{Number(c.waiverAmount).toLocaleString(undefined,{minimumFractionDigits:2})}</strong></span><span>Due <strong>₦{Number(c.amountDue).toLocaleString(undefined,{minimumFractionDigits:2})}</strong></span><span>Balance <strong>₦{Number(c.balance).toLocaleString(undefined,{minimumFractionDigits:2})}</strong></span></div></div>)}
    </div>
  </section>;
}
