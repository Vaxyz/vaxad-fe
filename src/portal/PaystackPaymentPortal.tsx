import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useFeeChargesQuery, useInitializeGatewayPaymentMutation, usePortalFinancialStudentsQuery } from '../app/api';

const money=(value:number)=>new Intl.NumberFormat('en-NG',{style:'currency',currency:'NGN'}).format(value);

export default function PaystackPaymentPortal(){
  const [params]=useSearchParams();
  const {data:studentsResponse,isLoading:studentsLoading}=usePortalFinancialStudentsQuery();
  const students=studentsResponse?.data??[];
  const [studentId,setStudentId]=useState(params.get('studentId')||'');
  const activeStudentId=studentId||students[0]?.id||'';
  const {data:chargesResponse,isLoading:chargesLoading}=useFeeChargesQuery({studentId:activeStudentId},{skip:!activeStudentId});
  const charges=(chargesResponse?.data??[]).filter(c=>c.balance>0);
  const [selectedChargeId,setSelectedChargeId]=useState('');
  const selected=charges.find(c=>c.id===selectedChargeId);
  const [amount,setAmount]=useState('');
  const [initialize,{isLoading,error}]=useInitializeGatewayPaymentMutation();
  const payable=useMemo(()=>selected?.balance??0,[selected]);

  const pay=async()=>{
    if(!selected||!amount||Number(amount)<=0)return;
    if(Number(amount)>payable){alert(`Amount cannot exceed ${money(payable)}`);return;}
    const result=await initialize({enrollmentId:selected.enrollmentId,feeChargeId:selected.id,amount:Number(amount)}).unwrap();
    if(result.data.authorizationUrl) window.location.assign(result.data.authorizationUrl);
  };

  return <section className="portal-page">
    <div className="portal-hero"><div><span className="eyebrow">ONLINE SCHOOL FEES</span><h1>Pay with Paystack</h1><p>Securely pay an outstanding school charge using Paystack.</p></div></div>
    <div className="portal-card">
      <label>Student<select value={activeStudentId} onChange={e=>{setStudentId(e.target.value);setSelectedChargeId('');setAmount('')}} disabled={studentsLoading}><option value="">Select student</option>{students.map(s=><option key={s.id} value={s.id}>{s.firstName} {s.lastName} — {s.admissionNumber}</option>)}</select></label>
      <label>Outstanding charge<select value={selectedChargeId} onChange={e=>{setSelectedChargeId(e.target.value);setAmount('')}} disabled={chargesLoading||charges.length===0}><option value="">Select charge</option>{charges.map(c=><option key={c.id} value={c.id}>{c.feeName} — {money(c.balance)}</option>)}</select></label>
      {selected&&<><p>Outstanding balance: <strong>{money(selected.balance)}</strong></p><label>Amount to pay<input type="number" min="0.01" max={selected.balance} step="0.01" value={amount} onChange={e=>setAmount(e.target.value)} placeholder={selected.balance.toFixed(2)}/></label><button type="button" onClick={pay} disabled={isLoading||!amount}> {isLoading?'Initializing…':'Continue to Paystack'} </button></>}
      {error&&<div className="portal-alert">Unable to initialize the payment. Please try again.</div>}
    </div>
  </section>;
}
