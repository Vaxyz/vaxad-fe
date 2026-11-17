import { useEffect, useState } from 'react';
import { useNotificationPreferencesQuery, useUpdateNotificationPreferencesMutation } from '../app/api';
import './notification-settings.css';

const labels:[keyof Preferences,string][]=[['emailEnabled','Email notifications'],['academicEnabled','Academic notifications'],['attendanceEnabled','Attendance notifications'],['feesEnabled','Payment & fee notifications'],['examinationEnabled','Examination notifications'],['announcementEnabled','Announcements'],['systemEnabled','System notifications']];
type Preferences={emailEnabled:boolean;academicEnabled:boolean;attendanceEnabled:boolean;feesEnabled:boolean;examinationEnabled:boolean;announcementEnabled:boolean;systemEnabled:boolean};
export default function NotificationSettings(){
 const {data,isLoading}=useNotificationPreferencesQuery(); const [save,{isLoading:saving}]=useUpdateNotificationPreferencesMutation(); const [form,setForm]=useState<Preferences|null>(null);
 useEffect(()=>{if(data?.data)setForm(data.data)},[data]);
 if(isLoading||!form)return <section className="notification-settings"><h1>Notification Settings</h1><p>Loading…</p></section>;
 return <section className="notification-settings"><div className="settings-hero"><div><span className="eyebrow">COMMUNICATION</span><h1>Notification Settings</h1><p>Choose which notifications should also be delivered by email.</p></div></div><div className="settings-card">{labels.map(([key,label])=><label className="setting-row" key={key}><span><strong>{label}</strong><small>Control email delivery for this category.</small></span><input type="checkbox" checked={form[key]} onChange={e=>setForm({...form,[key]:e.target.checked})}/></label>)}<button className="settings-save" disabled={saving} onClick={()=>save(form)}> {saving?'Saving…':'Save preferences'} </button></div></section>;
}
