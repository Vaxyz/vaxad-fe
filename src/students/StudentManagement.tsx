import { FormEvent, useState } from 'react';
import {
  useAcademicSessionsQuery, useClassesQuery, useCreateEnrollmentMutation, useCreateGuardianMutation,
  useCreateStudentMutation, useEnrollmentsQuery, useGuardiansQuery, useLinkGuardianMutation,
  useStudentGuardiansQuery, useStudentsQuery, useTermsQuery
} from '../app/api';
import './student-management.css';
import { useAppSelector } from '../app/hooks';
import { hasAnyRole } from '../security/roles';

const emptyStudent = { admissionNumber: '', firstName: '', lastName: '', dateOfBirth: '', gender: '', email: '', phone: '' };
const emptyGuardian = { firstName: '', lastName: '', phone: '', email: '', address: '' };
const emptyEnrollment = { studentId: '', academicSessionId: '', termId: '', classId: '' };

export default function StudentManagement() {
  const user = useAppSelector(state => state.auth.user);
  const canManage = hasAnyRole(user?.roles, ['SUPER_ADMIN','ADMIN','PRINCIPAL','VICE_PRINCIPAL']);
  const students = useStudentsQuery();
  const guardians = useGuardiansQuery();
  const sessions = useAcademicSessionsQuery();
  const classes = useClassesQuery();
  const terms = useTermsQuery();
  const enrollments = useEnrollmentsQuery();
  const [createStudent] = useCreateStudentMutation();
  const [createGuardian] = useCreateGuardianMutation();
  const [createEnrollment] = useCreateEnrollmentMutation();
  const [linkGuardian] = useLinkGuardianMutation();
  const [student, setStudent] = useState(emptyStudent);
  const [guardian, setGuardian] = useState(emptyGuardian);
  const [enrollment, setEnrollment] = useState(emptyEnrollment);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [link, setLink] = useState({ guardianId: '', relationship: '', primaryContact: true });
  const studentGuardians = useStudentGuardiansQuery(selectedStudentId, { skip: !selectedStudentId });

  const submit = async (event: FormEvent, action: () => Promise<unknown>, reset: () => void) => {
    event.preventDefault();
    await action();
    reset();
  };

  const selectedStudent = students.data?.data.find(s => s.id === selectedStudentId);

  return <main className="students page">
    <header className="students-header">
      <div><p className="eyebrow">PEOPLE & ENROLLMENT</p><h1>Students</h1><p className="muted">View student records. Authorized school management roles can maintain profiles, guardians and academic placement.</p></div>
    </header>

    <section className="students-grid">
      <article className="student-card">
        <div className="card-heading"><div><p className="eyebrow">STUDENT RECORDS</p><h2>Students</h2></div><span className="count">{students.data?.data.length ?? 0}</span></div>
{canManage &&         <form className="compact-form" onSubmit={e => submit(e, () => createStudent(student).unwrap(), () => setStudent(emptyStudent))}>
          <div className="form-row"><input placeholder="Admission number" value={student.admissionNumber} onChange={e => setStudent({...student, admissionNumber:e.target.value})} required/><select value={student.gender} onChange={e => setStudent({...student, gender:e.target.value})}><option value="">Gender</option><option>MALE</option><option>FEMALE</option></select></div>
          <div className="form-row"><input placeholder="First name" value={student.firstName} onChange={e => setStudent({...student, firstName:e.target.value})} required/><input placeholder="Last name" value={student.lastName} onChange={e => setStudent({...student, lastName:e.target.value})} required/></div>
          <div className="form-row"><input type="date" value={student.dateOfBirth} onChange={e => setStudent({...student, dateOfBirth:e.target.value})}/><input placeholder="Phone" value={student.phone} onChange={e => setStudent({...student, phone:e.target.value})}/></div>
          <input type="email" placeholder="Email (optional)" value={student.email} onChange={e => setStudent({...student, email:e.target.value})}/>
          <button type="submit">Register student</button>
        </form>}
        <div className="list">{students.isLoading ? <p className="muted">Loading students…</p> : students.data?.data.map(s => <button type="button" key={s.id} className={`student-list-item ${selectedStudentId === s.id ? 'selected' : ''}`} onClick={() => setSelectedStudentId(s.id)}><span><strong>{s.firstName} {s.lastName}</strong><small>{s.admissionNumber} · {s.status}</small></span><span className="badge">{s.status}</span></button>)}</div>
      </article>

      <article className="student-card">
        <div className="card-heading"><div><p className="eyebrow">FAMILY</p><h2>Guardian records</h2></div><span className="count">{guardians.data?.data.length ?? 0}</span></div>
{canManage &&         <form className="compact-form" onSubmit={e => submit(e, () => createGuardian(guardian).unwrap(), () => setGuardian(emptyGuardian))}>
          <div className="form-row"><input placeholder="First name" value={guardian.firstName} onChange={e => setGuardian({...guardian, firstName:e.target.value})} required/><input placeholder="Last name" value={guardian.lastName} onChange={e => setGuardian({...guardian, lastName:e.target.value})} required/></div>
          <div className="form-row"><input placeholder="Phone" value={guardian.phone} onChange={e => setGuardian({...guardian, phone:e.target.value})} required/><input type="email" placeholder="Email" value={guardian.email} onChange={e => setGuardian({...guardian, email:e.target.value})}/></div>
          <input placeholder="Address" value={guardian.address} onChange={e => setGuardian({...guardian, address:e.target.value})}/>
          <button type="submit">Add guardian</button>
        </form>}
        <div className="list">{guardians.data?.data.map(g => <div className="list-item" key={g.id}><div><strong>{g.firstName} {g.lastName}</strong><small>{g.phone}{g.email ? ` · ${g.email}` : ''}</small></div><span className="badge">Guardian</span></div>)}</div>
      </article>

      <article className="student-card wide">
        <div className="card-heading"><div><p className="eyebrow">ACADEMIC PLACEMENT</p><h2>Enroll student</h2></div><span className="count">{enrollments.data?.data.length ?? 0}</span></div>
{canManage &&         <form className="compact-form enrollment-form" onSubmit={e => submit(e, () => createEnrollment(enrollment).unwrap(), () => setEnrollment(emptyEnrollment))}>
          <select value={enrollment.studentId} onChange={e => setEnrollment({...enrollment, studentId:e.target.value})} required><option value="">Select student</option>{students.data?.data.map(s => <option key={s.id} value={s.id}>{s.admissionNumber} — {s.firstName} {s.lastName}</option>)}</select>
          <select value={enrollment.academicSessionId} onChange={e => setEnrollment({...enrollment, academicSessionId:e.target.value, termId:''})} required><option value="">Select academic session</option>{sessions.data?.data.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select>
          <select value={enrollment.termId} onChange={e => setEnrollment({...enrollment, termId:e.target.value})} required><option value="">Select term</option>{terms.data?.data.filter(t => t.academicSessionId === enrollment.academicSessionId).map(t => <option key={t.id} value={t.id}>{t.name}</option>)}</select>
          <select value={enrollment.classId} onChange={e => setEnrollment({...enrollment, classId:e.target.value})} required><option value="">Select class</option>{classes.data?.data.map(c => <option key={c.id} value={c.id}>{c.code} — {c.name}{c.section ? ` · ${c.section}` : ''}</option>)}</select>
          <button type="submit">Enroll student</button>
        </form>}
        <div className="list">{enrollments.data?.data.map(e => <div className="list-item" key={e.id}><div><strong>{e.studentName}</strong><small>{e.admissionNumber} · {e.academicSessionName} · {e.termName} · {e.classCode}</small></div><span className={`badge ${e.status === 'ACTIVE' ? 'active' : ''}`}>{e.status}</span></div>)}</div>
      </article>

      {selectedStudent && <article className="student-card wide">
        <div className="card-heading"><div><p className="eyebrow">STUDENT PROFILE</p><h2>{selectedStudent.firstName} {selectedStudent.lastName}</h2><p className="muted">{selectedStudent.admissionNumber}</p></div></div>
{canManage &&         <form className="compact-form guardian-link-form" onSubmit={e => submit(e, () => linkGuardian({studentId:selectedStudent.id, body:link}).unwrap(), () => setLink({guardianId:'', relationship:'', primaryContact:true}))}>
          <select value={link.guardianId} onChange={e => setLink({...link, guardianId:e.target.value})} required><option value="">Select guardian</option>{guardians.data?.data.map(g => <option key={g.id} value={g.id}>{g.firstName} {g.lastName} — {g.phone}</option>)}</select>
          <input placeholder="Relationship (e.g. Mother)" value={link.relationship} onChange={e => setLink({...link, relationship:e.target.value})} required/>
          <label className="check"><input type="checkbox" checked={link.primaryContact} onChange={e => setLink({...link, primaryContact:e.target.checked})}/> Primary contact</label>
          <button type="submit">Link guardian</button>
        </form>}
        <div className="list">{studentGuardians.data?.data.map(g => <div className="list-item" key={g.id}><div><strong>{g.firstName} {g.lastName}</strong><small>{g.relationship} · {g.phone}{g.email ? ` · ${g.email}` : ''}</small></div>{g.primaryContact && <span className="badge active">Primary</span>}</div>)}</div>
      </article>}
    </section>
  </main>;
}
