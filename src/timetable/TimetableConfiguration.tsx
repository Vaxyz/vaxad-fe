import { useState } from 'react';
import type { FormEvent } from 'react';
import {
  useOperationalDaysQuery,
  useUpdateOperationalDayMutation,
  useTimetablePeriodsQuery,
  useCreateTimetablePeriodMutation,
  useUpdateTimetablePeriodMutation,
  useDeleteTimetablePeriodMutation,
  useActivateTimetablePeriodMutation,
  useDeactivateTimetablePeriodMutation,
  type CreateTimetablePeriodRequest,
  type TimetablePeriodType,
} from '../app/api';
import './timetable.css';

const emptyPeriod: CreateTimetablePeriodRequest = { code: '', name: '', startTime: '08:00', endTime: '08:40', sequence: 1, type: 'TEACHING' };

export default function TimetableConfiguration() {
  const days = useOperationalDaysQuery();
  const periods = useTimetablePeriodsQuery();
  const [updateDay] = useUpdateOperationalDayMutation();
  const [createPeriod] = useCreateTimetablePeriodMutation();
  const [updatePeriod] = useUpdateTimetablePeriodMutation();
  const [deletePeriod] = useDeleteTimetablePeriodMutation();
  const [activatePeriod] = useActivateTimetablePeriodMutation();
  const [deactivatePeriod] = useDeactivateTimetablePeriodMutation();
  const [form, setForm] = useState(emptyPeriod);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState('');

  const submit = async (event: FormEvent) => {
    event.preventDefault(); setError('');
    try {
      if (editingId) {
        await updatePeriod({ id: editingId, body: form }).unwrap();
        setEditingId(null);
        setForm({ ...emptyPeriod, sequence: (periods.data?.data.length ?? 0) + 1 });
      } else {
        await createPeriod(form).unwrap();
        setForm({ ...emptyPeriod, sequence: (periods.data?.data.length ?? 0) + 1 });
      }
    } catch (e: any) { setError(e?.data?.message ?? (editingId ? 'Could not update timetable period.' : 'Could not create timetable period.')); }
  };

  const editPeriod = (period: any) => {
    setEditingId(period.id);
    setForm({ code: period.code, name: period.name, startTime: period.startTime, endTime: period.endTime, sequence: period.sequence, type: period.type });
    setError('');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm({ ...emptyPeriod, sequence: (periods.data?.data.length ?? 0) + 1 });
    setError('');
  };

  const toggleDay = async (day: string, active: boolean) => {
    setError('');
    try { await updateDay({ day, active }).unwrap(); } catch (e: any) { setError(e?.data?.message ?? 'Could not update operational day.'); }
  };

  return <main className="timetable-page">
    <header className="timetable-header"><div><p className="eyebrow">TIMETABLE CONFIGURATION</p><h1>Shape the school day.</h1><p className="muted">Configure operational days and reusable periods before scheduling teachers, classes and rooms.</p></div></header>
    {error && <div className="error-banner">{error}</div>}
    <section className="timetable-grid">
      <article className="timetable-card">
        <div className="timetable-card-header"><div><h2>Operational days</h2><p>Choose the days on which lessons can be scheduled.</p></div></div>
        {days.isLoading ? <p>Loading…</p> : days.isError ? <p className="error-text">Could not load operational days.</p> : <div className="day-list">
          {days.data?.data.map(day => <div className="day-row" key={day.day}><div><strong>{day.label}</strong><small>Day {day.sequence}</small></div><button type="button" className={`switch ${day.active ? 'on' : ''}`} onClick={() => toggleDay(day.day, !day.active)} aria-label={`${day.active ? 'Disable' : 'Enable'} ${day.label}`}><span /></button></div>)}
        </div>}
      </article>
      <article className="timetable-card">
        <div className="timetable-card-header"><div><h2>{editingId ? 'Edit period' : 'Add a period'}</h2><p>Periods cannot overlap and sequence numbers are unique.</p></div></div>
        <form className="period-form" onSubmit={submit}>
          <input placeholder="Code e.g. P1" value={form.code} onChange={e => setForm({...form, code:e.target.value})} required />
          <input placeholder="Name e.g. Period 1" value={form.name} onChange={e => setForm({...form, name:e.target.value})} required />
          <input type="time" value={form.startTime} onChange={e => setForm({...form, startTime:e.target.value})} required />
          <input type="time" value={form.endTime} onChange={e => setForm({...form, endTime:e.target.value})} required />
          <input type="number" min="1" placeholder="Sequence" value={form.sequence} onChange={e => setForm({...form, sequence:Number(e.target.value)})} required />
          <select value={form.type} onChange={e => setForm({...form, type:e.target.value as TimetablePeriodType})}><option value="TEACHING">Teaching</option><option value="BREAK">Break</option><option value="ASSEMBLY">Assembly</option><option value="LUNCH">Lunch</option><option value="OTHER">Other</option></select>
          <button type="submit">{editingId ? 'Save changes' : 'Add period'}</button>{editingId && <button type="button" className="link-button" onClick={cancelEdit}>Cancel</button>}
        </form>
      </article>
      <article className="timetable-card full">
        <div className="timetable-card-header"><div><h2>School periods</h2><p>These reusable time blocks will power the timetable engine.</p></div><span className="pill">{periods.data?.data.length ?? 0} configured</span></div>
        {periods.isLoading ? <p>Loading…</p> : periods.isError ? <p className="error-text">Could not load periods.</p> : <div style={{overflowX:'auto'}}><table className="period-table"><thead><tr><th>#</th><th>Period</th><th>Time</th><th>Type</th><th>Status</th><th /></tr></thead><tbody>
          {periods.data?.data.map(period => <tr key={period.id}><td>{period.sequence}</td><td><strong>{period.name}</strong><small>{period.code}</small></td><td>{period.startTime} — {period.endTime}</td><td>{period.type}</td><td><span className={`pill ${period.active ? 'active' : 'inactive'}`}>{period.active ? 'Active' : 'Inactive'}</span></td><td><div className="period-actions"><button className="link-button" onClick={() => editPeriod(period)}>Edit</button>{period.active ? <button className="link-button" onClick={() => deactivatePeriod(period.id)}>Deactivate</button> : <button className="link-button" onClick={() => activatePeriod(period.id)}>Activate</button>}<button className="link-button" onClick={async () => { if (confirm(`Delete ${period.name}?`)) await deletePeriod(period.id); }}>Delete</button></div></td></tr>)}
          {!periods.data?.data.length && <tr><td colSpan={6}>No periods configured yet.</td></tr>}
        </tbody></table></div>}
      </article>
    </section>
  </main>;
}
