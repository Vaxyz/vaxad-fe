import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { logout } from '../features/auth/authSlice';
import { useUnreadNotificationCountQuery } from '../app/api';
import { hasAnyRole } from '../security/roles';
import type { Role } from '../types/auth';
import './app-shell.css';

type NavItem = { label: string; to: string; icon: string; roles?: Role[] };

const groups: { title: string; items: NavItem[] }[] = [
  { title: 'Overview', items: [{ label: 'Dashboard', to: '/dashboard', icon: '⌂' }] },
  { title: 'School', items: [
    { label: 'Academic', to: '/academic', icon: 'A', roles: ['SUPER_ADMIN','ADMIN','PRINCIPAL','VICE_PRINCIPAL','TEACHER'] },
    { label: 'Academic Reporting', to: '/academic/reporting', icon: 'AR', roles: ['SUPER_ADMIN','ADMIN','PRINCIPAL','VICE_PRINCIPAL','TEACHER'] },
    { label: 'Teachers', to: '/teachers', icon: 'T', roles: ['SUPER_ADMIN','ADMIN','PRINCIPAL','VICE_PRINCIPAL','TEACHER','BURSAR','STUDENT','PARENT'] },
    { label: 'Students', to: '/students', icon: 'S', roles: ['SUPER_ADMIN','ADMIN','PRINCIPAL','VICE_PRINCIPAL','TEACHER','BURSAR','STUDENT','PARENT'] },
    { label: 'Enrollments', to: '/enrollments', icon: 'E', roles: ['SUPER_ADMIN','ADMIN','PRINCIPAL','VICE_PRINCIPAL'] },
    { label: 'Admissions', to: '/admissions', icon: 'AD', roles: ['SUPER_ADMIN','ADMIN','PRINCIPAL','VICE_PRINCIPAL'] },
    { label: 'Student Attendance', to: '/attendance', icon: 'SA', roles: ['SUPER_ADMIN','ADMIN','PRINCIPAL','VICE_PRINCIPAL','TEACHER'] },
    { label: 'Teacher Attendance', to: '/attendance/teachers', icon: 'TA', roles: ['SUPER_ADMIN','ADMIN','PRINCIPAL','VICE_PRINCIPAL','TEACHER'] },
  ]},
  { title: 'Examinations', items: [
    { label: 'Assessments', to: '/examinations/assessments', icon: 'AS', roles: ['SUPER_ADMIN','ADMIN','PRINCIPAL','VICE_PRINCIPAL','TEACHER'] },
    { label: 'CBT Management', to: '/examinations/cbt', icon: 'CBT', roles: ['SUPER_ADMIN','ADMIN','PRINCIPAL','VICE_PRINCIPAL','TEACHER'] },
    { label: 'Take CBT', to: '/examinations/cbt/take', icon: 'EX', roles: ['STUDENT'] },
    { label: 'Score Entry', to: '/examinations/scores', icon: 'SE', roles: ['SUPER_ADMIN','ADMIN','PRINCIPAL','VICE_PRINCIPAL','TEACHER'] },
    { label: 'Score Approval', to: '/examinations/score-approval', icon: 'AP', roles: ['SUPER_ADMIN','ADMIN','PRINCIPAL','VICE_PRINCIPAL'] },
    { label: 'Grading', to: '/examinations/grading', icon: 'GR', roles: ['SUPER_ADMIN','ADMIN','PRINCIPAL','VICE_PRINCIPAL','TEACHER'] },
    { label: 'Publication', to: '/examinations/publication', icon: 'RP', roles: ['SUPER_ADMIN','ADMIN','PRINCIPAL','VICE_PRINCIPAL'] },
    { label: 'Results', to: '/results', icon: 'RS', roles: ['STUDENT','PARENT','TEACHER','SUPER_ADMIN','ADMIN','PRINCIPAL','VICE_PRINCIPAL'] },
    { label: 'Report Cards', to: '/report-cards', icon: 'RC', roles: ['STUDENT','PARENT','TEACHER','SUPER_ADMIN','ADMIN','PRINCIPAL','VICE_PRINCIPAL'] },
  ]},
  { title: 'Portal', items: [
    { label: 'Academic Portal', to: '/portal/academic', icon: 'AP', roles: ['STUDENT','PARENT'] },
    { label: 'My Financial Account', to: '/portal/financial', icon: 'PF', roles: ['STUDENT','PARENT'] },
    { label: 'Make Payment', to: '/portal/payments', icon: '₦', roles: ['STUDENT','PARENT'] },
    { label: 'Announcements', to: '/portal/announcements', icon: 'N', roles: ['STUDENT','PARENT'] }
  ]},
  { title: 'Communication', items: [
    { label: 'Announcements', to: '/announcements', icon: 'AN', roles: ['SUPER_ADMIN','ADMIN','PRINCIPAL','VICE_PRINCIPAL','TEACHER','BURSAR'] },
    { label: 'Notification Settings', to: '/notifications/settings', icon: 'NS', roles: ['SUPER_ADMIN','ADMIN','PRINCIPAL','VICE_PRINCIPAL','TEACHER','BURSAR','STUDENT','PARENT'] },
    { label: 'Email Delivery', to: '/notifications/email-deliveries', icon: 'ED', roles: ['SUPER_ADMIN','ADMIN','PRINCIPAL'] }
  ] },
  { title: 'People', items: [{ label: 'Staff, HR & Payroll', to: '/hr', icon: 'HR', roles: ['SUPER_ADMIN','ADMIN','PRINCIPAL','VICE_PRINCIPAL'] }] },
  { title: 'Operations', items: [
    { label: 'Timetable', to: '/timetable', icon: 'TT', roles: ['STUDENT','PARENT','TEACHER','SUPER_ADMIN','ADMIN','PRINCIPAL','VICE_PRINCIPAL'] },
    { label: 'Timetable Configuration', to: '/timetable/configuration', icon: 'TC', roles: ['SUPER_ADMIN','ADMIN','PRINCIPAL','VICE_PRINCIPAL'] },
    { label: 'Build Timetable', to: '/timetable/builder', icon: 'TB', roles: ['SUPER_ADMIN','ADMIN','PRINCIPAL','VICE_PRINCIPAL'] },
    { label: 'Timetable Publication', to: '/timetable/publication', icon: 'TP', roles: ['SUPER_ADMIN','ADMIN','PRINCIPAL','VICE_PRINCIPAL'] },
    { label: 'Facilities', to: '/facilities', icon: 'F', roles: ['SUPER_ADMIN','ADMIN','PRINCIPAL','VICE_PRINCIPAL','TEACHER'] },
    { label: 'School Transport', to: '/transport', icon: 'TR', roles: ['SUPER_ADMIN','ADMIN','PRINCIPAL','VICE_PRINCIPAL'] },
    { label: 'Library', to: '/library', icon: 'LB', roles: ['STUDENT','PARENT','TEACHER','SUPER_ADMIN','ADMIN','PRINCIPAL','VICE_PRINCIPAL'] },
    { label: 'Inventory & Procurement', to: '/inventory', icon: 'IV', roles: ['SUPER_ADMIN','ADMIN','PRINCIPAL','BURSAR'] },
    { label: 'Fees', to: '/fees', icon: '$', roles: ['SUPER_ADMIN','ADMIN','PRINCIPAL','BURSAR'] },
    { label: 'Accounts', to: '/finance/accounts', icon: 'FA', roles: ['SUPER_ADMIN','ADMIN','PRINCIPAL','BURSAR'] },
    { label: 'Payment Reconciliation', to: '/finance/payment-reconciliation', icon: 'PR', roles: ['SUPER_ADMIN','ADMIN','PRINCIPAL','BURSAR'] },
    { label: 'Payment Refunds', to: '/finance/payment-refunds', icon: 'RF', roles: ['SUPER_ADMIN','ADMIN','PRINCIPAL','BURSAR'] },
    { label: 'Payment Adjustments', to: '/finance/payment-adjustments', icon: 'AD', roles: ['SUPER_ADMIN','ADMIN','PRINCIPAL','BURSAR'] },
    { label: 'Fees & Invoices', to: '/finance/fee-billing', icon: 'FI', roles: ['SUPER_ADMIN','ADMIN','PRINCIPAL','BURSAR'] },
    { label: 'Financial Reports', to: '/finance/reports', icon: 'FR', roles: ['SUPER_ADMIN','ADMIN','PRINCIPAL','BURSAR'] },
  ]},
];

export default function AppShell() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const user = useAppSelector(state => state.auth.user);
  const { data: unreadData } = useUnreadNotificationCountQuery();
  const unread = unreadData?.data?.count ?? 0;
  const signOut = () => { dispatch(logout()); navigate('/', { replace: true }); };

  return <div className="app-shell">
    <aside className="sidebar">
      <div className="brand" onClick={() => navigate('/dashboard')}><div className="brand-mark">V</div><div><strong>VAXAD</strong><span>School Platform</span></div></div>
      <nav className="side-nav">
        {groups.map(group => {
          const visible = group.items.filter(item => !item.roles || hasAnyRole(user?.roles, item.roles));
          if (!visible.length) return null;
          return <div className="nav-group" key={group.title}><div className="nav-title">{group.title}</div>{visible.map(item => <NavLink key={item.to} to={item.to} className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}><span className="nav-icon">{item.icon}</span>{item.label}</NavLink>)}</div>;
        })}
        <div className="nav-group"><div className="nav-title">Notifications</div><NavLink to="/notifications" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}><span className="nav-icon">🔔</span>Notifications{unread > 0 && <span className="nav-count">{unread > 99 ? '99+' : unread}</span>}</NavLink></div>
      </nav>
      <div className="sidebar-footer"><div className="user-mini"><div className="avatar">{(user?.firstName?.[0] ?? 'A').toUpperCase()}</div><div><strong>{user?.firstName ?? user?.username ?? 'User'}</strong><span>{user?.roles?.join(', ') ?? 'User'}</span></div></div><button className="signout" onClick={signOut}>Sign out</button></div>
    </aside>
    <main className="shell-content"><header className="topbar"><div><span className="topbar-kicker">VAXAD SCHOOL PLATFORM</span><strong>School Management</strong></div><div className="topbar-user"><button className="notification-bell" onClick={() => navigate('/notifications')} aria-label="Notifications">🔔{unread > 0 && <span>{unread > 99 ? '99+' : unread}</span>}</button>{user?.email ?? user?.username}</div></header><div className="shell-page"><Outlet /></div></main>
  </div>;
}
