import { FormEvent, useMemo, useState } from 'react';
import {
  AdmissionApplication, AdmissionFeeItem, PaymentMethod,
  useAcceptAdmissionMutation, useGrantAdmissionMutation, useAcademicSessionsQuery, useAdmissionDashboardQuery, useAdmissionsQuery,
  useAdmissionFeeItemsQuery, useAdmissionInvoiceQuery, useAdmissionPaymentsQuery,
  useClassesQuery, useCreateAdmissionApplicationMutation, useCreateAdmissionFeeItemMutation,
  useInitializeAdmissionPaymentMutation, useRecordAdmissionPaymentMutation,
  useImportAdmissionBatchMutation, useAdmissionBatchTemplateMutation,
  useTermsQuery, useUpdateAdmissionStatusMutation
} from '../app/api';
import './admissions.css';

const initial = { firstName:'', lastName:'', dateOfBirth:'', gender:'', email:'', phone:'', guardianFirstName:'', guardianLastName:'', guardianPhone:'', guardianEmail:'', guardianRelationship:'Mother', academicSessionId:'', termId:'', classId:'' };
const money = (v:number) => `₦${v.toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2})}`;

export default function Admissions() {
  const [search,setSearch] = useState('');
  const [statusFilter,setStatusFilter] = useState<string>('');
  const applications = useAdmissionsQuery({q: search || undefined, status: statusFilter as any || undefined});
  const admissionDashboard = useAdmissionDashboardQuery();
  const sessions = useAcademicSessionsQuery();
  const [form,setForm] = useState(initial);
  const terms = useTermsQuery(form.academicSessionId || undefined);
  const classes = useClassesQuery();
  const [createApplication] = useCreateAdmissionApplicationMutation();
  const [updateStatus] = useUpdateAdmissionStatusMutation();
  const [acceptApplication] = useAcceptAdmissionMutation();
  const [grantAdmission] = useGrantAdmissionMutation();
  const [recordPayment] = useRecordAdmissionPaymentMutation();
  const [initializePayment] = useInitializeAdmissionPaymentMutation();
  const fees = useAdmissionFeeItemsQuery();
  const [createFee] = useCreateAdmissionFeeItemMutation();
  const [importBatch,{isLoading:importing}] = useImportAdmissionBatchMutation();
  const [downloadTemplate] = useAdmissionBatchTemplateMutation();
  const [batchFile,setBatchFile] = useState<File|null>(null);
  const [batchResult,setBatchResult] = useState<any>(null);
  const [selectedId,setSelectedId] = useState<string>();
  const [paymentAmount,setPaymentAmount] = useState('');
  const [paymentMethod,setPaymentMethod] = useState<PaymentMethod>('CASH');
  const [feeForm,setFeeForm] = useState({code:'',name:'',amount:'',blocking:true,active:true});

  const selected = useMemo(()=>applications.data?.data.find(a=>a.id===selectedId),[applications.data,selectedId]);
  const invoice = useAdmissionInvoiceQuery(selectedId!,{skip:!selectedId || !['ACCEPTED','PAYMENT_PENDING'].includes(selected?.status ?? '')});
  const payments = useAdmissionPaymentsQuery(selectedId!,{skip:!selectedId});

  const submit = async (e:FormEvent) => { e.preventDefault(); await createApplication({...form}).unwrap(); setForm(initial); };
  const accept = async (a:AdmissionApplication) => { const result=await acceptApplication(a.id).unwrap(); setSelectedId(result.data.id); };
  const changeStatus = async (id:string,status:AdmissionApplication['status']) => { const note = (status==='REJECTED'||status==='WITHDRAWN'||status==='UNDER_REVIEW') ? window.prompt(status==='REJECTED'?'Reason for rejection:':status==='WITHDRAWN'?'Reason for withdrawal:':'Review note (optional):') : undefined; if((status==='REJECTED'||status==='WITHDRAWN')&&!note?.trim()) return; await updateStatus({id,status,note:note ?? undefined}); }; 
  const payManual = async () => { if(!selectedId || !paymentAmount)return; await recordPayment({id:selectedId,body:{amount:Number(paymentAmount),method:paymentMethod,paymentDate:new Date().toISOString().slice(0,10),notes:'Admission gate payment'}}).unwrap(); setPaymentAmount(''); };
  const payOnline = async () => { if(!selected || !paymentAmount)return; const result=await initializePayment({paymentAccessToken:selected.paymentAccessToken,amount:Number(paymentAmount),email:selected.guardianEmail}).unwrap(); if(result.data.authorizationUrl) window.open(result.data.authorizationUrl,'_blank','noopener,noreferrer'); };

  return <main className="admissions page">
    <header className="admissions-header"><div><p className="eyebrow">ADMISSIONS + FINANCIAL GATE</p><h1>Admission pipeline</h1><p className="muted">Review applications, manage admission charges, and finalize students only after all blocking admission fees are fully paid.</p></div></header>

    {admissionDashboard.data?.data && <section className="admission-metrics">{[['Applications',admissionDashboard.data.data.totalApplications],['Under review',admissionDashboard.data.data.underReview],['Payment pending',admissionDashboard.data.data.paymentPending],['Admitted',admissionDashboard.data.data.admitted],['Collected',money(admissionDashboard.data.data.admissionAmountCollected)],['Outstanding',money(admissionDashboard.data.data.admissionOutstanding)]].map(([label,value])=><div className="admission-metric" key={String(label)}><small>{label}</small><strong>{value}</strong></div>)}</section>}

    <section className="admissions-grid">
      <article className="admission-card create-card">
        <div className="card-heading"><div><p className="eyebrow">NEW APPLICATION</p><h2>Applicant details</h2></div></div>
        <form className="compact-form" onSubmit={submit}>
          <div className="form-row"><input placeholder="First name" value={form.firstName} onChange={e=>setForm({...form,firstName:e.target.value})} required/><input placeholder="Last name" value={form.lastName} onChange={e=>setForm({...form,lastName:e.target.value})} required/></div>
          <div className="form-row"><input type="date" value={form.dateOfBirth} onChange={e=>setForm({...form,dateOfBirth:e.target.value})}/><select value={form.gender} onChange={e=>setForm({...form,gender:e.target.value})}><option value="">Gender</option><option>MALE</option><option>FEMALE</option></select></div>
          <div className="form-row"><input placeholder="Student/applicant email" type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/><input placeholder="Applicant phone" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})}/></div>
          <div className="section-label">Academic placement</div>
          <div className="form-row"><select value={form.academicSessionId} onChange={e=>setForm({...form,academicSessionId:e.target.value,termId:''})} required><option value="">Academic session</option>{sessions.data?.data.filter(s=>s.active).map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select><select value={form.termId} onChange={e=>setForm({...form,termId:e.target.value})} required><option value="">Term</option>{terms.data?.data.filter(t=>t.active).map(t=><option key={t.id} value={t.id}>{t.name}</option>)}</select></div>
          <select value={form.classId} onChange={e=>setForm({...form,classId:e.target.value})} required><option value="">Target class</option>{classes.data?.data.filter(c=>c.active).map(c=><option key={c.id} value={c.id}>{c.name} ({c.code})</option>)}</select>
          <div className="section-label">Primary guardian</div>
          <div className="form-row"><input placeholder="Guardian first name" value={form.guardianFirstName} onChange={e=>setForm({...form,guardianFirstName:e.target.value})} required/><input placeholder="Guardian last name" value={form.guardianLastName} onChange={e=>setForm({...form,guardianLastName:e.target.value})} required/></div>
          <div className="form-row"><input placeholder="Guardian phone" value={form.guardianPhone} onChange={e=>setForm({...form,guardianPhone:e.target.value})} required/><input type="email" placeholder="Guardian email (credentials + payment)" value={form.guardianEmail} onChange={e=>setForm({...form,guardianEmail:e.target.value})} required/></div>
          <input placeholder="Relationship (e.g. Mother)" value={form.guardianRelationship} onChange={e=>setForm({...form,guardianRelationship:e.target.value})} required/>
          <div className="form-row action-row"><button type="submit">Create application</button><button type="button" className="secondary" onClick={async()=>{const r=await createApplication({...form}).unwrap();await grantAdmission(r.data.id).unwrap();setForm(initial);setSelectedId(r.data.id);}}>Create & grant admission</button></div>
        </form>
      </article>

      <article className="admission-card wide">
        <div className="card-heading"><div><p className="eyebrow">APPLICATION PIPELINE</p><h2>Applicants</h2></div><span className="count">{applications.data?.data.length ?? 0}</span></div>
        <div className="admission-filters"><input placeholder="Search application, applicant or guardian email" value={search} onChange={e=>setSearch(e.target.value)}/><select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)}><option value="">All statuses</option>{['DRAFT','SUBMITTED','UNDER_REVIEW','PAYMENT_PENDING','ADMITTED','REJECTED','WITHDRAWN'].map(x=><option key={x}>{x}</option>)}</select></div>
        <div className="application-list">
          {applications.isLoading && <p className="muted">Loading applications…</p>}
          {applications.data?.data.map(a => <div className={`application-item ${selectedId===a.id?'selected':''}`} key={a.id} onClick={()=>setSelectedId(a.id)}>
            <div className="application-main"><div><strong>{a.firstName} {a.lastName}</strong><small>{a.applicationNumber} · {a.guardianName} · {a.guardianPhone}</small></div><span className={`badge ${a.status==='ADMITTED'?'active':''}`}>{a.status}</span></div>
            {(a.requiredAmount>0 || a.status==='PAYMENT_PENDING' || a.status==='ADMITTED') && <div className="financial-strip"><span>Required {money(a.requiredAmount)}</span><span>Paid {money(a.amountPaid)}</span><strong>Balance {money(a.balance)}</strong></div>}
            <div className="application-actions">
              {a.status==='DRAFT' && <button className="secondary" onClick={e=>{e.stopPropagation();updateStatus({id:a.id,status:'SUBMITTED'})}}>Submit</button>}
              {a.status==='SUBMITTED' && <button className="secondary" onClick={e=>{e.stopPropagation();changeStatus(a.id,'UNDER_REVIEW')}}>Start review</button>}
              {a.status==='UNDER_REVIEW' && <><button className="secondary" onClick={e=>{e.stopPropagation();accept(a)}}>Accept & generate payment gate</button><button className="danger" onClick={e=>{e.stopPropagation();changeStatus(a.id,'REJECTED')}}>Reject</button></>}
              {a.status==='PAYMENT_PENDING' && <small className="warning-text">Payment required before admission is finalized.</small>}
              {a.status==='ADMITTED' && <small className="success-text">Admitted · Student username: {a.studentUsername} · Guardian username: {a.guardianUsername}</small>}
            </div>
          </div>)}
        </div>

        {selected && <section className="admission-financial-panel">
          {(selected.reviewNotes || selected.decisionReason) && <div className="review-box"><p className="eyebrow">REVIEW / DECISION</p>{selected.reviewNotes && <p><strong>Review note:</strong> {selected.reviewNotes}</p>}{selected.decisionReason && <p><strong>Decision:</strong> {selected.decisionReason}</p>}{selected.reviewedBy && <small>Recorded by {selected.reviewedBy}{selected.reviewedAt ? ` · ${new Date(selected.reviewedAt).toLocaleString()}` : ''}</small>}</div>}
          <div className="panel-title"><div><p className="eyebrow">SELECTED APPLICATION</p><h3>{selected.firstName} {selected.lastName}</h3></div><span className="badge">{selected.applicationNumber}</span></div>
          {selected.status==='PAYMENT_PENDING' && invoice.data?.data && <>
            <div className="invoice-summary"><div><small>Invoice</small><strong>{invoice.data.data.invoiceNumber}</strong></div><div><small>Total</small><strong>{money(invoice.data.data.totalAmount)}</strong></div><div><small>Paid</small><strong>{money(invoice.data.data.amountPaid)}</strong></div><div><small>Balance</small><strong>{money(invoice.data.data.balance)}</strong></div></div>
            <div className="invoice-lines">{invoice.data.data.items.map(i=><div key={i.id}><span>{i.description}{i.blocking?' · blocking':''}</span><strong>{money(i.amount)}</strong></div>)}</div>
            <div className="payment-entry"><input type="number" min="1" step="0.01" placeholder="Amount" value={paymentAmount} onChange={e=>setPaymentAmount(e.target.value)}/><select value={paymentMethod} onChange={e=>setPaymentMethod(e.target.value as PaymentMethod)}><option value="CASH">Cash</option><option value="BANK_TRANSFER">Bank transfer</option><option value="POS">POS</option><option value="CARD">Card</option><option value="OTHER">Other</option></select><button onClick={payManual}>Record payment</button><button className="secondary" onClick={payOnline}>Pay online with Paystack</button></div>
          </>}
          {selected.status==='ACCEPTED' && <p className="muted">The admission offer is accepted. Payment requirements are being prepared.</p>}
          {selected.status==='ADMITTED' && <div className="success-box"><strong>Admission finalized.</strong><p>Enrollment and portal accounts were created. Credentials are sent through the configured email channel.</p></div>}
          {payments.data?.data.length ? <div className="payment-history"><p className="eyebrow">PAYMENT HISTORY</p>{payments.data.data.map(p=><div key={p.id}><span>{p.reference} · {p.method}</span><strong>{money(p.amount)} · {p.status}</strong></div>)}</div>:null}
        </section>}
      </article>
    </section>

    <section className="admission-card batch-admission-card">
      <div className="card-heading"><div><p className="eyebrow">BULK ADMISSION</p><h2>Import applicants from Excel / CSV</h2><p className="muted">Use the Vaxad template. With “Grant admission” enabled, imported applicants are accepted and receive their blocking-fee invoice; unpaid applicants are never finalized.</p></div><button className="secondary" type="button" onClick={async()=>{const blob=await downloadTemplate().unwrap();const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='Vaxad-Admission-Batch-Template.csv';a.click();URL.revokeObjectURL(url);}}>Download template</button></div>
      <div className="batch-controls"><input type="file" accept=".csv,.xlsx" onChange={e=>setBatchFile(e.target.files?.[0]??null)}/><button type="button" disabled={!batchFile||importing} onClick={async()=>{if(!batchFile)return;const fd=new FormData();fd.append('file',batchFile);fd.append('grantAdmission','true');const r=await importBatch(fd).unwrap();setBatchResult(r.data);setBatchFile(null);}}>{importing?'Importing…':'Import & grant admission'}</button></div>
      {batchResult&&<div className="batch-result"><strong>{batchResult.importedRows} of {batchResult.totalRows} row(s) imported.</strong>{batchResult.errors?.length>0&&<ul>{batchResult.errors.map((e:any)=><li key={e.row}>Row {e.row}: {e.reason}</li>)}</ul>}</div>}
    </section>

    <section className="admission-card fee-schedule-card">
      <div className="card-heading"><div><p className="eyebrow">CONFIGURATION</p><h2>Admission fee schedule</h2><p className="muted">Only active items marked <strong>blocking</strong> are required before admission is finalized. Uniforms and other optional items can be billed separately.</p></div></div>
      <div className="fee-grid"><div>{fees.data?.data.map((f:AdmissionFeeItem)=><div className="fee-row" key={f.id}><div><strong>{f.name}</strong><small>{f.code} · {f.blocking?'Blocks admission':'Non-blocking'} · {f.active?'Active':'Inactive'}</small></div><strong>{money(f.amount)}</strong></div>)}</div><form className="compact-form" onSubmit={async e=>{e.preventDefault();await createFee({code:feeForm.code,name:feeForm.name,amount:Number(feeForm.amount),blocking:feeForm.blocking,active:feeForm.active}).unwrap();setFeeForm({code:'',name:'',amount:'',blocking:true,active:true});}}><p className="eyebrow">ADD CHARGE</p><input placeholder="Code" value={feeForm.code} onChange={e=>setFeeForm({...feeForm,code:e.target.value})} required/><input placeholder="Charge name" value={feeForm.name} onChange={e=>setFeeForm({...feeForm,name:e.target.value})} required/><input type="number" min="0" step="0.01" placeholder="Amount" value={feeForm.amount} onChange={e=>setFeeForm({...feeForm,amount:e.target.value})} required/><label className="check"><input type="checkbox" checked={feeForm.blocking} onChange={e=>setFeeForm({...feeForm,blocking:e.target.checked})}/> Blocks admission</label><button type="submit">Add charge</button></form></div>
    </section>
  </main>;
}
