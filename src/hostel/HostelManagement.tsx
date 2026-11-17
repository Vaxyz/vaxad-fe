import { FormEvent, useMemo, useState } from 'react';
import { useAcademicSessionsQuery, useTermsQuery, useEnrollmentsQuery, useHostelsQuery, useCreateHostelMutation, useHostelBlocksQuery, useCreateHostelBlockMutation, useHostelRoomsQuery, useCreateHostelRoomMutation, useHostelBedsQuery, useCreateHostelBedMutation, useAvailableHostelBedsQuery, useBoardingAllocationsByTermQuery, useCreateBoardingAllocationMutation, useCheckInBoardingMutation, useCheckOutBoardingMutation } from '../app/api';
import './hostel.css';

export default function HostelManagement() {
  const { data: sessionsData } = useAcademicSessionsQuery();
  const sessions = sessionsData?.data ?? [];
  const [sessionId, setSessionId] = useState('');
  const activeSessionId = sessionId || sessions.find(s=>s.active)?.id || sessions[0]?.id || '';
  const { data: termsData } = useTermsQuery(activeSessionId || undefined);
  const terms = termsData?.data ?? [];
  const [termId, setTermId] = useState('');
  const activeTermId = termId || terms.find(t=>t.active)?.id || terms[0]?.id || '';
  const { data: hostelsData, isLoading } = useHostelsQuery();
  const hostels = hostelsData?.data ?? [];
  const { data: allocationsData } = useBoardingAllocationsByTermQuery(activeTermId, { skip: !activeTermId });
  const allocations = allocationsData?.data ?? [];
  const { data: bedsData } = useAvailableHostelBedsQuery();
  const availableBeds = bedsData?.data ?? [];
  const { data: enrollmentsData } = useEnrollmentsQuery({ termId: activeTermId }, { skip: !activeTermId });
  const enrollments = enrollmentsData?.data ?? [];

  const [createHostel] = useCreateHostelMutation();
  const [createBlock] = useCreateHostelBlockMutation();
  const [createRoom] = useCreateHostelRoomMutation();
  const [createBed] = useCreateHostelBedMutation();
  const [allocate] = useCreateBoardingAllocationMutation();
  const [checkIn] = useCheckInBoardingMutation();
  const [checkOut] = useCheckOutBoardingMutation();
  const [selectedHostel, setSelectedHostel] = useState('');
  const [selectedBlock, setSelectedBlock] = useState('');
  const [selectedRoom, setSelectedRoom] = useState('');
  const { data: blocksData } = useHostelBlocksQuery(selectedHostel, { skip: !selectedHostel });
  const { data: roomsData } = useHostelRoomsQuery(selectedBlock, { skip: !selectedBlock });
  const { data: bedsForRoomData } = useHostelBedsQuery(selectedRoom, { skip: !selectedRoom });
  const blocks = blocksData?.data ?? []; const rooms = roomsData?.data ?? []; const bedsForRoom = bedsForRoomData?.data ?? [];
  const [hostelForm, setHostelForm] = useState({code:'',name:'',gender:'',description:''});
  const [blockForm, setBlockForm] = useState({code:'',name:'',floorNumber:''});
  const [roomForm, setRoomForm] = useState({code:'',name:'',capacity:'4'});
  const [bedForm, setBedForm] = useState({code:''});
  const [allocation, setAllocation] = useState({enrollmentId:'',bedId:'',checkInDate:''});

  const occupancy = allocations.filter(a=>a.status==='ALLOCATED'||a.status==='CHECKED_IN').length;
  const stats = useMemo(()=>({hostels:hostels.length, occupied:occupancy, available:availableBeds.length}),[hostels.length,occupancy,availableBeds.length]);
  const submitHostel = async(e:FormEvent)=>{e.preventDefault();await createHostel(hostelForm).unwrap();setHostelForm({code:'',name:'',gender:'',description:''});};
  const submitBlock = async(e:FormEvent)=>{e.preventDefault();if(!selectedHostel)return;await createBlock({hostelId:selectedHostel,body:{code:blockForm.code,name:blockForm.name,floorNumber:blockForm.floorNumber?Number(blockForm.floorNumber):undefined}}).unwrap();setBlockForm({code:'',name:'',floorNumber:''});};
  const submitRoom = async(e:FormEvent)=>{e.preventDefault();if(!selectedBlock)return;await createRoom({blockId:selectedBlock,body:{code:roomForm.code,name:roomForm.name,capacity:Number(roomForm.capacity)}}).unwrap();setRoomForm({code:'',name:'',capacity:'4'});};
  const submitBed = async(e:FormEvent)=>{e.preventDefault();if(!selectedRoom)return;await createBed({roomId:selectedRoom,body:bedForm}).unwrap();setBedForm({code:''});};
  const submitAllocation = async(e:FormEvent)=>{e.preventDefault();if(!allocation.enrollmentId||!allocation.bedId)return;await allocate({enrollmentId:allocation.enrollmentId,bedId:allocation.bedId,checkInDate:allocation.checkInDate||undefined}).unwrap();setAllocation({enrollmentId:'',bedId:'',checkInDate:''});};

  return <div className="hostel-page">
    <section className="hostel-hero"><div><span className="hostel-eyebrow">V19-C · BOARDING</span><h1>Hostel & Boarding Management</h1><p>Manage hostels, blocks, rooms, beds and student boarding allocations from one operational workspace.</p></div><div className="hostel-stats"><div><strong>{stats.hostels}</strong><span>Hostels</span></div><div><strong>{stats.occupied}</strong><span>Occupied</span></div><div><strong>{stats.available}</strong><span>Available beds</span></div></div></section>
    <section className="hostel-toolbar"><label>Academic session<select value={activeSessionId} onChange={e=>{setSessionId(e.target.value);setTermId('')}}><option value="">Select session</option>{sessions.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select></label><label>Term<select value={activeTermId} onChange={e=>setTermId(e.target.value)}><option value="">Select term</option>{terms.map(t=><option key={t.id} value={t.id}>{t.name}</option>)}</select></label></section>
    <div className="hostel-grid">
      <section className="hostel-card"><div className="hostel-card-head"><div><span className="hostel-eyebrow">CONFIGURATION</span><h2>New hostel</h2></div></div><form onSubmit={submitHostel} className="hostel-form"><input placeholder="Code · GIRLS-A" value={hostelForm.code} onChange={e=>setHostelForm({...hostelForm,code:e.target.value})} required/><input placeholder="Hostel name" value={hostelForm.name} onChange={e=>setHostelForm({...hostelForm,name:e.target.value})} required/><input placeholder="Gender · Girls / Boys / Mixed" value={hostelForm.gender} onChange={e=>setHostelForm({...hostelForm,gender:e.target.value})}/><textarea placeholder="Description" value={hostelForm.description} onChange={e=>setHostelForm({...hostelForm,description:e.target.value})}/><button className="hostel-primary">Create hostel</button></form></section>
      <section className="hostel-card"><div className="hostel-card-head"><div><span className="hostel-eyebrow">BOARDING DIRECTORY</span><h2>Hostels</h2></div></div>{isLoading?<p>Loading…</p>:<div className="hostel-list">{hostels.map(h=><button className={selectedHostel===h.id?'hostel-list-row selected':'hostel-list-row'} key={h.id} onClick={()=>{setSelectedHostel(h.id);setSelectedBlock('');setSelectedRoom('')}}><span><strong>{h.name}</strong><small>{h.code}{h.gender?` · ${h.gender}`:''}</small></span><em>{h.active?'Active':'Inactive'}</em></button>)}</div>}</section>
    </div>
    {selectedHostel && <section className="hostel-card"><div className="hostel-card-head"><div><span className="hostel-eyebrow">HOSTEL STRUCTURE</span><h2>Blocks, rooms & beds</h2></div></div><div className="hostel-structure"><div><h3>Blocks</h3>{blocks.map(b=><button className={selectedBlock===b.id?'hostel-chip selected':'hostel-chip'} key={b.id} onClick={()=>{setSelectedBlock(b.id);setSelectedRoom('')}}>{b.name} <small>{b.code}</small></button>)}<form onSubmit={submitBlock} className="inline-form"><input placeholder="Block code" value={blockForm.code} onChange={e=>setBlockForm({...blockForm,code:e.target.value})} required/><input placeholder="Block name" value={blockForm.name} onChange={e=>setBlockForm({...blockForm,name:e.target.value})} required/><button>Add block</button></form></div>{selectedBlock&&<div><h3>Rooms</h3>{rooms.map(r=><button className={selectedRoom===r.id?'hostel-chip selected':'hostel-chip'} key={r.id} onClick={()=>setSelectedRoom(r.id)}>{r.name} <small>{r.capacity} beds</small></button>)}<form onSubmit={submitRoom} className="inline-form"><input placeholder="Room code" value={roomForm.code} onChange={e=>setRoomForm({...roomForm,code:e.target.value})} required/><input placeholder="Room name" value={roomForm.name} onChange={e=>setRoomForm({...roomForm,name:e.target.value})} required/><input type="number" min="1" value={roomForm.capacity} onChange={e=>setRoomForm({...roomForm,capacity:e.target.value})}/><button>Add room</button></form></div>}{selectedRoom&&<div><h3>Beds</h3>{bedsForRoom.map(b=><span className={`hostel-bed ${b.status.toLowerCase()}`} key={b.id}>{b.code} · {b.status}</span>)}<form onSubmit={submitBed} className="inline-form"><input placeholder="Bed code" value={bedForm.code} onChange={e=>setBedForm({code:e.target.value})} required/><button>Add bed</button></form></div>}</div></section>}
    <div className="hostel-grid"><section className="hostel-card"><div className="hostel-card-head"><div><span className="hostel-eyebrow">ALLOCATION</span><h2>Allocate student</h2></div></div><form onSubmit={submitAllocation} className="hostel-form"><select value={allocation.enrollmentId} onChange={e=>setAllocation({...allocation,enrollmentId:e.target.value})} required><option value="">Select active enrollment</option>{enrollments.map(e=><option key={e.id} value={e.id}>{e.admissionNumber} · {e.studentName} · {e.className}</option>)}</select><select value={allocation.bedId} onChange={e=>setAllocation({...allocation,bedId:e.target.value})} required><option value="">Select available bed</option>{availableBeds.map(b=><option key={b.id} value={b.id}>{b.code}</option>)}</select><label>Check-in date<input type="date" value={allocation.checkInDate} onChange={e=>setAllocation({...allocation,checkInDate:e.target.value})}/></label><button className="hostel-primary">Allocate student</button></form></section>
      <section className="hostel-card"><div className="hostel-card-head"><div><span className="hostel-eyebrow">CURRENT TERM</span><h2>Boarding allocations</h2></div></div>{allocations.length===0?<p>No boarding allocations for this term.</p>:<div className="hostel-list">{allocations.map(a=><div className="hostel-list-row" key={a.id}><span><strong>{a.studentId}</strong><small>{a.status} · bed {a.bedId}</small></span><span className="hostel-actions">{a.status==='ALLOCATED'&&<button onClick={()=>checkIn({id:a.id,body:{}})}>Check in</button>}{(a.status==='ALLOCATED'||a.status==='CHECKED_IN')&&<button onClick={()=>checkOut({id:a.id,body:{}})}>Check out</button>}</span></div>)}</div>}</section></div>
  </div>;
}
