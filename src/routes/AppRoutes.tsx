import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import LoginPage from '../pages/auth/LoginPage';
import { Dashboard } from '../dashboard/Dashboard';
import AcademicManagement from '../academic/AcademicManagement';
import StudentManagement from '../students/StudentManagement';
import Admissions from '../admissions/Admissions';
import AttendanceManagement from '../attendance/AttendanceManagement';
import FeesManagement from '../fees/FeesManagement';
import ProtectedRoute from '../components/ProtectedRoute';
import FinancialAccounts from '../finance/FinancialAccounts';
import PaymentReconciliation from '../finance/PaymentReconciliation';
import PaymentRefunds from '../finance/PaymentRefunds';
import PaymentAdjustments from '../finance/PaymentAdjustments';
import FeeBilling from '../finance/FeeBilling';
import FinancialReports from '../finance/FinancialReports';
import AssessmentConfiguration from '../examinations/AssessmentConfiguration';
import ScoreEntry from '../examinations/ScoreEntry';
import ScoreApproval from '../examinations/ScoreApproval';
import GradingResults from '../examinations/GradingResults';
import ResultPublication from '../examinations/ResultPublication';
import TimetableConfiguration from '../timetable/TimetableConfiguration';
import TimetableBuilder from '../timetable/TimetableBuilder';
import TimetableViews from '../timetable/TimetableViews';
import TimetablePublication from '../timetable/TimetablePublication';
import FacilitiesManagement from '../facilities/FacilitiesManagement';
import AppShell from '../components/AppShell';
import TeacherManagement from '../teachers/TeacherManagement';
import EnrollmentManagement from '../enrollments/EnrollmentManagement';
import TeacherAttendanceManagement from '../attendance/teacher/TeacherAttendanceManagement';
import CbtManagement from '../examinations/cbt/CbtManagement';
import CbtStudent from '../examinations/cbt/CbtStudent';
import StudentResults from '../examinations/StudentResults';
import ReportCards from '../examinations/ReportCards';
import ParentFinancialPortal from '../portal/ParentFinancialPortal';
import PaystackPaymentPortal from '../portal/PaystackPaymentPortal';
import StudentAcademicPortal from '../portal/StudentAcademicPortal';
import PublicAdmissionPage from '../pages/public/PublicAdmissionPage';
import PublicAdmissionCallbackPage from '../pages/public/PublicAdmissionCallbackPage';
import NotificationFeed from '../notifications/NotificationFeed';
import NotificationsCenter from '../notifications/NotificationsCenter';
import NotificationSettings from '../notifications/NotificationSettings';
import EmailDeliveryMonitor from '../notifications/EmailDeliveryMonitor';
import Announcements from '../notifications/Announcements';
import HomePage from '../pages/public/HomePage';
import TransportManagement from '../transport/TransportManagement';
import LibraryManagement from '../library/LibraryManagement';
import InventoryManagement from '../inventory/InventoryManagement';
import HrManagement from '../hr/HrManagement';
import AcademicReporting from '../academic/AcademicReporting';

const ALL = ['SUPER_ADMIN','ADMIN','PRINCIPAL','VICE_PRINCIPAL','TEACHER','BURSAR','STUDENT','PARENT'] as const;
const MANAGEMENT = ['SUPER_ADMIN','ADMIN','PRINCIPAL','VICE_PRINCIPAL'] as const;
const ACADEMIC = ['SUPER_ADMIN','ADMIN','PRINCIPAL','VICE_PRINCIPAL','TEACHER'] as const;
const FINANCE = ['SUPER_ADMIN','ADMIN','PRINCIPAL','BURSAR'] as const;
const PORTAL = ['STUDENT','PARENT'] as const;
const STUDENT = ['STUDENT'] as const;

export default function AppRoutes() {
  return <BrowserRouter><Routes>
    <Route path="/" element={<HomePage />} />
    <Route path="/login" element={<LoginPage />} />
    <Route element={<ProtectedRoute />}><Route element={<AppShell />}>
      <Route path="/dashboard" element={<Dashboard />} />

      <Route element={<ProtectedRoute allowedRoles={[...ACADEMIC]} />}>
        <Route path="/academic" element={<AcademicManagement />} />
        <Route path="/academic/reporting" element={<AcademicReporting />} />
        <Route path="/attendance" element={<AttendanceManagement />} />
        <Route path="/attendance/teachers" element={<TeacherAttendanceManagement />} />
        <Route path="/examinations/assessments" element={<AssessmentConfiguration />} />
        <Route path="/examinations/cbt" element={<CbtManagement />} />
        <Route path="/examinations/scores" element={<ScoreEntry />} />
        <Route path="/examinations/grading" element={<GradingResults />} />
      </Route>

      <Route element={<ProtectedRoute allowedRoles={[...MANAGEMENT]} />}>
        <Route path="/admissions" element={<Admissions />} />
        <Route path="/enrollments" element={<EnrollmentManagement />} />
        <Route path="/examinations/score-approval" element={<ScoreApproval />} />
        <Route path="/examinations/publication" element={<ResultPublication />} />
        <Route path="/timetable/configuration" element={<TimetableConfiguration />} />
        <Route path="/timetable/builder" element={<TimetableBuilder />} />
        <Route path="/timetable/publication" element={<TimetablePublication />} />
        <Route path="/transport" element={<TransportManagement />} />
        <Route path="/hr" element={<HrManagement />} />
      </Route>

      <Route element={<ProtectedRoute allowedRoles={[...ALL]} />}>
        <Route path="/teachers" element={<TeacherManagement />} />
        <Route path="/students" element={<StudentManagement />} />
        <Route path="/timetable" element={<TimetableViews />} />
        <Route path="/facilities" element={<FacilitiesManagement />} />
        <Route path="/library" element={<LibraryManagement />} />
        <Route path="/results" element={<StudentResults />} />
        <Route path="/report-cards" element={<ReportCards />} />
        <Route path="/notifications" element={<NotificationsCenter />} />
        <Route path="/notifications/settings" element={<NotificationSettings />} />
      </Route>

      <Route element={<ProtectedRoute allowedRoles={[...PORTAL]} />}>
        <Route path="/portal/academic" element={<StudentAcademicPortal />} />
        <Route path="/portal/financial" element={<ParentFinancialPortal />} />
        <Route path="/portal/payments" element={<PaystackPaymentPortal />} />
        <Route path="/portal/announcements" element={<NotificationFeed />} />
      </Route>

      <Route element={<ProtectedRoute allowedRoles={[...STUDENT]} />}>
        <Route path="/examinations/cbt/take" element={<CbtStudent />} />
      </Route>

      <Route element={<ProtectedRoute allowedRoles={[...FINANCE]} />}>
        <Route path="/fees" element={<FeesManagement />} />
        <Route path="/finance/accounts" element={<FinancialAccounts />} />
        <Route path="/finance/payment-reconciliation" element={<PaymentReconciliation />} />
        <Route path="/finance/payment-refunds" element={<PaymentRefunds />} />
        <Route path="/finance/payment-adjustments" element={<PaymentAdjustments />} />
        <Route path="/finance/fee-billing" element={<FeeBilling />} />
        <Route path="/finance/reports" element={<FinancialReports />} />
        <Route path="/inventory" element={<InventoryManagement />} />
        <Route path="/announcements" element={<Announcements />} />
        <Route path="/notifications/email-deliveries" element={<EmailDeliveryMonitor />} />
      </Route>
    </Route></Route>
    <Route path="/admissions/apply" element={<PublicAdmissionPage />} />
    <Route path="/admissions/payment-callback" element={<PublicAdmissionCallbackPage />} />
    <Route path="/unauthorized" element={<div className="page"><h1>403 — Unauthorized</h1><p>You do not have permission to access this area.</p></div>} />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes></BrowserRouter>;
}
