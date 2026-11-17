import { useMemo, useState } from 'react';
import { useMarkAllNotificationsReadMutation, useMarkNotificationReadMutation, useNotificationsQuery } from '../app/api';
import './notifications-center.css';

const filters = ['ALL','UNREAD','ANNOUNCEMENT','ACADEMIC','ATTENDANCE','FEES','EXAMINATION','SYSTEM'] as const;
export default function NotificationsCenter() {
  const { data, isLoading, error } = useNotificationsQuery();
  const [read] = useMarkNotificationReadMutation();
  const [readAll] = useMarkAllNotificationsReadMutation();
  const [filter, setFilter] = useState<typeof filters[number]>('ALL');
  const items = useMemo(() => (data?.data ?? []).filter(n => filter === 'ALL' || (filter === 'UNREAD' ? !n.readAt : n.category === filter)), [data, filter]);
  const unread = (data?.data ?? []).filter(n => !n.readAt).length;
  return <section className="notifications-center">
    <div className="notifications-hero"><div><span className="eyebrow">COMMUNICATION CENTRE</span><h1>Notifications</h1><p>Stay informed about school activities, academics, attendance, fees and examinations.</p></div><button disabled={!unread} onClick={() => readAll()}>Mark all as read</button></div>
    <div className="notification-filters">{filters.map(f=><button key={f} className={filter===f?'active':''} onClick={()=>setFilter(f)}>{f.replace('_',' ')}</button>)}</div>
    {error && <p className="alert">Unable to load notifications.</p>}
    {isLoading ? <div className="notification-empty">Loading notifications…</div> : items.length === 0 ? <div className="notification-empty"><strong>No notifications</strong><span>{filter === 'ALL' ? 'You are all caught up.' : 'Nothing matches this filter.'}</span></div> : <div className="notification-list">{items.map(n=><article key={n.id} className={`notification-card ${n.readAt?'read':'unread'}`}><div className="notification-icon">{n.category==='FEES'?'₦':n.category==='EXAMINATION'?'EX':n.category==='ATTENDANCE'?'✓':n.category==='ACADEMIC'?'A':'N'}</div><div className="notification-body"><div className="notification-meta"><span>{n.category}</span><time>{new Date(n.createdAt).toLocaleString()}</time></div><h2>{n.title}</h2><p>{n.message}</p>{!n.readAt&&<button className="read-button" onClick={()=>read(n.id)}>Mark as read</button>}</div></article>)}</div>}
  </section>;
}
