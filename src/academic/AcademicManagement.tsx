import { useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import {
  useAcademicSessionsQuery,
  useCreateAcademicSessionMutation,
  useActivateAcademicSessionMutation,
  useTermsQuery,
  useCreateTermMutation,
  useActivateTermMutation,
  useSubjectsQuery,
  useCreateSubjectMutation,
  useClassesQuery,
  useCreateClassMutation,
  useTeachersQuery,
  useTeachingAssignmentsQuery,
  useCreateTeachingAssignmentMutation,
  useDeleteTeachingAssignmentMutation,
  type AcademicSession,
  type Term,
  type Subject,
  type SchoolClass,
  type TeachingAssignment,
} from '../app/api';
import './academic.css';

const emptySession = { name: '', startDate: '', endDate: '' };
const emptyTerm = { academicSessionId: '', name: '', startDate: '', endDate: '' };
const emptySubject = { code: '', name: '', description: '' };
const emptyClass = { code: '', name: '', section: '' };
const emptyAssignment = { academicSessionId: '', termId: '', classId: '', subjectId: '', teacherId: '' };

export default function AcademicManagement() {
  const sessions = useAcademicSessionsQuery();
  const terms = useTermsQuery();
  const subjects = useSubjectsQuery();
  const classes = useClassesQuery();
  const [createSession] = useCreateAcademicSessionMutation();
  const [activateSession] = useActivateAcademicSessionMutation();
  const [createTerm] = useCreateTermMutation();
  const [activateTerm] = useActivateTermMutation();
  const [createSubject] = useCreateSubjectMutation();
  const [createClass] = useCreateClassMutation();
  const teachers = useTeachersQuery();
  const assignments = useTeachingAssignmentsQuery();
  const [createTeachingAssignment] = useCreateTeachingAssignmentMutation();
  const [deleteTeachingAssignment] = useDeleteTeachingAssignmentMutation();
  const [session, setSession] = useState(emptySession);
  const [term, setTerm] = useState(emptyTerm);
  const [subject, setSubject] = useState(emptySubject);
  const [schoolClass, setSchoolClass] = useState(emptyClass);
  const [assignment, setAssignment] = useState(emptyAssignment);

  const submit = async (event: FormEvent, action: () => Promise<unknown>, reset: () => void) => {
    event.preventDefault();
    await action();
    reset();
  };

  return <main className="academic page">
    <header className="academic-header">
      <div><p className="eyebrow">ACADEMIC MANAGEMENT</p><h1>Academic structure</h1><p className="muted">Manage sessions, terms, classes and subjects from one shared module.</p></div>
    </header>

    <section className="academic-grid">
      <AcademicCard title="Academic Sessions" count={sessions.data?.data.length ?? 0}>
        <form onSubmit={(e) => submit(e, () => createSession(session).unwrap(), () => setSession(emptySession))} className="compact-form">
          <input placeholder="e.g. 2026/2027" value={session.name} onChange={e => setSession({...session, name:e.target.value})} required />
          <div className="form-row"><input type="date" value={session.startDate} onChange={e => setSession({...session, startDate:e.target.value})}/><input type="date" value={session.endDate} onChange={e => setSession({...session, endDate:e.target.value})}/></div>
          <button type="submit">Add session</button>
        </form>
        <ListState loading={sessions.isLoading} error={sessions.isError}>
          {sessions.data?.data.map((item: AcademicSession) => <div className="list-item" key={item.id}><div><strong>{item.name}</strong><small>{item.startDate ?? 'No start date'} → {item.endDate ?? 'No end date'}</small></div>{item.active ? <span className="badge active">Active</span> : <button className="link-button" onClick={() => activateSession(item.id)}>Activate</button>}</div>)}
        </ListState>
      </AcademicCard>

      <AcademicCard title="Terms" count={terms.data?.data.length ?? 0}>
        <form onSubmit={(e) => submit(e, () => createTerm(term).unwrap(), () => setTerm(emptyTerm))} className="compact-form">
          <select value={term.academicSessionId} onChange={e => setTerm({...term, academicSessionId:e.target.value})} required><option value="">Select session</option>{sessions.data?.data.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select>
          <input placeholder="e.g. First Term" value={term.name} onChange={e => setTerm({...term, name:e.target.value})} required />
          <div className="form-row"><input type="date" value={term.startDate} onChange={e => setTerm({...term, startDate:e.target.value})}/><input type="date" value={term.endDate} onChange={e => setTerm({...term, endDate:e.target.value})}/></div>
          <button type="submit">Add term</button>
        </form>
        <ListState loading={terms.isLoading} error={terms.isError}>
          {terms.data?.data.map((item: Term) => <div className="list-item" key={item.id}><div><strong>{item.name}</strong><small>{sessions.data?.data.find(s => s.id === item.academicSessionId)?.name ?? 'Session unavailable'}</small></div>{item.active ? <span className="badge active">Active</span> : <button className="link-button" onClick={() => activateTerm(item.id)}>Activate</button>}</div>)}
        </ListState>
      </AcademicCard>

      <AcademicCard title="Classes" count={classes.data?.data.length ?? 0}>
        <form onSubmit={(e) => submit(e, () => createClass(schoolClass).unwrap(), () => setSchoolClass(emptyClass))} className="compact-form">
          <div className="form-row"><input placeholder="Code" value={schoolClass.code} onChange={e => setSchoolClass({...schoolClass, code:e.target.value})} required/><input placeholder="Class name" value={schoolClass.name} onChange={e => setSchoolClass({...schoolClass, name:e.target.value})} required/></div>
          <input placeholder="Section (optional)" value={schoolClass.section} onChange={e => setSchoolClass({...schoolClass, section:e.target.value})}/>
          <button type="submit">Add class</button>
        </form>
        <ListState loading={classes.isLoading} error={classes.isError}>
          {classes.data?.data.map((item: SchoolClass) => <div className="list-item" key={item.id}><div><strong>{item.name}</strong><small>{item.code}{item.section ? ` · ${item.section}` : ''}</small></div><span className="badge">{item.active ? 'Active' : 'Inactive'}</span></div>)}
        </ListState>
      </AcademicCard>

      <AcademicCard title="Subjects" count={subjects.data?.data.length ?? 0}>
        <form onSubmit={(e) => submit(e, () => createSubject(subject).unwrap(), () => setSubject(emptySubject))} className="compact-form">
          <div className="form-row"><input placeholder="Code" value={subject.code} onChange={e => setSubject({...subject, code:e.target.value})} required/><input placeholder="Subject name" value={subject.name} onChange={e => setSubject({...subject, name:e.target.value})} required/></div>
          <input placeholder="Description (optional)" value={subject.description} onChange={e => setSubject({...subject, description:e.target.value})}/>
          <button type="submit">Add subject</button>
        </form>
        <ListState loading={subjects.isLoading} error={subjects.isError}>
          {subjects.data?.data.map((item: Subject) => <div className="list-item" key={item.id}><div><strong>{item.name}</strong><small>{item.code}{item.description ? ` · ${item.description}` : ''}</small></div><span className="badge">{item.active ? 'Active' : 'Inactive'}</span></div>)}
        </ListState>
      </AcademicCard>

      <AcademicCard title="Teaching Assignments" count={assignments.data?.data.length ?? 0}>
        <form onSubmit={(e) => submit(e, () => createTeachingAssignment(assignment).unwrap(), () => setAssignment(emptyAssignment))} className="compact-form">
          <select value={assignment.academicSessionId} onChange={e => setAssignment({...assignment, academicSessionId:e.target.value, termId:''})} required>
            <option value="">Select session</option>
            {sessions.data?.data.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <select value={assignment.termId} onChange={e => setAssignment({...assignment, termId:e.target.value})} required>
            <option value="">Select term</option>
            {terms.data?.data.filter(t => t.academicSessionId === assignment.academicSessionId).map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
          <select value={assignment.classId} onChange={e => setAssignment({...assignment, classId:e.target.value})} required>
            <option value="">Select class</option>
            {classes.data?.data.map(c => <option key={c.id} value={c.id}>{c.name}{c.section ? ` · ${c.section}` : ''}</option>)}
          </select>
          <select value={assignment.subjectId} onChange={e => setAssignment({...assignment, subjectId:e.target.value})} required>
            <option value="">Select subject</option>
            {subjects.data?.data.map(s => <option key={s.id} value={s.id}>{s.code} — {s.name}</option>)}
          </select>
          <select value={assignment.teacherId} onChange={e => setAssignment({...assignment, teacherId:e.target.value})} required>
            <option value="">Select teacher</option>
            {teachers.data?.data.map(t => <option key={t.id} value={t.id}>{t.staffNumber} — {t.firstName} {t.lastName}</option>)}
          </select>
          <button type="submit" disabled={!teachers.data?.data.length}>Assign teacher</button>
          {!teachers.data?.data.length && <small className="muted">Create teachers first; the existing teacher API is reused by this module.</small>}
        </form>
        <ListState loading={assignments.isLoading} error={assignments.isError}>
          {assignments.data?.data.map((item: TeachingAssignment) => {
            const cls = classes.data?.data.find(c => c.id === item.classId);
            const sub = subjects.data?.data.find(x => x.id === item.subjectId);
            const teacher = teachers.data?.data.find(x => x.id === item.teacherId);
            const term = terms.data?.data.find(x => x.id === item.termId);
            return <div className="list-item" key={item.id}>
              <div><strong>{sub?.code ?? 'Subject'} · {cls?.name ?? 'Class'}</strong><small>{teacher ? `${teacher.firstName} ${teacher.lastName}` : 'Teacher unavailable'} · {term?.name ?? 'Term unavailable'}</small></div>
              <button className="link-button" onClick={() => deleteTeachingAssignment(item.id)}>Remove</button>
            </div>;
          })}
        </ListState>
      </AcademicCard>
    </section>
  </main>;
}

function AcademicCard({title,count,children}:{title:string;count:number;children:ReactNode}) {
  return <article className="academic-card"><div className="card-heading"><div><p className="eyebrow">ACADEMIC</p><h2>{title}</h2></div><span className="count">{count}</span></div>{children}</article>;
}

function ListState({loading,error,children}:{loading:boolean;error:boolean;children:ReactNode}) {
  if (loading) return <p className="muted">Loading…</p>;
  if (error) return <p className="error-text">Could not load this section. Check your session and retry.</p>;
  return <div className="list">{children}</div>;
}
