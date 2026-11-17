import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from './store';
import { env } from '../config/env';
import { logout } from '../features/auth/authSlice';
import { isTokenExpired } from '../features/auth/tokenUtils';

export type ApiResponse<T> = { success: boolean; message: string; data: T };
export type StudentAcademicSummary={studentId:string;admissionNumber:string;studentName:string;enrollmentId:string;academicSessionId:string;academicSessionName:string;termId:string;termName:string;classId:string;className:string;attendanceTotal:number;presentDays:number;absentDays:number;lateDays:number;excusedDays:number;attendanceRate:number};
export type AcademicAttendanceRecord={id:string;attendanceDate:string;status:AttendanceStatus;note?:string};
export type AcademicTimetableItem={id:string;day:string;periodSequence:number;periodName:string;startTime:string;endTime:string;subjectCode:string;subjectName:string;facilityName?:string};
export type StudentAcademicWorkspace={summary:StudentAcademicSummary;attendance:AcademicAttendanceRecord[];results:PublishedResult[];reportCards:ReportCard[];timetable:AcademicTimetableItem[];announcements:Announcement[]};
export type StudentPortalProfile={id:string;admissionNumber:string;firstName:string;lastName:string;email?:string};
export type ParentAcademicWorkspace={students:StudentPortalProfile[];selectedStudent:StudentAcademicWorkspace};


export type AcademicAttendanceSummary={total:number;present:number;absent:number;late:number;excused:number;attendanceRate:number};
export type AcademicSubjectPerformance={subjectId:string;subjectCode:string;subjectName:string;score:number;grade:string;remark:string};
export type StudentAcademicReport={studentId:string;studentName:string;admissionNumber:string;enrollmentId:string;academicSessionId:string;academicSessionName:string;termId:string;termName:string;classId:string;className:string;subjects:number;totalScore:number;averageScore:number;attendance:AcademicAttendanceSummary;subjectPerformance:AcademicSubjectPerformance[]};
export type ClassStudentPerformance={studentId:string;studentName:string;admissionNumber:string;subjects:number;totalScore:number;averageScore:number;attendanceRate:number};
export type ClassAcademicReport={academicSessionId:string;academicSessionName:string;termId:string;termName:string;classId:string;className:string;enrolledStudents:number;studentsWithPublishedResults:number;classAverageScore:number;attendanceRate:number;students:ClassStudentPerformance[]};
export type TermAcademicOverview={academicSessionId:string;academicSessionName:string;termId:string;termName:string;enrolledStudents:number;studentsWithPublishedResults:number;publishedSubjectResults:number;overallAverageScore:number;attendanceRate:number;classes:ClassAcademicReport[]};

export type DashboardSummary = { students: number; teachers: number; academicSessions: number; classes: number };
export type RoleDashboard = { role:string; name:string; email:string; unreadNotifications:number; studentId?:string; admissionNumber?:string; studentName?:string; paymentCount?:number; guardianId?:string; guardianName?:string; childrenCount?:number; children?:Array<{id:string;name:string;admissionNumber:string}>; students?:number; guardians?:number; users?:number; payments?:number };
export type Student = { id: string; admissionNumber: string; firstName: string; lastName: string; dateOfBirth?: string; gender?: string; email?: string; phone?: string; status: string };
export type Guardian = { id: string; firstName: string; lastName: string; phone: string; email?: string; address?: string; active: boolean };
export type StudentGuardian = { id: string; studentId: string; guardianId: string; firstName: string; lastName: string; phone: string; email?: string; relationship: string; primaryContact: boolean };
export type Enrollment = { id: string; studentId: string; admissionNumber: string; studentName: string; academicSessionId: string; academicSessionName: string; termId: string; termName: string; classId: string; className: string; classCode: string; status: 'ACTIVE' | 'COMPLETED' | 'WITHDRAWN' };
export type AcademicSession = { id: string; name: string; startDate?: string; endDate?: string; active: boolean };
export type Term = { id: string; academicSessionId: string; name: string; startDate?: string; endDate?: string; active: boolean };
export type Subject = { id: string; code: string; name: string; description?: string; active: boolean };
export type SchoolClass = { id: string; code: string; name: string; section?: string; active: boolean };
export type AdmissionApplication = { id:string; applicationNumber:string; firstName:string; lastName:string; dateOfBirth?:string; gender?:string; email?:string; phone?:string; guardianName:string; guardianPhone:string; guardianRelationship:string; guardianEmail:string; academicSessionId:string; termId:string; classId:string; status:'DRAFT'|'SUBMITTED'|'UNDER_REVIEW'|'ACCEPTED'|'PAYMENT_PENDING'|'ADMITTED'|'REJECTED'|'WITHDRAWN'; studentId?:string; guardianId?:string; admissionInvoiceId?:string; requiredAmount:number; amountPaid:number; balance:number; studentUsername?:string; guardianUsername?:string; paymentAccessToken:string; reviewNotes?:string; decisionReason?:string; reviewedAt?:string; reviewedBy?:string };
export type AdmissionFeeItem = {id:string;code:string;name:string;amount:number;blocking:boolean;active:boolean};
export type AdmissionInvoice = {id:string;applicationId:string;invoiceNumber:string;issueDate:string;dueDate?:string;totalAmount:number;amountPaid:number;balance:number;status:'ISSUED'|'PARTIALLY_PAID'|'PAID'|'CANCELLED';items:Array<{id:string;code:string;description:string;amount:number;blocking:boolean}>};
export type AdmissionDashboard = { totalApplications:number; draft:number; submitted:number; underReview:number; accepted:number; paymentPending:number; admitted:number; rejected:number; withdrawn:number; admissionAmountRequired:number; admissionAmountCollected:number; admissionOutstanding:number };
export type AdmissionPayment = {id:string;applicationId:string;invoiceId:string;reference:string;provider?:string;method:PaymentMethod;amount:number;status:'PENDING'|'COMPLETED'|'FAILED'|'REVERSED';authorizationUrl?:string;accessCode?:string;paymentDate:string;notes?:string};
export type CreateAdmissionFeeItemRequest={code:string;name:string;amount:number;blocking:boolean;active:boolean};
export type UpdateAdmissionStatusRequest = { status: AdmissionApplication['status']; note?: string };
export type RecordAdmissionPaymentRequest={amount:number;method:PaymentMethod;paymentDate?:string;notes?:string};
export type InitializeAdmissionPaymentRequest={paymentAccessToken:string;amount:number;email:string;callbackUrl?:string};
export type Teacher = { id: string; staffNumber: string; firstName: string; lastName: string; email?: string; phone?: string; active: boolean };
export type VehicleStatus = 'AVAILABLE'|'IN_SERVICE'|'MAINTENANCE'|'OUT_OF_SERVICE';
export type DriverStatus = 'AVAILABLE'|'ASSIGNED'|'ON_LEAVE'|'INACTIVE';
export type TransportAssignmentStatus = 'ACTIVE'|'SUSPENDED'|'ENDED';
export type TransportAttendanceStatus = 'PENDING'|'PICKED_UP'|'MISSED'|'DROPPED_OFF';
export type Vehicle = { id:string; registrationNumber:string; make:string; model?:string; capacity:number; status:VehicleStatus; active:boolean };
export type Driver = { id:string; driverNumber:string; firstName:string; lastName:string; phone:string; licenseNumber:string; status:DriverStatus; active:boolean };
export type TransportRoute = { id:string; code:string; name:string; description?:string; vehicleId?:string; driverId?:string; active:boolean };
export type RouteStop = { id:string; routeId:string; name:string; address?:string; sequenceNumber:number; pickupTime?:string; active:boolean };
export type StudentTransportAssignment = { id:string; enrollmentId:string; routeId:string; pickupStopId:string; dropoffStopId:string; status:TransportAssignmentStatus; startDate:string; endDate?:string; notes?:string };
export type TransportAttendance = { id:string; assignmentId:string; attendanceDate:string; pickupStatus:TransportAttendanceStatus; pickupTime?:string; dropoffStatus?:TransportAttendanceStatus; dropoffTime?:string; note?:string };
export type CreateVehicleRequest = { registrationNumber:string; make:string; model?:string; capacity:number; status?:VehicleStatus };
export type CreateDriverRequest = { driverNumber:string; firstName:string; lastName:string; phone:string; licenseNumber:string; status?:DriverStatus };
export type CreateTransportRouteRequest = { code:string; name:string; description?:string; vehicleId?:string; driverId?:string };
export type CreateRouteStopRequest = { name:string; address?:string; sequenceNumber:number; pickupTime?:string };
export type CreateTransportAssignmentRequest = { enrollmentId:string; routeId:string; pickupStopId:string; dropoffStopId:string; startDate:string; endDate?:string; status?:TransportAssignmentStatus; notes?:string };
export type RecordTransportAttendanceRequest = { attendanceDate:string; pickupStatus:TransportAttendanceStatus; dropoffStatus?:TransportAttendanceStatus; note?:string };
export type BookCopyStatus = 'AVAILABLE'|'BORROWED'|'RESERVED'|'LOST'|'DAMAGED';
export type LibraryMemberType = 'STUDENT'|'TEACHER'|'STAFF';
export type LoanStatus = 'BORROWED'|'RETURNED'|'OVERDUE';
export type ReservationStatus = 'ACTIVE'|'FULFILLED'|'CANCELLED';
export type FineStatus = 'UNPAID'|'PAID'|'WAIVED';
export type LibraryBook = {id:string;isbn?:string;title:string;author:string;publisher?:string;category?:string;publicationYear?:number;description?:string;active:boolean};
export type LibraryBookCopy = {id:string;bookId:string;accessionNumber:string;status:BookCopyStatus;acquiredAt?:string;shelfLocation?:string};
export type LibraryMember = {id:string;memberNumber:string;memberType:LibraryMemberType;memberRefId:string;displayName:string;active:boolean;joinedAt:string};
export type LibraryLoan = {id:string;copyId:string;memberId:string;borrowedAt:string;dueAt:string;returnedAt?:string;status:LoanStatus;renewalCount:number;notes?:string};
export type LibraryReservation = {id:string;bookId:string;memberId:string;reservedAt:string;status:ReservationStatus};
export type LibraryFine = {id:string;loanId:string;memberId:string;amount:number;reason:string;status:FineStatus;assessedAt:string;paidAt?:string};
export type CreateBookRequest = {isbn?:string;title:string;author:string;publisher?:string;category?:string;publicationYear?:number;description?:string};
export type CreateBookCopyRequest = {accessionNumber:string;acquiredAt?:string;shelfLocation?:string};
export type CreateLibraryMemberRequest = {memberNumber:string;memberType:LibraryMemberType;memberRefId:string;displayName:string};
export type BorrowBookRequest = {copyId:string;memberId:string;dueAt:string;notes?:string};
export type ReserveBookRequest = {bookId:string;memberId:string};
export type AssessLibraryFineRequest = {loanId:string;memberId:string;amount:number;reason:string};

export type InventoryCategory = { id:string; name:string; description?:string; active:boolean };
export type InventoryItem = { id:string; categoryId:string; categoryName:string; code:string; name:string; unit:string; reorderLevel:number; active:boolean };
export type InventorySupplier = { id:string; code:string; name:string; phone?:string; email?:string; address?:string; active:boolean };
export type InventoryStore = { id:string; code:string; name:string; location?:string; active:boolean };
export type StockBalance = { id:string; itemId:string; storeId:string; quantity:number };
export type StockMovement = { id:string; itemId:string; storeId:string; movementType:string; quantity:number; referenceType?:string; referenceId?:string; movementAt:string; notes?:string };
export type RequisitionStatus = 'DRAFT'|'APPROVED'|'CANCELLED';
export type PurchaseOrderStatus = 'DRAFT'|'APPROVED'|'PARTIALLY_RECEIVED'|'RECEIVED'|'CANCELLED';
export type PurchaseRequisition = { id:string; number:string; supplierId?:string; status:RequisitionStatus; requestedAt:string; notes?:string };
export type PurchaseOrder = { id:string; number:string; requisitionId?:string; supplierId:string; status:PurchaseOrderStatus; orderedAt:string; notes?:string };
export type GoodsReceipt = { id:string; number:string; purchaseOrderId:string; storeId:string; receivedAt:string; notes?:string };
export type CreateInventoryCategoryRequest = { name:string; description?:string };
export type CreateInventoryItemRequest = { categoryId:string; code:string; name:string; unit:string; reorderLevel:number };
export type CreateInventorySupplierRequest = { code:string; name:string; phone?:string; email?:string; address?:string };
export type CreateInventoryStoreRequest = { code:string; name:string; location?:string };
export type StockMovementRequest = { itemId:string; storeId:string; quantity:number; notes?:string };
export type StockTransferRequest = { itemId:string; fromStoreId:string; toStoreId:string; quantity:number; notes?:string };
export type CreatePurchaseRequisitionRequest = { supplierId?:string; items:{itemId:string;quantity:number}[]; notes?:string };
export type CreatePurchaseOrderRequest = { supplierId:string; requisitionId?:string; items:{itemId:string;quantity:number;unitPrice:number}[]; notes?:string };
export type CreateGoodsReceiptRequest = { purchaseOrderId:string; storeId:string; items:{itemId:string;quantity:number}[]; notes?:string };

export type CreateTeacherRequest = { staffNumber: string; firstName: string; lastName: string; email?: string; phone?: string };
export type TeacherAttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
export type TeacherAttendance = { id:string; teacherId:string; staffNumber:string; teacherName:string; academicSessionId:string; academicSessionName:string; termId:string; termName:string; attendanceDate:string; status:TeacherAttendanceStatus; note?:string };
export type MarkTeacherAttendanceRequest = { teacherId:string; academicSessionId:string; termId:string; attendanceDate:string; status:TeacherAttendanceStatus; note?:string };
export type TeachingAssignment = { id: string; academicSessionId: string; termId: string; classId: string; subjectId: string; teacherId: string; active: boolean };
export type OperationalDay = { day: string; label: string; sequence: number; active: boolean };
export type TimetablePeriodType = 'TEACHING' | 'BREAK' | 'ASSEMBLY' | 'LUNCH' | 'OTHER';
export type TimetablePeriod = { id: string; code: string; name: string; startTime: string; endTime: string; sequence: number; type: TimetablePeriodType; active: boolean };
export type CreateTimetablePeriodRequest = { code: string; name: string; startTime: string; endTime: string; sequence: number; type: TimetablePeriodType };
export type UpdateTimetablePeriodRequest = CreateTimetablePeriodRequest;
export type TimetableEntry = { id:string; academicSessionId:string; termId:string; classId:string; teachingAssignmentId:string; day:string; periodId:string; facilityId?:string; active:boolean };
export type FacilityType = 'CLASSROOM' | 'LABORATORY' | 'COMPUTER_LAB' | 'LIBRARY' | 'EXAMINATION_HALL' | 'ASSEMBLY_HALL' | 'SPORTS_FACILITY' | 'OFFICE' | 'OTHER';
export type Facility = { id:string; code:string; name:string; type:FacilityType; location?:string; capacity?:number; active:boolean };
export type CreateFacilityRequest = { code:string; name:string; type:FacilityType; location?:string; capacity?:number };
export type UpdateFacilityRequest = CreateFacilityRequest & { active:boolean };

export type TimetablePublicationStatus = 'PUBLISHED' | 'REOPENED';
export type TimetablePublication = { id:string; academicSessionId:string; termId:string; classId:string; status:TimetablePublicationStatus; publishedAt:string; publishedBy:string; reopenedAt?:string; reopenedBy?:string; reopeningReason?:string };
export type PublishTimetableRequest = { academicSessionId:string; termId:string; classId:string };
export type ReopenTimetableRequest = { reason:string };
export type CreateTimetableEntryRequest = { academicSessionId:string; termId:string; teachingAssignmentId:string; day:string; periodId:string; facilityId?:string };
export type UpdateTimetableEntryRequest = CreateTimetableEntryRequest;

export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
export type StudentAttendance = { id: string; enrollmentId: string; studentId: string; admissionNumber: string; studentName: string; academicSessionId: string; academicSessionName: string; termId: string; termName: string; classId: string; className: string; classCode: string; attendanceDate: string; status: AttendanceStatus; note?: string };
export type AttendanceSummary = { total: number; present: number; absent: number; late: number; excused: number; attendanceRate: number };
export type MarkAttendanceRequest = { enrollmentId: string; attendanceDate: string; status: AttendanceStatus; note?: string };
export type UpdateAttendanceRequest = { status: AttendanceStatus; note?: string };
export type FeeItemType = 'TUITION' | 'REGISTRATION' | 'EXAMINATION' | 'LIBRARY' | 'TRANSPORT' | 'BOARDING' | 'UNIFORM' | 'MEALS' | 'SPORTS' | 'OTHER';
export type FeeStructureItem = { id: string; feeStructureId: string; code: string; name: string; type: FeeItemType; amount: number; required: boolean; active: boolean };
export type FeeStructure = { id: string; academicSessionId: string; academicSessionName: string; termId: string; termName: string; classId: string; classCode: string; className: string; name: string; active: boolean; items: FeeStructureItem[]; totalAmount: number };
export type FeeItemRequest = { code: string; name: string; type: FeeItemType; amount: number; required: boolean };
export type CreateFeeStructureRequest = { academicSessionId: string; termId: string; classId: string; name: string; items: FeeItemRequest[] };
export type UpdateFeeStructureRequest = { name: string; items: FeeItemRequest[] };
export type FeeChargeStatus = 'OUTSTANDING' | 'PARTIALLY_PAID' | 'PAID' | 'WAIVED';
export type PaymentMethod = 'CASH' | 'BANK_TRANSFER' | 'POS' | 'CARD' | 'ONLINE' | 'OTHER';
export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REVERSED';
export type GatewayTransactionStatus = 'INITIALIZED'|'PENDING'|'SUCCESS'|'FAILED'|'ABANDONED'|'REVERSED';
export type GatewayPayment = { id:string; provider:'PAYSTACK'; status:GatewayTransactionStatus; reference:string; enrollmentId:string; studentId:string; feeChargeId?:string; amount:number; currency:string; authorizationUrl?:string; accessCode?:string; feePaymentId?:string; createdAt:string; updatedAt:string };
export type InitializeGatewayPaymentRequest = { enrollmentId:string; feeChargeId?:string; amount:number; email?:string; callbackUrl?:string };
export type PaymentVerification = { transactionId:string; reference:string; status:GatewayTransactionStatus; amount:number; currency:string; feePaymentId?:string };
export type FeePayment = { id:string; enrollmentId:string; studentId:string; receiptNumber:string; paymentReference:string; amount:number; allocatedAmount:number; unallocatedAmount:number; method:PaymentMethod; status:PaymentStatus; paymentDate:string; notes?:string };
export type PaymentAllocation = { id:string; paymentId:string; feeChargeId:string; feeName:string; amount:number };
export type ReceiptLine = { feeChargeId:string; feeName:string; amount:number };
export type Receipt = { paymentId:string; receiptNumber:string; paymentReference:string; studentId:string; studentName:string; admissionNumber:string; paymentDate:string; amount:number; method:PaymentMethod; allocations:ReceiptLine[]; notes?:string };
export type ReconciliationStatus = 'OPEN' | 'RECONCILED' | 'DISCREPANCY';
export type Reconciliation = { id:string; date:string; cash:number; bankTransfer:number; pos:number; card:number; online:number; other:number; totalCollected:number; actualAmount:number; difference:number; status:ReconciliationStatus; note?:string };
export type PaymentReconciliationStatus = 'OPEN'|'RECONCILED'|'DISCREPANCY';
export type PaymentReconciliationIssueType = 'GATEWAY_UNSETTLED'|'MISSING_FEE_PAYMENT'|'FEE_PAYMENT_WITHOUT_GATEWAY'|'AMOUNT_MISMATCH'|'REFERENCE_MISMATCH'|'PROVIDER_REFERENCE_MISSING'|'STATUS_MISMATCH';
export type PaymentReconciliationItem = { id:string; issueType:PaymentReconciliationIssueType; gatewayTransactionId?:string; feePaymentId?:string; gatewayReference?:string; paymentReference?:string; gatewayAmount?:number; paymentAmount?:number; message:string };
export type PaymentReconciliation = { id:string; date:string; status:PaymentReconciliationStatus; gatewayCount:number; gatewayAmount:number; vaxadCount:number; vaxadAmount:number; matchedCount:number; matchedAmount:number; discrepancyCount:number; discrepancyAmount:number; items:PaymentReconciliationItem[] };
export type ReconcileDayRequest = { date:string; actualAmount:number; note?:string };
export type PaymentRefundStatus = 'REQUESTED'|'COMPLETED'|'FAILED';
export type PaymentRefund = { id:string; paymentId:string; gatewayReference?:string; amount:number; reason:string; status:PaymentRefundStatus; requestedBy:string; approvedBy?:string; requestedAt:string; processedAt?:string; failureReason?:string };
export type CreatePaymentRefundRequest = { paymentId:string; amount:number; reason:string };
export type PaymentAdjustmentType = 'ALLOCATION_INCREASE'|'ALLOCATION_REVERSAL';
export type PaymentAdjustment = { id:string; paymentId:string; feeChargeId:string; type:PaymentAdjustmentType; amount:number; reason:string; appliedBy:string; appliedAt:string };
export type CreatePaymentAdjustmentRequest = { paymentId:string; feeChargeId:string; type:PaymentAdjustmentType; amount:number; reason:string };
export type CreatePaymentRequest = { enrollmentId:string; amount:number; method:PaymentMethod; paymentDate:string; notes?:string };
export type CreateAllocationRequest = { feeChargeId:string; amount:number };
export type FeeCharge = { id: string; enrollmentId: string; studentId: string; admissionNumber: string; studentName: string; academicSessionId: string; academicSessionName: string; termId: string; termName: string; classId: string; className: string; feeStructureId: string; feeStructureItemId: string; feeCode: string; feeName: string; originalAmount: number; discountAmount: number; waiverAmount: number; amountDue: number; amountPaid: number; balance: number; dueDate?: string; status: FeeChargeStatus };
export type GenerateChargesRequest = { enrollmentId: string; feeStructureId: string; dueDate?: string };
export type InvoiceStatus = 'DRAFT'|'ISSUED'|'PARTIALLY_PAID'|'PAID'|'OVERDUE'|'CANCELLED';
export type InvoiceItem = { id:string; feeChargeId:string; description:string; amount:number };
export type FeeInvoice = { id:string; enrollmentId:string; studentId:string; studentName:string; admissionNumber:string; feeStructureId:string; invoiceNumber:string; issueDate:string; dueDate?:string; subtotal:number; discountAmount:number; waiverAmount:number; totalAmount:number; amountPaid:number; balance:number; status:InvoiceStatus; items:InvoiceItem[] };
export type CreateInvoiceRequest = { enrollmentId:string; feeStructureId:string; issueDate?:string; dueDate?:string };
export type PaymentPlanStatus = 'ACTIVE'|'COMPLETED'|'OVERDUE'|'CANCELLED';
export type PaymentPlanInstallmentStatus = 'PENDING'|'PARTIALLY_PAID'|'PAID'|'OVERDUE'|'CANCELLED';
export type PaymentPlanInstallment = { id:string; installmentNumber:number; dueDate:string; amount:number; amountPaid:number; balance:number; status:PaymentPlanInstallmentStatus; paidAt?:string };
export type PaymentPlan = { id:string; invoiceId:string; invoiceNumber:string; name:string; totalAmount:number; installmentCount:number; startDate:string; status:PaymentPlanStatus; installments:PaymentPlanInstallment[] };
export type CreatePaymentPlanRequest = { invoiceId:string; name:string; installmentCount:number; startDate:string; intervalDays:number };
export type UpdateChargeAdjustmentRequest = { discountAmount: number; waiverAmount: number };


export type FinancialTransactionType = 'CHARGE' | 'PAYMENT' | 'REVERSAL';
export type FinancialTransaction = { id:string; date:string; type:FinancialTransactionType; reference:string; description:string; debit:number; credit:number; balance:number; status:string };
export type FinancialAccount = { studentId:string; admissionNumber:string; studentName:string; totalCharges:number; totalPaid:number; outstandingBalance:number; transactions:FinancialTransaction[] };
export type FinancialReportBreakdown = { key:string; count:number; amount:number; paid:number; outstanding:number };
export type FinancialReport = { from?:string; to?:string; summary:{chargeCount:number;totalCharges:number;totalDiscounts:number;totalWaivers:number;totalCollected:number;outstanding:number;invoiceCount:number;invoiced:number;invoiceOutstanding:number;paymentPlanCount:number;paymentPlanAmount:number;refundedOrReversed:number;unallocatedPayments:number}; byClass:FinancialReportBreakdown[]; byFee:FinancialReportBreakdown[]; byPaymentMethod:FinancialReportBreakdown[]; invoiceAmountsByStatus:Record<string,number>; paymentPlanAmountsByStatus:Record<string,number>; gatewayAmountsByStatus:Record<string,number>; reconciliation:{runs:number;reconciled:number;discrepancies:number;gatewayAmount:number;vaxadAmount:number;discrepancyAmount:number} };
export type PortalStudent = { id:string; admissionNumber:string; firstName:string; lastName:string; email?:string };
export type PortalFinancial = { studentId:string; admissionNumber:string; studentName:string; account:FinancialAccount };

export type CreateAdmissionApplicationRequest = { firstName:string; lastName:string; dateOfBirth?:string; gender?:string; email?:string; phone?:string; guardianFirstName:string; guardianLastName:string; guardianPhone:string; guardianEmail:string; guardianRelationship:string; academicSessionId:string; termId:string; classId:string };
export type AdmissionPublicOptions = { sessions:AcademicSession[]; terms:Term[]; classes:SchoolClass[] };
export type AdmissionBatchImport = { totalRows:number; importedRows:number; rejectedRows:number; errors:Array<{row:number;reason:string}> };
export type CreateStudentRequest = { admissionNumber: string; firstName: string; lastName: string; dateOfBirth?: string; gender?: string; email?: string; phone?: string };
export type CreateGuardianRequest = { firstName: string; lastName: string; phone: string; email?: string; address?: string };
export type LinkGuardianRequest = { guardianId: string; relationship: string; primaryContact: boolean };
export type CreateEnrollmentRequest = { studentId: string; academicSessionId: string; termId: string; classId: string };
export type UpdateEnrollmentRequest = { classId: string; status: Enrollment['status'] };

export type CreateAcademicSessionRequest = { name: string; startDate?: string; endDate?: string };
export type CreateTermRequest = { academicSessionId: string; name: string; startDate?: string; endDate?: string };
export type CreateSubjectRequest = { code: string; name: string; description?: string };
export type CreateSchoolClassRequest = { code: string; name: string; section?: string };
export type CreateTeachingAssignmentRequest = { academicSessionId: string; termId: string; classId: string; subjectId: string; teacherId: string };
export type AssessmentComponentType = 'CONTINUOUS_ASSESSMENT' | 'EXAMINATION' | 'PROJECT' | 'PRACTICAL' | 'OTHER';
export type AssessmentComponent = { id: string; name: string; type: AssessmentComponentType; maxScore: number; weight: number; sequence: number; active: boolean };
export type AssessmentConfiguration = { id: string; teachingAssignmentId: string; name: string; active: boolean; components: AssessmentComponent[]; totalWeight: number };
export type AssessmentComponentRequest = { name: string; type: AssessmentComponentType; maxScore: number; weight: number; sequence: number };
export type CreateAssessmentConfigurationRequest = { teachingAssignmentId: string; name: string; components: AssessmentComponentRequest[] };
export type ScoreStatus = 'DRAFT' | 'SUBMITTED' | 'RETURNED' | 'APPROVED';
export type StudentScore = { id: string; enrollmentId: string; studentId: string; admissionNumber: string; studentName: string; teachingAssignmentId: string; assessmentConfigurationId: string; assessmentComponentId: string; componentName: string; maxScore: number; score: number; status: ScoreStatus; note?: string; updatedAt: string; submittedBy?: string; submittedAt?: string; reviewedBy?: string; reviewedAt?: string; reviewComment?: string };
export type SaveScoreRequest = { enrollmentId: string; teachingAssignmentId: string; assessmentConfigurationId: string; assessmentComponentId: string; score: number; note?: string };
export type BulkScoreRequest = { scores: SaveScoreRequest[] };
export type ReviewScoresRequest = { comment: string };

export type UpdateAssessmentConfigurationRequest = { name: string; components: AssessmentComponentRequest[] };
export type ResultPublicationStatus = 'PUBLISHED' | 'REOPENED';
export type PublishedResult = { id:string; enrollmentId:string; teachingAssignmentId:string; assessmentConfigurationId:string; gradingSchemeId:string; studentId:string; admissionNumber:string; studentName:string; totalScore:number; grade:string; remark:string; status:ResultPublicationStatus; publishedAt:string; publishedBy:string; reopenedAt?:string; reopenedBy?:string; reopeningReason?:string };

export type Hostel = { id:string; code:string; name:string; gender?:string; description?:string; active:boolean };
export type HostelBlock = { id:string; hostelId:string; code:string; name:string; floorNumber?:number; active:boolean };
export type HostelRoom = { id:string; blockId:string; code:string; name:string; capacity:number; active:boolean };
export type BedStatus = 'AVAILABLE'|'OCCUPIED'|'INACTIVE';
export type HostelBed = { id:string; roomId:string; code:string; status:BedStatus; active:boolean };
export type BoardingAllocationStatus = 'ALLOCATED'|'CHECKED_IN'|'CHECKED_OUT'|'CANCELLED';
export type BoardingAllocation = { id:string; enrollmentId:string; studentId:string; academicSessionId:string; termId:string; hostelId:string; blockId:string; roomId:string; bedId:string; status:BoardingAllocationStatus; allocationDate:string; checkInDate?:string; checkOutDate?:string; notes?:string };
export type CreateHostelRequest = { code:string; name:string; gender?:string; description?:string };
export type CreateHostelBlockRequest = { code:string; name:string; floorNumber?:number };
export type CreateHostelRoomRequest = { code:string; name:string; capacity:number };
export type CreateHostelBedRequest = { code:string };
export type CreateBoardingAllocationRequest = { enrollmentId:string; bedId:string; allocationDate?:string; checkInDate?:string; notes?:string };
export type ReportCardStatus = 'GENERATED'|'PUBLISHED'|'REOPENED';
export type ReportCardItem = { id:string; teachingAssignmentId:string; assessmentConfigurationId:string; subjectId:string; subjectCode:string; subjectName:string; totalScore:number; grade:string; remark:string };
export type ReportCard = { id:string; enrollmentId:string; studentId:string; studentName:string; admissionNumber:string; academicSessionId:string; academicSessionName:string; termId:string; termName:string; classId:string; className:string; status:ReportCardStatus; totalSubjects:number; totalScore:number; averageScore:number; presentDays:number; absentDays:number; lateDays:number; excusedDays:number; teacherComment?:string; principalComment?:string; generatedAt:string; generatedBy:string; publishedAt?:string; publishedBy?:string; reopenedAt?:string; reopenedBy?:string; reopeningReason?:string; subjects:ReportCardItem[] };
export type GenerateReportCardRequest = { enrollmentId:string; teacherComment?:string; principalComment?:string };
export type ReopenReportCardRequest = { reason:string };
export type PublishResultsRequest = { teachingAssignmentId:string; assessmentConfigurationId:string };
export type ReopenResultRequest = { reason:string };
export type GradingBand = { id: string; minimum: number; maximum: number; grade: string; remark: string; sequence: number };
export type GradingScheme = { id: string; name: string; active: boolean; bands: GradingBand[] };
export type GradingBandRequest = { minimum: number; maximum: number; grade: string; remark: string; sequence: number };
export type CreateGradingSchemeRequest = { name: string; bands: GradingBandRequest[] };
export type CalculatedResult = { id: string; enrollmentId: string; teachingAssignmentId: string; assessmentConfigurationId: string; gradingSchemeId: string; studentId: string; admissionNumber: string; studentName: string; totalScore: number; grade: string; remark: string; calculatedAt: string };
export type CalculateResultsRequest = { teachingAssignmentId: string; assessmentConfigurationId: string; gradingSchemeId: string };

export type CbtQuestionType = 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'SHORT_ANSWER';
export type CbtExamStatus = 'DRAFT' | 'PUBLISHED' | 'CLOSED';
export type CbtAttemptStatus = 'IN_PROGRESS' | 'SUBMITTED';
export type CbtOption = { id:string; text:string; sequence:number };
export type CbtQuestion = { id:string; text:string; type:CbtQuestionType; marks:number; sequence:number; required:boolean; options:CbtOption[] };
export type CbtExam = { id:string; assessmentConfigurationId:string; title:string; instructions?:string; durationMinutes:number; totalMarks:number; status:CbtExamStatus; questions:CbtQuestion[] };
export type CreateCbtExamRequest = { assessmentConfigurationId:string; title:string; instructions?:string; durationMinutes:number; totalMarks:number };
export type CreateCbtQuestionRequest = { text:string; type:CbtQuestionType; marks:number; sequence:number; required:boolean; options?:string[]; correctOptionIndex?:number };
export type CbtAttempt = { id:string; examId:string; enrollmentId:string; startedAt:string; submittedAt?:string; status:CbtAttemptStatus; score:number; answers:CbtAnswer[] };
export type CbtAnswer = { id:string; questionId:string; optionId?:string; textAnswer?:string; marksAwarded:number; correct:boolean };
export type StartCbtAttemptRequest = { examId:string; enrollmentId:string };
export type SaveCbtAnswerRequest = { questionId:string; optionId?:string; textAnswer?:string };



export type AnnouncementStatus = 'DRAFT' | 'SCHEDULED' | 'PUBLISHED' | 'ARCHIVED';
export type AnnouncementAudienceType = 'SCHOOL' | 'ROLE' | 'STUDENT' | 'CLASS';
export type AnnouncementAudience = { id:string; audienceType:AnnouncementAudienceType; targetId?:string; role?:string };
export type Announcement = { id:string; title:string; content:string; status:AnnouncementStatus; publishAt?:string; publishedAt?:string; expiresAt?:string; createdBy:string; createdAt:string; updatedAt:string; audiences:AnnouncementAudience[]; read:boolean };
export type AnnouncementAudienceRequest = { audienceType:AnnouncementAudienceType; targetId?:string; role?:string };
export type CreateAnnouncementRequest = { title:string; content:string; publishAt?:string; expiresAt?:string; audiences:AnnouncementAudienceRequest[] };
export type NotificationCategory = 'ANNOUNCEMENT'|'ACADEMIC'|'ATTENDANCE'|'FEES'|'EXAMINATION'|'SYSTEM';
export type Notification = { id:string; userId:string; category:NotificationCategory; title:string; message:string; referenceType?:string; referenceId?:string; readAt?:string; createdAt:string; read:boolean };
export type NotificationPreference={emailEnabled:boolean;academicEnabled:boolean;attendanceEnabled:boolean;feesEnabled:boolean;examinationEnabled:boolean;announcementEnabled:boolean;systemEnabled:boolean};
export type UpdateNotificationPreferenceRequest=NotificationPreference;
export type NotificationEmailDelivery={id:string;notificationId:string;userId:string;recipient:string;subject:string;status:'PENDING'|'SENT'|'DELIVERED'|'FAILED'|'SKIPPED';providerMessageId?:string;attemptCount:number;errorMessage?:string;sentAt?:string;deliveredAt?:string;failedAt?:string;createdAt:string};
export type CreateNotificationRequest = { userId:string; category:NotificationCategory; title:string; message:string; referenceType?:string; referenceId?:string };

const rawBaseQuery = fetchBaseQuery({
  baseUrl: env.apiBaseUrl,
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.accessToken;
    if (token && !isTokenExpired(token)) headers.set('Authorization', `Bearer ${token}`);
    headers.set('Accept', 'application/json');
    return headers;
  },
});

const baseQuery = async (args: Parameters<typeof rawBaseQuery>[0], api: Parameters<typeof rawBaseQuery>[1], extraOptions: Parameters<typeof rawBaseQuery>[2]) => {
  const result = await rawBaseQuery(args, api, extraOptions);
  const token = (api.getState() as RootState).auth.accessToken;
  if ((result.error?.status === 401 || result.error?.status === 403) && isTokenExpired(token)) {
    api.dispatch(logout());
    if (window.location.pathname !== '/') window.location.replace('/');
  }
  return result;
};


export type HrDepartment={id:string;code:string;name:string;description?:string;active:boolean};
export type HrDesignation={id:string;code:string;name:string;description?:string;departmentId?:string;departmentName?:string;active:boolean};
export type HrEmployee={id:string;employeeNumber:string;userId?:string;firstName:string;lastName:string;otherNames?:string;email?:string;phone?:string;gender?:string;dateOfBirth?:string;address?:string;departmentId?:string;departmentName?:string;designationId?:string;designationName?:string;employmentType:string;employmentStatus:string;dateJoined:string;dateConfirmed?:string;dateExited?:string;active:boolean};
export type HrContract={id:string;employeeId:string;contractNumber:string;contractType:string;startDate:string;endDate?:string;basicSalary:number;payFrequency:string;status:string;notes?:string};
export type HrAttendance={id:string;employeeId:string;employeeName:string;attendanceDate:string;checkInTime?:string;checkOutTime?:string;status:string;note?:string};
export type HrLeaveType={id:string;code:string;name:string;defaultDays:number;paid:boolean;active:boolean;description?:string};
export type HrLeaveRequest={id:string;employeeId:string;employeeName:string;leaveTypeId:string;leaveTypeName:string;startDate:string;endDate:string;requestedDays:number;reason?:string;status:string;requestedAt:string;reviewedBy?:string;reviewedAt?:string;reviewComment?:string};
export type HrLeaveBalance={id:string;employeeId:string;leaveTypeId:string;leaveTypeName:string;leaveYear:number;entitledDays:number;usedDays:number;pendingDays:number;availableDays:number};
export type HrPayrollComponent={id:string;code:string;name:string;componentType:string;calculationType:string;defaultValue:number;taxable:boolean;pensionable:boolean;active:boolean};
export type HrPayrollPeriod={id:string;name:string;periodStart:string;periodEnd:string;status:string};
export type HrPayrollRun={id:string;payrollPeriodId:string;payrollPeriodName?:string;status:string;employeeCount:number;grossAmount:number;totalDeductions:number;netAmount:number;calculatedAt?:string;approvedAt?:string;processedAt?:string};
export type HrPayrollEntryComponent={id:string;payrollComponentId:string;componentCode:string;componentName:string;componentType:string;calculationType:string;amount:number}; export type HrPayrollEntry={id:string;payrollRunId:string;employeeId:string;employeeName:string;basicSalary:number;grossAmount:number;totalDeductions:number;netAmount:number;paymentStatus:string;paymentReference?:string;components:HrPayrollEntryComponent[]};
export type HrPayslip={id:string;payrollEntryId:string;payslipNumber:string;employeeId:string;employeeName:string;basicSalary:number;grossAmount:number;totalDeductions:number;netAmount:number;generatedAt:string;paymentStatus:string;paymentReference?:string};
export type HrDashboard={employees:number;activeEmployees:number;onLeave:number;pendingLeaveRequests:number;payrollRuns:number;payslips:number;latestNetPayroll:number};
export type HrEmployeeDocument={id:string;employeeId:string;documentType:string;documentName:string;storageKey:string;contentType?:string;fileSize?:number;issuedAt?:string;expiresAt?:string;createdAt:string};
export type HrSelfWorkspace={profile:HrEmployee;activeContract?:HrContract;documents:HrEmployeeDocument[];recentAttendance:HrAttendance[];leaveBalances:HrLeaveBalance[];leaveRequests:HrLeaveRequest[];payrollHistory:HrPayrollEntry[];payslips:HrPayslip[]};
export type HrWorkforceReport={totalEmployees:number;activeEmployees:number;inactiveEmployees:number;onLeaveEmployees:number;resignedEmployees:number;terminatedEmployees:number;retiredEmployees:number};
export type HrAttendanceReport={startDate:string;endDate:string;totalRecords:number;present:number;absent:number;late:number;halfDay:number;onLeave:number;holiday:number;remote:number};
export type HrLeaveReport={year:number;pending:number;approved:number;rejected:number;cancelled:number;requestedDays:number;approvedDays:number};
export type HrContractExpiry={contractId:string;employeeId:string;employeeName:string;contractNumber:string;endDate:string;status:string;daysUntilExpiry:number};
export type HrDocumentExpiry={documentId:string;employeeId:string;employeeName:string;documentType:string;documentName:string;expiresAt:string;daysUntilExpiry:number};
export type HrPayrollReport={payrollRunId:string;periodName:string;status:string;employeeCount:number;grossAmount:number;totalDeductions:number;netAmount:number};
export type HrEmployeeUpdateRequest={otherNames?:string;email?:string;phone?:string;gender?:string;dateOfBirth?:string;address?:string;departmentId?:string;designationId?:string;employmentType?:string;employmentStatus?:string;dateConfirmed?:string;dateExited?:string;active?:boolean};
export type HrContractUpdateRequest={contractNumber?:string;contractType?:string;startDate?:string;endDate?:string;basicSalary?:number;payFrequency?:string;status?:string;notes?:string};
export type HrContractRenewRequest={contractNumber:string;startDate:string;endDate?:string;basicSalary:number;payFrequency:string;notes?:string};
export type HrEmployeeDocumentRequest={employeeId:string;documentType:string;documentName:string;storageKey:string;contentType?:string;fileSize?:number;issuedAt?:string;expiresAt?:string};
export type HrEmployeeDocumentUpdateRequest={documentType:string;documentName:string;storageKey:string;contentType?:string;fileSize?:number;issuedAt?:string;expiresAt?:string};
export type HrSelfLeaveRequest={leaveTypeId:string;startDate:string;endDate:string;requestedDays:number;reason?:string};
export type HrDepartmentRequest={code:string;name:string;description?:string;active?:boolean}; export type HrDesignationRequest={code:string;name:string;description?:string;departmentId?:string;active?:boolean};
export type HrEmployeeRequest={employeeNumber:string;userId?:string;firstName:string;lastName:string;otherNames?:string;email?:string;phone?:string;gender?:string;dateOfBirth?:string;address?:string;departmentId?:string;designationId?:string;employmentType:string;employmentStatus:string;dateJoined:string;dateConfirmed?:string;dateExited?:string;active?:boolean};
export type HrContractRequest={employeeId:string;contractNumber:string;contractType:string;startDate:string;endDate?:string;basicSalary:number;payFrequency:string;status:string;notes?:string};
export type HrAttendanceRequest={employeeId:string;attendanceDate:string;checkInTime?:string;checkOutTime?:string;status:string;note?:string}; export type HrAttendanceCheckRequest={employeeId:string;attendanceDate:string}; export type HrAttendanceSummary={attendanceDate:string;total:number;present:number;absent:number;late:number;halfDay:number;onLeave:number;holiday:number;remote:number}; export type HrLeaveTypeRequest={code:string;name:string;defaultDays:number;paid:boolean;active?:boolean;description?:string};
export type HrLeaveRequestRequest={employeeId:string;leaveTypeId:string;startDate:string;endDate:string;requestedDays:number;reason?:string}; export type HrLeaveReview={status:'APPROVED'|'REJECTED';comment?:string;reviewerId?:string}; export type HrLeaveBalanceInitializeRequest={employeeId:string;leaveTypeId:string;leaveYear:number;entitledDays:number};
export type HrPayrollComponentRequest={code:string;name:string;componentType:string;calculationType:string;defaultValue:number;taxable:boolean;pensionable:boolean;active?:boolean}; export type HrPayrollPeriodRequest={name:string;periodStart:string;periodEnd:string};

export const api = createApi({
  reducerPath: 'api',
  baseQuery,
  tagTypes: ['AcademicPortal','Library', 'Notification','Grading','CalculatedResult','PublishedResult','Dashboard', 'Admission','AdmissionFee', 'Student', 'Guardian', 'Enrollment', 'Teacher', 'Class', 'Session', 'Term', 'Subject', 'TeachingAssignment', 'Attendance', 'AssessmentConfiguration', 'StudentScore', 'TeacherAttendance', 'FeeStructure', 'FeeCharge', 'FeePayment', 'Invoice', 'PaymentPlan', 'Receipt', 'Reconciliation', 'Timetable','Facility','CbtExam','CbtAttempt','Announcement','Transport','Inventory','HR','ReportCard','Hostel','PaymentGateway'],
  endpoints: (builder) => ({
    dashboard: builder.query<ApiResponse<DashboardSummary>, void>({ query: () => '/dashboard/summary', providesTags: ['Dashboard'] }),
    roleDashboard: builder.query<ApiResponse<RoleDashboard>, void>({ query: () => '/dashboard/me', providesTags: ['Dashboard','Notification'] }),
    announcements: builder.query<ApiResponse<Announcement[]>, void>({ query: () => '/announcements', providesTags: ['Announcement','Transport'] }),
    announcementFeed: builder.query<ApiResponse<Announcement[]>, void>({ query: () => '/announcements/feed', providesTags: ['Announcement','Transport'] }),
    notifications: builder.query<ApiResponse<Notification[]>, void>({ query: () => '/notifications', providesTags: ['Notification'] }),
    unreadNotificationCount: builder.query<ApiResponse<{count:number}>, void>({ query: () => '/notifications/unread-count', providesTags: ['Notification'] }),
    markNotificationRead: builder.mutation<ApiResponse<Notification>, string>({
      query: id => ({ url:`/notifications/${id}/read`, method:'PATCH' }),
      invalidatesTags:['Notification'],
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        const patch = dispatch(api.util.updateQueryData('notifications', undefined, draft => {
          const item = draft.data?.find(n => n.id === id);
          if (item) {
            item.readAt = item.readAt ?? new Date().toISOString();
            item.read = true;
          }
        }));
        try { await queryFulfilled; }
        catch { patch.undo(); }
      },
    }),
    markAllNotificationsRead: builder.mutation<ApiResponse<number>, void>({
      query: () => ({ url:'/notifications/read-all', method:'PATCH' }),
      invalidatesTags:['Notification'],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        const patch = dispatch(api.util.updateQueryData('notifications', undefined, draft => {
          const now = new Date().toISOString();
          draft.data?.forEach(n => {
            n.readAt = n.readAt ?? now;
            n.read = true;
          });
        }));
        try { await queryFulfilled; }
        catch { patch.undo(); }
      },
    }),
    createNotification: builder.mutation<ApiResponse<Notification>, CreateNotificationRequest>({ query: body => ({ url:'/notifications', method:'POST', body }), invalidatesTags:['Notification'] }),
    notificationPreferences: builder.query<ApiResponse<NotificationPreference>, void>({ query:()=>'/notifications/preferences', providesTags:['Notification'] }),
    updateNotificationPreferences: builder.mutation<ApiResponse<NotificationPreference>, UpdateNotificationPreferenceRequest>({ query:body=>({url:'/notifications/preferences',method:'PUT',body}), invalidatesTags:['Notification'] }),
    notificationEmailDeliveries: builder.query<ApiResponse<NotificationEmailDelivery[]>, void>({ query:()=>'/notifications/email-deliveries', providesTags:['Notification'] }),
    allNotificationEmailDeliveries: builder.query<ApiResponse<NotificationEmailDelivery[]>, void>({ query:()=>'/notifications/email-deliveries/all', providesTags:['Notification'] }),
    retryNotificationEmailDelivery: builder.mutation<ApiResponse<NotificationEmailDelivery>, string>({ query:id=>({url:`/notifications/email-deliveries/${id}/retry`,method:'POST'}), invalidatesTags:['Notification'] }),
    createAnnouncement: builder.mutation<ApiResponse<Announcement>, CreateAnnouncementRequest>({ query: body => ({ url:'/announcements', method:'POST', body }), invalidatesTags:['Announcement','Transport'] }),
    publishAnnouncement: builder.mutation<ApiResponse<Announcement>, string>({ query: id => ({ url:`/announcements/${id}/publish`, method:'PATCH' }), invalidatesTags:['Announcement','Transport'] }),
    archiveAnnouncement: builder.mutation<ApiResponse<Announcement>, string>({ query: id => ({ url:`/announcements/${id}/archive`, method:'PATCH' }), invalidatesTags:['Announcement','Transport'] }),
    markAnnouncementRead: builder.mutation<ApiResponse<Announcement>, string>({
      query: id => ({ url:`/announcements/${id}/read`, method:'PATCH' }),
      invalidatesTags:['Announcement','Transport'],
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        const patch = dispatch(api.util.updateQueryData('announcementFeed', undefined, draft => {
          const item = draft.data?.find(a => a.id === id);
          if (item) item.read = true;
        }));
        try { await queryFulfilled; }
        catch { patch.undo(); }
      },
    }),
    publicAdmissionOptions: builder.query<ApiResponse<AdmissionPublicOptions>, void>({ query:()=>'/public/admissions/options' }),
    publicSubmitAdmission: builder.mutation<ApiResponse<AdmissionApplication>, CreateAdmissionApplicationRequest>({ query:body=>({url:'/public/admissions/applications',method:'POST',body}), invalidatesTags:['Admission'] }),
    publicAdmissionApplication: builder.query<ApiResponse<AdmissionApplication>, {applicationNumber:string;token:string}>({ query:({applicationNumber,token})=>({url:`/public/admissions/applications/${encodeURIComponent(applicationNumber)}`,params:{token}}) }),
    admissions: builder.query<ApiResponse<AdmissionApplication[]>, {status?: AdmissionApplication['status']; q?: string} | void>({ query: filter => ({ url: '/admissions/applications', params: filter?.q || filter?.status ? filter : undefined }), providesTags: ['Admission'] }),
    admissionDashboard: builder.query<ApiResponse<AdmissionDashboard>, void>({ query:()=>'/admissions/applications/dashboard', providesTags:['Admission'] }),
    createAdmissionApplication: builder.mutation<ApiResponse<AdmissionApplication>, CreateAdmissionApplicationRequest>({ query: body => ({ url: '/admissions/applications', method: 'POST', body }), invalidatesTags: ['Admission'] }),
    importAdmissionBatch: builder.mutation<ApiResponse<AdmissionBatchImport>, FormData>({ query:body=>({url:'/admissions/applications/batch-import',method:'POST',body}), invalidatesTags:['Admission','Student','Guardian','Enrollment','Dashboard'] }),
    admissionBatchTemplate: builder.mutation<Blob, void>({ query:()=>({url:'/admissions/applications/batch-template',method:'GET',responseHandler:(response)=>response.blob()}) }),
    updateAdmissionStatus: builder.mutation<ApiResponse<AdmissionApplication>, { id: string; status: AdmissionApplication['status']; note?: string }>({ query: ({ id, status, note }) => ({ url: `/admissions/applications/${id}/status`, method: 'PATCH', body: { status, note } }), invalidatesTags: ['Admission','Dashboard'] }),
    grantAdmission: builder.mutation<ApiResponse<AdmissionApplication>, string>({ query:id=>({url:`/admissions/applications/${id}/grant`,method:'POST'}), invalidatesTags:['Admission','Student','Guardian','Enrollment','Dashboard'] }),
    acceptAdmission: builder.mutation<ApiResponse<AdmissionApplication>, string>({ query: id => ({ url: `/admissions/applications/${id}/accept`, method: 'POST' }), invalidatesTags: ['Admission', 'Student', 'Guardian', 'Enrollment', 'Dashboard'] }),
    admissionInvoice: builder.query<ApiResponse<AdmissionInvoice>, string>({ query:id=>`/admissions/applications/${id}/invoice`, providesTags:['Admission'] }),
    admissionPayments: builder.query<ApiResponse<AdmissionPayment[]>, string>({ query:id=>`/admissions/applications/${id}/payments`, providesTags:['Admission'] }),
    recordAdmissionPayment: builder.mutation<ApiResponse<AdmissionPayment>, {id:string;body:RecordAdmissionPaymentRequest}>({ query:({id,body})=>({url:`/admissions/applications/${id}/payments`,method:'POST',body}), invalidatesTags:['Admission','Student','Guardian','Enrollment','Dashboard','Notification'] }),
    initializeAdmissionPayment: builder.mutation<ApiResponse<AdmissionPayment>, InitializeAdmissionPaymentRequest>({ query:body=>({url:'/admissions/applications/payments/initialize',method:'POST',body}), invalidatesTags:['Admission'] }),
    verifyAdmissionPayment: builder.query<ApiResponse<{paymentId:string;reference:string;status:string;amount:number;invoiceBalance:number;admissionFinalized:boolean}>, string>({ query:reference=>`/admissions/applications/payments/verify/${encodeURIComponent(reference)}`, providesTags:['Admission'] }),
    admissionFeeItems: builder.query<ApiResponse<AdmissionFeeItem[]>, void>({query:()=>'/admissions/fee-items',providesTags:['AdmissionFee']}),
    createAdmissionFeeItem: builder.mutation<ApiResponse<AdmissionFeeItem>,CreateAdmissionFeeItemRequest>({query:body=>({url:'/admissions/fee-items',method:'POST',body}),invalidatesTags:['AdmissionFee']}),
    updateAdmissionFeeItem: builder.mutation<ApiResponse<AdmissionFeeItem>,{id:string;body:CreateAdmissionFeeItemRequest}>({query:({id,body})=>({url:`/admissions/fee-items/${id}`,method:'PUT',body}),invalidatesTags:['AdmissionFee'] }),
    students: builder.query<ApiResponse<Student[]>, void>({ query: () => '/students', providesTags: ['Student'] }),
    createStudent: builder.mutation<ApiResponse<Student>, CreateStudentRequest>({ query: body => ({ url: '/students', method: 'POST', body }), invalidatesTags: ['Student', 'Dashboard'] }),
    updateStudent: builder.mutation<ApiResponse<Student>, { id: string; body: CreateStudentRequest }>({ query: ({ id, body }) => ({ url: `/students/${id}`, method: 'PUT', body }), invalidatesTags: ['Student'] }),
    updateStudentStatus: builder.mutation<ApiResponse<Student>, { id: string; status: string }>({ query: ({ id, status }) => ({ url: `/students/${id}/status`, method: 'PATCH', body: { status } }), invalidatesTags: ['Student'] }),

    guardians: builder.query<ApiResponse<Guardian[]>, void>({ query: () => '/guardians', providesTags: ['Guardian'] }),
    createGuardian: builder.mutation<ApiResponse<Guardian>, CreateGuardianRequest>({ query: body => ({ url: '/guardians', method: 'POST', body }), invalidatesTags: ['Guardian'] }),
    updateGuardian: builder.mutation<ApiResponse<Guardian>, { id: string; body: CreateGuardianRequest }>({ query: ({ id, body }) => ({ url: `/guardians/${id}`, method: 'PUT', body }), invalidatesTags: ['Guardian'] }),
    studentGuardians: builder.query<ApiResponse<StudentGuardian[]>, string>({ query: studentId => `/students/${studentId}/guardians`, providesTags: ['Guardian'] }),
    linkGuardian: builder.mutation<ApiResponse<StudentGuardian>, { studentId: string; body: LinkGuardianRequest }>({ query: ({ studentId, body }) => ({ url: `/students/${studentId}/guardians`, method: 'POST', body }), invalidatesTags: ['Guardian'] }),
    unlinkGuardian: builder.mutation<ApiResponse<null>, { studentId: string; guardianId: string }>({ query: ({ studentId, guardianId }) => ({ url: `/students/${studentId}/guardians/${guardianId}`, method: 'DELETE' }), invalidatesTags: ['Guardian'] }),

    enrollments: builder.query<ApiResponse<Enrollment[]>, { sessionId?: string; termId?: string; classId?: string; studentId?: string } | void>({ query: params => ({ url: '/enrollments', params: params ?? undefined }), providesTags: ['Enrollment'] }),
    createEnrollment: builder.mutation<ApiResponse<Enrollment>, CreateEnrollmentRequest>({ query: body => ({ url: '/enrollments', method: 'POST', body }), invalidatesTags: ['Enrollment'] }),
    updateEnrollment: builder.mutation<ApiResponse<Enrollment>, { id: string; body: UpdateEnrollmentRequest }>({ query: ({ id, body }) => ({ url: `/enrollments/${id}`, method: 'PUT', body }), invalidatesTags: ['Enrollment'] }),
    deleteEnrollment: builder.mutation<ApiResponse<null>, string>({ query: id => ({ url: `/enrollments/${id}`, method: 'DELETE' }), invalidatesTags: ['Enrollment'] }),

    academicSessions: builder.query<ApiResponse<AcademicSession[]>, void>({ query: () => '/academic-sessions', providesTags: ['Session'] }),
    createAcademicSession: builder.mutation<ApiResponse<AcademicSession>, CreateAcademicSessionRequest>({ query: body => ({ url: '/academic-sessions', method: 'POST', body }), invalidatesTags: ['Session', 'Dashboard'] }),
    activateAcademicSession: builder.mutation<ApiResponse<AcademicSession>, string>({ query: id => ({ url: `/academic-sessions/${id}/activate`, method: 'PATCH' }), invalidatesTags: ['Session'] }),

    terms: builder.query<ApiResponse<Term[]>, string | void>({ query: sessionId => sessionId ? `/terms?sessionId=${sessionId}` : '/terms', providesTags: ['Term'] }),
    createTerm: builder.mutation<ApiResponse<Term>, CreateTermRequest>({ query: body => ({ url: '/terms', method: 'POST', body }), invalidatesTags: ['Term'] }),
    activateTerm: builder.mutation<ApiResponse<Term>, string>({ query: id => ({ url: `/terms/${id}/activate`, method: 'PATCH' }), invalidatesTags: ['Term'] }),

    subjects: builder.query<ApiResponse<Subject[]>, void>({ query: () => '/subjects', providesTags: ['Subject'] }),
    createSubject: builder.mutation<ApiResponse<Subject>, CreateSubjectRequest>({ query: body => ({ url: '/subjects', method: 'POST', body }), invalidatesTags: ['Subject'] }),

    classes: builder.query<ApiResponse<SchoolClass[]>, void>({ query: () => '/classes', providesTags: ['Class'] }),
    createClass: builder.mutation<ApiResponse<SchoolClass>, CreateSchoolClassRequest>({ query: body => ({ url: '/classes', method: 'POST', body }), invalidatesTags: ['Class', 'Dashboard'] }),

    teachers: builder.query<ApiResponse<Teacher[]>, void>({ query: () => '/teachers', providesTags: ['Teacher'] }),
    createTeacher: builder.mutation<ApiResponse<Teacher>, CreateTeacherRequest>({ query: body => ({ url: '/teachers', method: 'POST', body }), invalidatesTags: ['Teacher', 'Dashboard'] }),
    teacherAttendance: builder.query<ApiResponse<TeacherAttendance[]>, {teacherId?:string; sessionId?:string; termId?:string; date?:string}|void>({ query: params => ({ url:'/attendance/teachers', params: params ?? undefined }), providesTags:['TeacherAttendance'] }),
    markTeacherAttendance: builder.mutation<ApiResponse<TeacherAttendance>, MarkTeacherAttendanceRequest>({ query: body => ({url:'/attendance/teachers',method:'POST',body}), invalidatesTags:['TeacherAttendance'] }),
    updateTeacherAttendance: builder.mutation<ApiResponse<TeacherAttendance>, {id:string;body:{status:TeacherAttendanceStatus;note?:string}}>({ query: ({id,body}) => ({url:`/attendance/teachers/${id}`,method:'PUT',body}), invalidatesTags:['TeacherAttendance'] }),
    deleteTeacherAttendance: builder.mutation<ApiResponse<null>, string>({ query:id=>({url:`/attendance/teachers/${id}`,method:'DELETE'}), invalidatesTags:['TeacherAttendance'] }),
    teacherAttendanceSummary: builder.query<ApiResponse<unknown>, {teacherId?:string;sessionId?:string;termId?:string}|void>({query:params=>({url:'/attendance/teachers/summary',params: params ?? undefined}),providesTags:['TeacherAttendance']}),
    assessmentConfigurations: builder.query<ApiResponse<AssessmentConfiguration[]>, string | void>({ query: teachingAssignmentId => teachingAssignmentId ? `/examinations/assessment-configurations?teachingAssignmentId=${teachingAssignmentId}` : '/examinations/assessment-configurations', providesTags: ['AssessmentConfiguration'] }),
    createAssessmentConfiguration: builder.mutation<ApiResponse<AssessmentConfiguration>, CreateAssessmentConfigurationRequest>({ query: body => ({ url: '/examinations/assessment-configurations', method: 'POST', body }), invalidatesTags: ['AssessmentConfiguration'] }),
    updateAssessmentConfiguration: builder.mutation<ApiResponse<AssessmentConfiguration>, { id: string; body: UpdateAssessmentConfigurationRequest }>({ query: ({ id, body }) => ({ url: `/examinations/assessment-configurations/${id}`, method: 'PUT', body }), invalidatesTags: ['AssessmentConfiguration'] }),
    activateAssessmentConfiguration: builder.mutation<ApiResponse<AssessmentConfiguration>, string>({ query: id => ({ url: `/examinations/assessment-configurations/${id}/activate`, method: 'PATCH' }), invalidatesTags: ['AssessmentConfiguration'] }),
    deleteAssessmentConfiguration: builder.mutation<ApiResponse<null>, string>({ query: id => ({ url: `/examinations/assessment-configurations/${id}`, method: 'DELETE' }), invalidatesTags: ['AssessmentConfiguration'] }),
    studentScores: builder.query<ApiResponse<StudentScore[]>, { teachingAssignmentId?: string; assessmentConfigurationId?: string; assessmentComponentId?: string; enrollmentId?: string; status?: ScoreStatus } | void>({ query: params => ({ url: '/examinations/scores', params: params ?? undefined }), providesTags: ['StudentScore'] }),
    saveStudentScore: builder.mutation<ApiResponse<StudentScore>, SaveScoreRequest>({ query: body => ({ url: '/examinations/scores', method: 'POST', body }), invalidatesTags: ['StudentScore'] }),
    saveStudentScoresBulk: builder.mutation<ApiResponse<StudentScore[]>, BulkScoreRequest>({ query: body => ({ url: '/examinations/scores/bulk', method: 'POST', body }), invalidatesTags: ['StudentScore'] }),
    updateStudentScore: builder.mutation<ApiResponse<StudentScore>, { id: string; body: SaveScoreRequest }>({ query: ({ id, body }) => ({ url: `/examinations/scores/${id}`, method: 'PUT', body }), invalidatesTags: ['StudentScore'] }),
    submitStudentScores: builder.mutation<ApiResponse<StudentScore[]>, { teachingAssignmentId: string; assessmentConfigurationId: string }>({ query: params => ({ url: '/examinations/scores/submit', method: 'POST', params: params ?? undefined }), invalidatesTags: ['StudentScore'] }),
    approveStudentScores: builder.mutation<ApiResponse<StudentScore[]>, { teachingAssignmentId: string; assessmentConfigurationId: string; body: ReviewScoresRequest }>({ query: ({ teachingAssignmentId, assessmentConfigurationId, body }) => ({ url: '/examinations/scores/approve', method: 'POST', params: { teachingAssignmentId, assessmentConfigurationId }, body }), invalidatesTags: ['StudentScore'] }),
    returnStudentScores: builder.mutation<ApiResponse<StudentScore[]>, { teachingAssignmentId: string; assessmentConfigurationId: string; body: ReviewScoresRequest }>({ query: ({ teachingAssignmentId, assessmentConfigurationId, body }) => ({ url: '/examinations/scores/return', method: 'POST', params: { teachingAssignmentId, assessmentConfigurationId }, body }), invalidatesTags: ['StudentScore'] }),

    teachingAssignments: builder.query<ApiResponse<TeachingAssignment[]>, string | void>({ query: termId => termId ? `/teaching-assignments?termId=${termId}` : '/teaching-assignments', providesTags: ['TeachingAssignment'] }),
    operationalDays: builder.query<ApiResponse<OperationalDay[]>, void>({ query: () => '/timetable/days', providesTags: ['Timetable'] }),
    updateOperationalDay: builder.mutation<ApiResponse<OperationalDay>, { day: string; active: boolean }>({ query: ({ day, active }) => ({ url: `/timetable/days/${day}`, method: 'PATCH', body: { active } }), invalidatesTags: ['Timetable'] }),
    timetablePeriods: builder.query<ApiResponse<TimetablePeriod[]>, void>({ query: () => '/timetable/periods', providesTags: ['Timetable'] }),
    timetableEntries: builder.query<ApiResponse<TimetableEntry[]>, { termId?:string; classId?:string; teacherId?:string; facilityId?:string; day?:string } | void>({ query: params => ({ url:'/timetable/entries', params: params ?? undefined }), providesTags:['Timetable'] }),
    timetableClassWeekly: builder.query<ApiResponse<TimetableEntry[]>, { classId:string; termId:string }>({ query: ({classId,termId}) => ({ url:`/timetable/entries/classes/${classId}/weekly`, params:{termId} }), providesTags:['Timetable'] }),
    timetableFacilityWeekly: builder.query<ApiResponse<TimetableEntry[]>, { facilityId:string; termId:string }>({ query: ({facilityId,termId}) => ({ url:`/timetable/entries/facilities/${facilityId}/weekly`, params:{termId} }), providesTags:['Timetable'] }),
    timetableTeacherWeekly: builder.query<ApiResponse<TimetableEntry[]>, { teacherId:string; termId:string }>({ query: ({teacherId,termId}) => ({ url:`/timetable/entries/teachers/${teacherId}/weekly`, params:{termId} }), providesTags:['Timetable'] }),
    createTimetableEntry: builder.mutation<ApiResponse<TimetableEntry>, CreateTimetableEntryRequest>({ query: body => ({url:'/timetable/entries',method:'POST',body}), invalidatesTags:['Timetable'] }),
    updateTimetableEntry: builder.mutation<ApiResponse<TimetableEntry>, {id:string;body:UpdateTimetableEntryRequest}>({ query: ({id,body}) => ({url:`/timetable/entries/${id}`,method:'PUT',body}), invalidatesTags:['Timetable'] }),
    deleteTimetableEntry: builder.mutation<ApiResponse<null>, string>({ query: id => ({url:`/timetable/entries/${id}`,method:'DELETE'}), invalidatesTags:['Timetable'] }),
    timetablePublications: builder.query<ApiResponse<TimetablePublication[]>, {termId?:string; classId?:string}|void>({ query: params => ({url:'/timetable/publications', params: params ?? undefined}), providesTags:['Timetable'] }),
    publishTimetable: builder.mutation<ApiResponse<TimetablePublication>, PublishTimetableRequest>({ query: body => ({url:'/timetable/publications', method:'POST', body}), invalidatesTags:['Timetable'] }),
    reopenTimetable: builder.mutation<ApiResponse<TimetablePublication>, {id:string; body:ReopenTimetableRequest}>({ query: ({id,body}) => ({url:`/timetable/publications/${id}/reopen`, method:'POST', body}), invalidatesTags:['Timetable'] }),
    createTimetablePeriod: builder.mutation<ApiResponse<TimetablePeriod>, CreateTimetablePeriodRequest>({ query: body => ({ url: '/timetable/periods', method: 'POST', body }), invalidatesTags: ['Timetable'] }),
    updateTimetablePeriod: builder.mutation<ApiResponse<TimetablePeriod>, { id: string; body: UpdateTimetablePeriodRequest }>({ query: ({ id, body }) => ({ url: `/timetable/periods/${id}`, method: 'PUT', body }), invalidatesTags: ['Timetable'] }),
    activateTimetablePeriod: builder.mutation<ApiResponse<TimetablePeriod>, string>({ query: id => ({ url: `/timetable/periods/${id}/activate`, method: 'PATCH' }), invalidatesTags: ['Timetable'] }),
    deactivateTimetablePeriod: builder.mutation<ApiResponse<TimetablePeriod>, string>({ query: id => ({ url: `/timetable/periods/${id}/deactivate`, method: 'PATCH' }), invalidatesTags: ['Timetable'] }),
    deleteTimetablePeriod: builder.mutation<ApiResponse<null>, string>({ query: id => ({ url: `/timetable/periods/${id}`, method: 'DELETE' }), invalidatesTags: ['Timetable'] }),
    hostels: builder.query<ApiResponse<Hostel[]>, void>({ query:()=>'/hostels', providesTags:['Hostel'] }),
    createHostel: builder.mutation<ApiResponse<Hostel>, CreateHostelRequest>({ query:body=>({url:'/hostels',method:'POST',body}), invalidatesTags:['Hostel'] }),
    activateHostel: builder.mutation<ApiResponse<Hostel>, string>({ query:id=>({url:`/hostels/${id}/activate`,method:'PATCH'}), invalidatesTags:['Hostel'] }),
    deactivateHostel: builder.mutation<ApiResponse<Hostel>, string>({ query:id=>({url:`/hostels/${id}/deactivate`,method:'PATCH'}), invalidatesTags:['Hostel'] }),
    hostelBlocks: builder.query<ApiResponse<HostelBlock[]>, string>({ query:id=>`/hostels/${id}/blocks`, providesTags:['Hostel'] }),
    createHostelBlock: builder.mutation<ApiResponse<HostelBlock>, {hostelId:string;body:CreateHostelBlockRequest}>({ query:({hostelId,body})=>({url:`/hostels/${hostelId}/blocks`,method:'POST',body}), invalidatesTags:['Hostel'] }),
    hostelRooms: builder.query<ApiResponse<HostelRoom[]>, string>({ query:id=>`/hostels/blocks/${id}/rooms`, providesTags:['Hostel'] }),
    createHostelRoom: builder.mutation<ApiResponse<HostelRoom>, {blockId:string;body:CreateHostelRoomRequest}>({ query:({blockId,body})=>({url:`/hostels/blocks/${blockId}/rooms`,method:'POST',body}), invalidatesTags:['Hostel'] }),
    hostelBeds: builder.query<ApiResponse<HostelBed[]>, string>({ query:id=>`/hostels/rooms/${id}/beds`, providesTags:['Hostel'] }),
    createHostelBed: builder.mutation<ApiResponse<HostelBed>, {roomId:string;body:CreateHostelBedRequest}>({ query:({roomId,body})=>({url:`/hostels/rooms/${roomId}/beds`,method:'POST',body}), invalidatesTags:['Hostel'] }),
    availableHostelBeds: builder.query<ApiResponse<HostelBed[]>, void>({ query:()=>'/hostels/beds/available', providesTags:['Hostel'] }),
    boardingAllocationsByTerm: builder.query<ApiResponse<BoardingAllocation[]>, string>({ query:termId=>`/hostels/allocations/term/${termId}`, providesTags:['Hostel'] }),
    boardingAllocationsByStudent: builder.query<ApiResponse<BoardingAllocation[]>, string>({ query:studentId=>`/hostels/allocations/student/${studentId}`, providesTags:['Hostel'] }),
    createBoardingAllocation: builder.mutation<ApiResponse<BoardingAllocation>, CreateBoardingAllocationRequest>({ query:body=>({url:'/hostels/allocations',method:'POST',body}), invalidatesTags:['Hostel','Student','Enrollment'] }),
    checkInBoarding: builder.mutation<ApiResponse<BoardingAllocation>, {id:string;body?:{checkInDate?:string}}>({ query:({id,body})=>({url:`/hostels/allocations/${id}/check-in`,method:'POST',body}), invalidatesTags:['Hostel'] }),
    checkOutBoarding: builder.mutation<ApiResponse<BoardingAllocation>, {id:string;body?:{checkOutDate?:string;notes?:string}}>({ query:({id,body})=>({url:`/hostels/allocations/${id}/check-out`,method:'POST',body}), invalidatesTags:['Hostel'] }),
    facilities: builder.query<ApiResponse<Facility[]>, {type?:FacilityType; active?:boolean; search?:string}|void>({ query: params => ({url:'/facilities', params: params ?? undefined}), providesTags:['Facility','CbtExam','CbtAttempt'] }),
    activeFacilities: builder.query<ApiResponse<Facility[]>, void>({ query: () => '/facilities/active', providesTags:['Facility','CbtExam','CbtAttempt'] }),
    createFacility: builder.mutation<ApiResponse<Facility>, CreateFacilityRequest>({ query: body => ({url:'/facilities', method:'POST', body}), invalidatesTags:['Facility','CbtExam','CbtAttempt'] }),
    updateFacility: builder.mutation<ApiResponse<Facility>, {id:string; body:UpdateFacilityRequest}>({ query: ({id,body}) => ({url:`/facilities/${id}`, method:'PUT', body}), invalidatesTags:['Facility','CbtExam','CbtAttempt'] }),
    activateFacility: builder.mutation<ApiResponse<Facility>, string>({ query: id => ({url:`/facilities/${id}/activate`, method:'PATCH'}), invalidatesTags:['Facility','CbtExam','CbtAttempt'] }),
    deactivateFacility: builder.mutation<ApiResponse<Facility>, string>({ query: id => ({url:`/facilities/${id}/deactivate`, method:'PATCH'}), invalidatesTags:['Facility','CbtExam','CbtAttempt'] }),
    deleteFacility: builder.mutation<ApiResponse<null>, string>({ query: id => ({url:`/facilities/${id}`, method:'DELETE'}), invalidatesTags:['Facility','CbtExam','CbtAttempt'] }),
    createTeachingAssignment: builder.mutation<ApiResponse<TeachingAssignment>, CreateTeachingAssignmentRequest>({ query: body => ({ url: '/teaching-assignments', method: 'POST', body }), invalidatesTags: ['TeachingAssignment'] }),
    deleteTeachingAssignment: builder.mutation<ApiResponse<null>, string>({ query: id => ({ url: `/teaching-assignments/${id}`, method: 'DELETE' }), invalidatesTags: ['TeachingAssignment'] }),
    studentAttendance: builder.query<ApiResponse<StudentAttendance[]>, { sessionId?: string; termId?: string; classId?: string; studentId?: string; date?: string } | void>({ query: params => ({ url: '/attendance/students', params: params ?? undefined }), providesTags: ['Attendance'] }),
    attendanceSummary: builder.query<ApiResponse<AttendanceSummary>, { sessionId?: string; termId?: string; classId?: string; studentId?: string } | void>({ query: params => ({ url: '/attendance/students/summary', params: params ?? undefined }), providesTags: ['Attendance'] }),
    markAttendance: builder.mutation<ApiResponse<StudentAttendance>, MarkAttendanceRequest>({ query: body => ({ url: '/attendance/students', method: 'POST', body }), invalidatesTags: ['Attendance'] }),
    updateAttendance: builder.mutation<ApiResponse<StudentAttendance>, { id: string; body: UpdateAttendanceRequest }>({ query: ({ id, body }) => ({ url: `/attendance/students/${id}`, method: 'PUT', body }), invalidatesTags: ['Attendance'] }),
    deleteAttendance: builder.mutation<ApiResponse<null>, string>({ query: id => ({ url: `/attendance/students/${id}`, method: 'DELETE' }), invalidatesTags: ['Attendance'] }),
    feeStructures: builder.query<ApiResponse<FeeStructure[]>, { sessionId?: string; termId?: string; classId?: string } | void>({ query: params => ({ url: '/fees/structures', params: params ?? undefined }), providesTags: ['FeeStructure'] }),
    createFeeStructure: builder.mutation<ApiResponse<FeeStructure>, CreateFeeStructureRequest>({ query: body => ({ url: '/fees/structures', method: 'POST', body }), invalidatesTags: ['FeeStructure'] }),
    updateFeeStructure: builder.mutation<ApiResponse<FeeStructure>, { id: string; body: UpdateFeeStructureRequest }>({ query: ({ id, body }) => ({ url: `/fees/structures/${id}`, method: 'PUT', body }), invalidatesTags: ['FeeStructure'] }),
    activateFeeStructure: builder.mutation<ApiResponse<FeeStructure>, string>({ query: id => ({ url: `/fees/structures/${id}/activate`, method: 'PATCH' }), invalidatesTags: ['FeeStructure'] }),
    deleteFeeStructure: builder.mutation<ApiResponse<null>, string>({ query: id => ({ url: `/fees/structures/${id}`, method: 'DELETE' }), invalidatesTags: ['FeeStructure'] }),
    feeCharges: builder.query<ApiResponse<FeeCharge[]>, { sessionId?: string; termId?: string; classId?: string; studentId?: string; enrollmentId?: string; status?: FeeChargeStatus } | void>({ query: params => ({ url: '/fees/charges', params: params ?? undefined }), providesTags: ['FeeCharge'] }),
    generateFeeCharges: builder.mutation<ApiResponse<FeeCharge[]>, GenerateChargesRequest>({ query: body => ({ url: '/fees/charges/generate', method: 'POST', body }), invalidatesTags: ['FeeCharge'] }),
    updateFeeChargeAdjustment: builder.mutation<ApiResponse<FeeCharge>, { id: string; body: UpdateChargeAdjustmentRequest }>({ query: ({ id, body }) => ({ url: `/fees/charges/${id}/adjustment`, method: 'PATCH', body }), invalidatesTags: ['FeeCharge','Invoice','PaymentPlan'] }),
    invoices: builder.query<ApiResponse<FeeInvoice[]>, { enrollmentId?: string } | void>({ query: params => ({ url:'/fees/invoices', params: params ?? undefined }), providesTags:['Invoice'] }),
    invoiceById: builder.query<ApiResponse<FeeInvoice>, string>({ query:id=>`/fees/invoices/${id}`, providesTags:['Invoice'] }),
    createInvoice: builder.mutation<ApiResponse<FeeInvoice>, CreateInvoiceRequest>({ query:body=>({url:'/fees/invoices',method:'POST',body}), invalidatesTags:['Invoice','FeeCharge'] }),
    refreshInvoice: builder.mutation<ApiResponse<FeeInvoice>, string>({ query:id=>({url:`/fees/invoices/${id}/refresh`,method:'POST'}), invalidatesTags:['Invoice','FeeCharge','FeePayment','PaymentPlan'] }),
    cancelInvoice: builder.mutation<ApiResponse<FeeInvoice>, string>({ query:id=>({url:`/fees/invoices/${id}/cancel`,method:'POST'}), invalidatesTags:['Invoice'] }),
    paymentPlans: builder.query<ApiResponse<PaymentPlan[]>, void>({ query:()=>'/fees/payment-plans', providesTags:['PaymentPlan','Invoice'] }),
    paymentPlanById: builder.query<ApiResponse<PaymentPlan>, string>({ query:id=>`/fees/payment-plans/${id}`, providesTags:['PaymentPlan','Invoice'] }),
    createPaymentPlan: builder.mutation<ApiResponse<PaymentPlan>, CreatePaymentPlanRequest>({ query:body=>({url:'/fees/payment-plans',method:'POST',body}), invalidatesTags:['PaymentPlan','Invoice'] }),
    refreshPaymentPlan: builder.mutation<ApiResponse<PaymentPlan>, string>({ query:id=>({url:`/fees/payment-plans/${id}/refresh`,method:'POST'}), invalidatesTags:['PaymentPlan','Invoice','FeePayment','FeeCharge'] }),
    payments: builder.query<ApiResponse<FeePayment[]>, { studentId?: string; enrollmentId?: string; dateFrom?: string; dateTo?: string } | void>({ query: params => ({ url: '/fees/payments', params: params ?? undefined }), providesTags: ['FeePayment'] }),
    createPayment: builder.mutation<ApiResponse<FeePayment>, CreatePaymentRequest>({ query: body => ({ url: '/fees/payments', method: 'POST', body }), invalidatesTags: ['FeePayment'] }),
    allocatePayment: builder.mutation<ApiResponse<PaymentAllocation>, { id:string; body:CreateAllocationRequest }>({ query: ({id,body}) => ({ url: `/fees/payments/${id}/allocate`, method:'POST', body }), invalidatesTags:['FeePayment','FeeCharge'] }),
    paymentAllocations: builder.query<ApiResponse<PaymentAllocation[]>, string>({ query:id=>`/fees/payments/${id}/allocations`, providesTags:['FeePayment'] }),
    reversePayment: builder.mutation<ApiResponse<FeePayment>, string>({ query:id=>({url:`/fees/payments/${id}/reverse`,method:'POST'}), invalidatesTags:['FeePayment','FeeCharge'] }),
    paymentRefunds: builder.query<ApiResponse<PaymentRefund[]>, string>({ query:id=>`/fees/refunds/payment/${id}`, providesTags:['FeePayment'] }),
    requestPaymentRefund: builder.mutation<ApiResponse<PaymentRefund>, CreatePaymentRefundRequest>({ query:body=>({url:'/fees/refunds',method:'POST',body}), invalidatesTags:['FeePayment','FeeCharge'] }),
    approvePaymentRefund: builder.mutation<ApiResponse<PaymentRefund>, string>({ query:id=>({url:`/fees/refunds/${id}/approve`,method:'POST'}), invalidatesTags:['FeePayment','FeeCharge'] }),
    paymentAdjustments: builder.query<ApiResponse<PaymentAdjustment[]>, string>({ query:id=>`/fees/payment-adjustments/payment/${id}`, providesTags:['FeePayment','FeeCharge'] }),
    applyPaymentAdjustment: builder.mutation<ApiResponse<PaymentAdjustment>, CreatePaymentAdjustmentRequest>({ query:body=>({url:'/fees/payment-adjustments',method:'POST',body}), invalidatesTags:['FeePayment','FeeCharge'] }),

    initializeGatewayPayment: builder.mutation<ApiResponse<GatewayPayment>, InitializeGatewayPaymentRequest>({ query:body=>({url:'/payments/paystack/initialize',method:'POST',body}), invalidatesTags:['PaymentGateway','FeeCharge','FeePayment'] }),
    verifyGatewayPayment: builder.query<ApiResponse<PaymentVerification>, string>({ query:reference=>`/payments/paystack/verify/${encodeURIComponent(reference)}`, providesTags:['PaymentGateway','FeePayment','FeeCharge'] }),
    reverseGatewayPayment: builder.mutation<ApiResponse<PaymentVerification>, string>({ query:reference=>({url:`/payments/paystack/reverse/${encodeURIComponent(reference)}`,method:'POST'}), invalidatesTags:['PaymentGateway','FeePayment','FeeCharge'] }),
    paymentReconciliation: builder.query<ApiResponse<PaymentReconciliation>, string>({ query:date=>({url:'/payments/reconciliation',params:{date}}), providesTags:['PaymentGateway'] }),
    paymentReconciliationHistory: builder.query<ApiResponse<PaymentReconciliation[]>, {from?:string;to?:string}|void>({ query:params=>({url:'/payments/reconciliation/history',params:params??undefined}), providesTags:['PaymentGateway'] }),
    runPaymentReconciliation: builder.mutation<ApiResponse<PaymentReconciliation>, string>({ query:date=>({url:'/payments/reconciliation/run',method:'POST',params:{date}}), invalidatesTags:['PaymentGateway'] }),
    receipts: builder.query<ApiResponse<Receipt[]>, void>({ query:()=>'/fees/receipts', providesTags:['Receipt','FeePayment'] }),
    receiptByPayment: builder.query<ApiResponse<Receipt>, string>({ query:id=>`/fees/receipts/${id}`, providesTags:['Receipt'] }),
    financialAccount: builder.query<ApiResponse<FinancialAccount>, {studentId:string; sessionId?:string; termId?:string; from?:string; to?:string}>({ query: ({studentId, ...params}) => ({url:`/fees/accounts/${studentId}`, params: params ?? undefined}), providesTags:['FeeCharge','FeePayment'] }),
    financialStatement: builder.query<ApiResponse<FinancialAccount>, {studentId:string; sessionId?:string; termId?:string; from?:string; to?:string}>({ query: ({studentId, ...params}) => ({url:`/fees/accounts/${studentId}/statement`, params: params ?? undefined}), providesTags:['FeeCharge','FeePayment'] }),
    financialReport: builder.query<ApiResponse<FinancialReport>, {sessionId?:string; termId?:string; classId?:string; from?:string; to?:string}|void>({ query: params => ({url:'/fees/reports/financial', params: params ?? undefined}), providesTags:['FeeCharge','FeePayment','Invoice','PaymentPlan','PaymentGateway','Reconciliation'] }),
    gradingSchemes: builder.query<ApiResponse<GradingScheme[]>, void>({ query:()=>'/examinations/grading/schemes', providesTags:['Grading'] }),
    createGradingScheme: builder.mutation<ApiResponse<GradingScheme>, CreateGradingSchemeRequest>({ query:body=>({url:'/examinations/grading/schemes',method:'POST',body}), invalidatesTags:['Grading'] }),
    activateGradingScheme: builder.mutation<ApiResponse<GradingScheme>, string>({ query:id=>({url:`/examinations/grading/schemes/${id}/activate`,method:'PATCH'}), invalidatesTags:['Grading'] }),
    calculateResults: builder.mutation<ApiResponse<CalculatedResult[]>, CalculateResultsRequest>({ query:body=>({url:'/examinations/grading/calculate',method:'POST',body}), invalidatesTags:['CalculatedResult'] }),
    calculatedResults: builder.query<ApiResponse<CalculatedResult[]>, {teachingAssignmentId?:string; assessmentConfigurationId?:string}|void>({ query:params=>({url:'/examinations/grading/results',params: params ?? undefined}), providesTags:['CalculatedResult'] }),
    publishedResults: builder.query<ApiResponse<PublishedResult[]>, {teachingAssignmentId:string; assessmentConfigurationId:string}>({ query:params=>({url:'/examinations/publications',params: params ?? undefined}), providesTags:['PublishedResult'] }),
    publishResults: builder.mutation<ApiResponse<PublishedResult[]>, PublishResultsRequest>({ query:body=>({url:'/examinations/publications',method:'POST',body}), invalidatesTags:['PublishedResult','CalculatedResult'] }),
    reopenPublishedResult: builder.mutation<ApiResponse<PublishedResult>, {id:string; body:ReopenResultRequest}>({ query:({id,body})=>({url:`/examinations/publications/${id}/reopen`,method:'POST',body}), invalidatesTags:['PublishedResult','CalculatedResult'] }),
    generateReportCard: builder.mutation<ApiResponse<ReportCard>, GenerateReportCardRequest>({ query:body=>({url:'/examinations/report-cards',method:'POST',body}), invalidatesTags:['ReportCard'] }),
    reportCard: builder.query<ApiResponse<ReportCard>, string>({ query:id=>`/examinations/report-cards/${id}`, providesTags:['ReportCard'] }),
    studentReportCards: builder.query<ApiResponse<ReportCard[]>, string>({ query:studentId=>`/examinations/report-cards/student/${studentId}`, providesTags:['ReportCard'] }),
    publishReportCard: builder.mutation<ApiResponse<ReportCard>, string>({ query:id=>({url:`/examinations/report-cards/${id}/publish`,method:'POST'}), invalidatesTags:['ReportCard'] }),
    reopenReportCard: builder.mutation<ApiResponse<ReportCard>, {id:string; body:ReopenReportCardRequest}>({ query:({id,body})=>({url:`/examinations/report-cards/${id}/reopen`,method:'POST',body}), invalidatesTags:['ReportCard'] }),
    studentPublishedResults: builder.query<ApiResponse<PublishedResult[]>, string>({ query:studentId=>`/examinations/publications/student/${studentId}`, providesTags:['PublishedResult'] }),
    financialBalance: builder.query<ApiResponse<number>, {studentId:string; sessionId?:string; termId?:string}>({ query: ({studentId, ...params}) => ({url:`/fees/accounts/${studentId}/balance`, params: params ?? undefined}), providesTags:['FeeCharge','FeePayment'] }),
    portalFinancialStudents: builder.query<ApiResponse<PortalStudent[]>, void>({ query:()=>'/portal/financial/students', providesTags:['Student','Guardian','FeeCharge','FeePayment'] }),
    portalFinancialAccount: builder.query<ApiResponse<PortalFinancial>, {studentId:string; sessionId?:string; termId?:string; from?:string; to?:string}>({ query:({studentId,...params})=>({url:`/portal/financial/students/${studentId}`,params: params ?? undefined}), providesTags:['Student','FeeCharge','FeePayment'] }),
    academicStudentReport: builder.query<ApiResponse<StudentAcademicReport>, {studentId:string;termId:string}>({ query: ({studentId,termId}) => ({url:`/academic/reporting/students/${studentId}`, params:{termId}}), providesTags:['AcademicPortal','PublishedResult','Attendance'] }),
    academicClassReport: builder.query<ApiResponse<ClassAcademicReport>, {classId:string;termId:string}>({ query: ({classId,termId}) => ({url:`/academic/reporting/classes/${classId}`, params:{termId}}), providesTags:['AcademicPortal','PublishedResult','Attendance'] }),
    academicTermReport: builder.query<ApiResponse<TermAcademicOverview>, string>({ query: termId => `/academic/reporting/terms/${termId}`, providesTags:['AcademicPortal','PublishedResult','Attendance'] }),
    academicPortalStudents: builder.query<ApiResponse<StudentPortalProfile[]>, void>({ query:()=>'/portal/academic/students', providesTags:['AcademicPortal','Student','Guardian'] }),
    academicPortalWorkspace: builder.query<ApiResponse<StudentAcademicWorkspace>, string>({ query:studentId=>`/portal/academic/students/${studentId}`, providesTags:['AcademicPortal','Student','Attendance','PublishedResult','ReportCard','Timetable','Announcement'] }),
    parentAcademicWorkspace: builder.query<ApiResponse<ParentAcademicWorkspace>, string>({ query:studentId=>`/portal/academic/parent/students/${studentId}`, providesTags:['AcademicPortal','Student','Guardian','Attendance','PublishedResult','ReportCard','Timetable','Announcement'] }),
    cbtExams: builder.query<ApiResponse<CbtExam[]>, void>({ query:()=>'/examinations/cbt/exams', providesTags:['CbtExam'] }),
    cbtExam: builder.query<ApiResponse<CbtExam>, string>({ query:id=>`/examinations/cbt/exams/${id}`, providesTags:['CbtExam'] }),
    createCbtExam: builder.mutation<ApiResponse<CbtExam>, CreateCbtExamRequest>({ query:body=>({url:'/examinations/cbt/exams',method:'POST',body}), invalidatesTags:['CbtExam'] }),
    addCbtQuestion: builder.mutation<ApiResponse<CbtQuestion>, {id:string; body:CreateCbtQuestionRequest}>({ query:({id,body})=>({url:`/examinations/cbt/exams/${id}/questions`,method:'POST',body}), invalidatesTags:['CbtExam'] }),
    publishCbtExam: builder.mutation<ApiResponse<CbtExam>, string>({ query:id=>({url:`/examinations/cbt/exams/${id}/publish`,method:'PATCH'}), invalidatesTags:['CbtExam'] }),
    closeCbtExam: builder.mutation<ApiResponse<CbtExam>, string>({ query:id=>({url:`/examinations/cbt/exams/${id}/close`,method:'PATCH'}), invalidatesTags:['CbtExam'] }),
    startCbtAttempt: builder.mutation<ApiResponse<CbtAttempt>, StartCbtAttemptRequest>({ query:body=>({url:'/examinations/cbt/attempts',method:'POST',body}), invalidatesTags:['CbtAttempt','CbtExam'] }),
    cbtAttempt: builder.query<ApiResponse<CbtAttempt>, string>({ query:id=>`/examinations/cbt/attempts/${id}`, providesTags:['CbtAttempt'] }),
    cbtAttemptsForEnrollment: builder.query<ApiResponse<CbtAttempt[]>, string>({ query:id=>`/examinations/cbt/attempts/enrollment/${id}`, providesTags:['CbtAttempt'] }),
    saveCbtAnswer: builder.mutation<ApiResponse<CbtAnswer>, {id:string; body:SaveCbtAnswerRequest}>({ query:({id,body})=>({url:`/examinations/cbt/attempts/${id}/answers`,method:'PUT',body}), invalidatesTags:['CbtAttempt'] }),
    submitCbtAttempt: builder.mutation<ApiResponse<CbtAttempt>, string>({ query:id=>({url:`/examinations/cbt/attempts/${id}/submit`,method:'POST'}), invalidatesTags:['CbtAttempt'] }),
    transportVehicles: builder.query<ApiResponse<Vehicle[]>, void>({ query:()=>'/transport/vehicles', providesTags:['Transport'] }),
    createTransportVehicle: builder.mutation<ApiResponse<Vehicle>, CreateVehicleRequest>({ query:body=>({url:'/transport/vehicles',method:'POST',body}), invalidatesTags:['Transport'] }),
    transportDrivers: builder.query<ApiResponse<Driver[]>, void>({ query:()=>'/transport/drivers', providesTags:['Transport'] }),
    createTransportDriver: builder.mutation<ApiResponse<Driver>, CreateDriverRequest>({ query:body=>({url:'/transport/drivers',method:'POST',body}), invalidatesTags:['Transport'] }),
    transportRoutes: builder.query<ApiResponse<TransportRoute[]>, void>({ query:()=>'/transport/routes', providesTags:['Transport'] }),
    createTransportRoute: builder.mutation<ApiResponse<TransportRoute>, CreateTransportRouteRequest>({ query:body=>({url:'/transport/routes',method:'POST',body}), invalidatesTags:['Transport'] }),
    routeStops: builder.query<ApiResponse<RouteStop[]>, string>({ query:id=>`/transport/routes/${id}/stops`, providesTags:['Transport'] }),
    createRouteStop: builder.mutation<ApiResponse<RouteStop>, {routeId:string; body:CreateRouteStopRequest}>({ query:({routeId,body})=>({url:`/transport/routes/${routeId}/stops`,method:'POST',body}), invalidatesTags:['Transport'] }),
    transportAssignments: builder.query<ApiResponse<StudentTransportAssignment[]>, void>({ query:()=>'/transport/assignments', providesTags:['Transport'] }),
    createTransportAssignment: builder.mutation<ApiResponse<StudentTransportAssignment>, CreateTransportAssignmentRequest>({ query:body=>({url:'/transport/assignments',method:'POST',body}), invalidatesTags:['Transport'] }),
    transportAttendance: builder.query<ApiResponse<TransportAttendance[]>, string>({ query:date=>({url:'/transport/attendance',params:{date}}), providesTags:['Transport'] }),
    recordTransportAttendance: builder.mutation<ApiResponse<TransportAttendance>, {assignmentId:string; body:RecordTransportAttendanceRequest}>({ query:({assignmentId,body})=>({url:`/transport/assignments/${assignmentId}/attendance`,method:'POST',body}), invalidatesTags:['Transport'] }),
    libraryBooks: builder.query<ApiResponse<LibraryBook[]>, void>({ query:()=>'/library/books', providesTags:['Library'] }),
    createLibraryBook: builder.mutation<ApiResponse<LibraryBook>, CreateBookRequest>({ query:body=>({url:'/library/books',method:'POST',body}), invalidatesTags:['Library'] }),
    libraryCopies: builder.query<ApiResponse<LibraryBookCopy[]>, string>({ query:id=>`/library/books/${id}/copies`, providesTags:['Library'] }),
    createLibraryCopy: builder.mutation<ApiResponse<LibraryBookCopy>, {bookId:string;body:CreateBookCopyRequest}>({ query:({bookId,body})=>({url:`/library/books/${bookId}/copies`,method:'POST',body}), invalidatesTags:['Library'] }),
    libraryMembers: builder.query<ApiResponse<LibraryMember[]>, void>({ query:()=>'/library/members', providesTags:['Library'] }),
    createLibraryMember: builder.mutation<ApiResponse<LibraryMember>, CreateLibraryMemberRequest>({ query:body=>({url:'/library/members',method:'POST',body}), invalidatesTags:['Library'] }),
    libraryLoans: builder.query<ApiResponse<LibraryLoan[]>, void>({ query:()=>'/library/loans', providesTags:['Library'] }),
    borrowLibraryBook: builder.mutation<ApiResponse<LibraryLoan>, BorrowBookRequest>({ query:body=>({url:'/library/loans',method:'POST',body}), invalidatesTags:['Library'] }),
    returnLibraryBook: builder.mutation<ApiResponse<LibraryLoan>, string>({ query:id=>({url:`/library/loans/${id}/return`,method:'PATCH'}), invalidatesTags:['Library'] }),
    renewLibraryBook: builder.mutation<ApiResponse<LibraryLoan>, {id:string;dueAt:string}>({ query:({id,dueAt})=>({url:`/library/loans/${id}/renew`,method:'PATCH',params:{dueAt}}), invalidatesTags:['Library'] }),
    libraryReservations: builder.query<ApiResponse<LibraryReservation[]>, void>({ query:()=>'/library/reservations', providesTags:['Library'] }),
    reserveLibraryBook: builder.mutation<ApiResponse<LibraryReservation>, ReserveBookRequest>({ query:body=>({url:'/library/reservations',method:'POST',body}), invalidatesTags:['Library'] }),
    libraryFines: builder.query<ApiResponse<LibraryFine[]>, void>({ query:()=>'/library/fines', providesTags:['Library'] }),
    assessLibraryFine: builder.mutation<ApiResponse<LibraryFine>, AssessLibraryFineRequest>({ query:body=>({url:'/library/fines',method:'POST',body}), invalidatesTags:['Library'] }),
    payLibraryFine: builder.mutation<ApiResponse<LibraryFine>, string>({ query:id=>({url:`/library/fines/${id}/pay`,method:'PATCH'}), invalidatesTags:['Library'] }),
    inventoryCategories: builder.query<ApiResponse<InventoryCategory[]>, void>({ query:()=>'/inventory/categories', providesTags:['Inventory'] }),
    createInventoryCategory: builder.mutation<ApiResponse<InventoryCategory>, CreateInventoryCategoryRequest>({ query:body=>({url:'/inventory/categories',method:'POST',body}), invalidatesTags:['Inventory'] }),
    inventoryItems: builder.query<ApiResponse<InventoryItem[]>, void>({ query:()=>'/inventory/items', providesTags:['Inventory'] }),
    createInventoryItem: builder.mutation<ApiResponse<InventoryItem>, CreateInventoryItemRequest>({ query:body=>({url:'/inventory/items',method:'POST',body}), invalidatesTags:['Inventory'] }),
    inventorySuppliers: builder.query<ApiResponse<InventorySupplier[]>, void>({ query:()=>'/inventory/suppliers', providesTags:['Inventory'] }),
    createInventorySupplier: builder.mutation<ApiResponse<InventorySupplier>, CreateInventorySupplierRequest>({ query:body=>({url:'/inventory/suppliers',method:'POST',body}), invalidatesTags:['Inventory'] }),
    inventoryStores: builder.query<ApiResponse<InventoryStore[]>, void>({ query:()=>'/inventory/stores', providesTags:['Inventory'] }),
    createInventoryStore: builder.mutation<ApiResponse<InventoryStore>, CreateInventoryStoreRequest>({ query:body=>({url:'/inventory/stores',method:'POST',body}), invalidatesTags:['Inventory'] }),
    inventoryBalances: builder.query<ApiResponse<StockBalance[]>, void>({ query:()=>'/inventory/balances', providesTags:['Inventory'] }),
    inventoryMovements: builder.query<ApiResponse<StockMovement[]>, void>({ query:()=>'/inventory/movements', providesTags:['Inventory'] }),
    receiveInventoryStock: builder.mutation<ApiResponse<StockMovement>, StockMovementRequest>({ query:body=>({url:'/inventory/stock/receive',method:'POST',body}), invalidatesTags:['Inventory'] }),
    issueInventoryStock: builder.mutation<ApiResponse<StockMovement>, StockMovementRequest>({ query:body=>({url:'/inventory/stock/issue',method:'POST',body}), invalidatesTags:['Inventory'] }),
    transferInventoryStock: builder.mutation<ApiResponse<void>, StockTransferRequest>({ query:body=>({url:'/inventory/stock/transfer',method:'POST',body}), invalidatesTags:['Inventory'] }),
    purchaseRequisitions: builder.query<ApiResponse<PurchaseRequisition[]>, void>({ query:()=>'/inventory/requisitions', providesTags:['Inventory'] }),
    createPurchaseRequisition: builder.mutation<ApiResponse<PurchaseRequisition>, CreatePurchaseRequisitionRequest>({ query:body=>({url:'/inventory/requisitions',method:'POST',body}), invalidatesTags:['Inventory'] }),
    approvePurchaseRequisition: builder.mutation<ApiResponse<PurchaseRequisition>, string>({ query:id=>({url:`/inventory/requisitions/${id}/approve`,method:'PATCH'}), invalidatesTags:['Inventory'] }),
    purchaseOrders: builder.query<ApiResponse<PurchaseOrder[]>, void>({ query:()=>'/inventory/purchase-orders', providesTags:['Inventory'] }),
    createPurchaseOrder: builder.mutation<ApiResponse<PurchaseOrder>, CreatePurchaseOrderRequest>({ query:body=>({url:'/inventory/purchase-orders',method:'POST',body}), invalidatesTags:['Inventory'] }),
    approvePurchaseOrder: builder.mutation<ApiResponse<PurchaseOrder>, string>({ query:id=>({url:`/inventory/purchase-orders/${id}/approve`,method:'PATCH'}), invalidatesTags:['Inventory'] }),
    goodsReceipts: builder.query<ApiResponse<GoodsReceipt[]>, void>({ query:()=>'/inventory/goods-receipts', providesTags:['Inventory'] }),
    createGoodsReceipt: builder.mutation<ApiResponse<GoodsReceipt>, CreateGoodsReceiptRequest>({ query:body=>({url:'/inventory/goods-receipts',method:'POST',body}), invalidatesTags:['Inventory'] }),
    reconciliation: builder.query<ApiResponse<Reconciliation>, string>({ query:date=>({url:'/fees/reconciliation/daily',params:{date}}), providesTags:['Reconciliation','FeePayment'] }),
    reconciliationHistory: builder.query<ApiResponse<Reconciliation[]>, {from?:string;to?:string}|void>({ query:params=>({url:'/fees/reconciliation',params: params ?? undefined}), providesTags:['Reconciliation','FeePayment'] }),
    reconcileDay: builder.mutation<ApiResponse<Reconciliation>, ReconcileDayRequest>({ query:body=>({url:'/fees/reconciliation',method:'POST',body}), invalidatesTags:['Reconciliation'] }),

    hrDashboard: builder.query<ApiResponse<HrDashboard>, void>({ query: () => '/hr/dashboard', providesTags: ['HR'] }),
    hrDepartments: builder.query<ApiResponse<HrDepartment[]>, void>({ query: () => '/hr/departments', providesTags: ['HR'] }),
    createHrDepartment: builder.mutation<ApiResponse<HrDepartment>, HrDepartmentRequest>({ query: body => ({url:'/hr/departments',method:'POST',body}), invalidatesTags:['HR'] }),
    hrDesignations: builder.query<ApiResponse<HrDesignation[]>, void>({ query: () => '/hr/designations', providesTags: ['HR'] }),
    createHrDesignation: builder.mutation<ApiResponse<HrDesignation>, HrDesignationRequest>({ query: body => ({url:'/hr/designations',method:'POST',body}), invalidatesTags:['HR'] }),
    hrEmployees: builder.query<ApiResponse<HrEmployee[]>, void>({ query: () => '/hr/employees', providesTags: ['HR'] }),
    hrEmployee: builder.query<ApiResponse<HrEmployee>, string>({ query: id => `/hr/employees/${id}`, providesTags:['HR'] }),
    updateHrEmployee: builder.mutation<ApiResponse<HrEmployee>, {id:string;body:HrEmployeeUpdateRequest}>({ query: ({id,body}) => ({url:`/hr/employees/${id}`,method:'PATCH',body}), invalidatesTags:['HR'] }),
    setHrEmployeeActive: builder.mutation<ApiResponse<HrEmployee>, {id:string;active:boolean}>({ query: ({id,active}) => ({url:`/hr/employees/${id}/active`,method:'PATCH',params:{active}}), invalidatesTags:['HR'] }),
    createHrEmployee: builder.mutation<ApiResponse<HrEmployee>, HrEmployeeRequest>({ query: body => ({url:'/hr/employees',method:'POST',body}), invalidatesTags:['HR'] }),
    hrContracts: builder.query<ApiResponse<HrContract[]>, string>({ query: id => `/hr/employees/${id}/contracts`, providesTags:['HR'] }),
    updateHrContract: builder.mutation<ApiResponse<HrContract>, {id:string;body:HrContractUpdateRequest}>({ query: ({id,body}) => ({url:`/hr/contracts/${id}`,method:'PATCH',body}), invalidatesTags:['HR'] }),
    renewHrContract: builder.mutation<ApiResponse<HrContract>, {id:string;body:HrContractRenewRequest}>({ query: ({id,body}) => ({url:`/hr/contracts/${id}/renew`,method:'POST',body}), invalidatesTags:['HR'] }),
    terminateHrContract: builder.mutation<ApiResponse<HrContract>, string>({ query: id => ({url:`/hr/contracts/${id}/terminate`,method:'POST'}), invalidatesTags:['HR'] }),
    createHrContract: builder.mutation<ApiResponse<HrContract>, HrContractRequest>({ query: body => ({url:'/hr/contracts',method:'POST',body}), invalidatesTags:['HR'] }),
    recordHrAttendance: builder.mutation<ApiResponse<HrAttendance>, HrAttendanceRequest>({ query: body => ({url:'/hr/attendance',method:'POST',body}), invalidatesTags:['HR'] }),
    hrEmployeeAttendance: builder.query<ApiResponse<HrAttendance[]>, string>({ query: id => `/hr/employees/${id}/attendance`, providesTags:['HR'] }),
    hrEmployeeDocuments: builder.query<ApiResponse<HrEmployeeDocument[]>, string>({ query: id => `/hr/employees/${id}/documents`, providesTags:['HR'] }),
    addHrEmployeeDocument: builder.mutation<ApiResponse<HrEmployeeDocument>, HrEmployeeDocumentRequest>({ query: body => ({url:'/hr/documents',method:'POST',body}), invalidatesTags:['HR'] }),
    updateHrEmployeeDocument: builder.mutation<ApiResponse<HrEmployeeDocument>, {id:string;body:HrEmployeeDocumentUpdateRequest}>({ query: ({id,body}) => ({url:`/hr/documents/${id}`,method:'PATCH',body}), invalidatesTags:['HR'] }),
    deleteHrEmployeeDocument: builder.mutation<ApiResponse<void>, string>({ query: id => ({url:`/hr/documents/${id}`,method:'DELETE'}), invalidatesTags:['HR'] }),
    hrAttendanceForDate: builder.query<ApiResponse<HrAttendance[]>, string>({ query: date => ({url:'/hr/attendance',params:{date}}), providesTags:['HR'] }),
    hrAttendanceSummary: builder.query<ApiResponse<HrAttendanceSummary>, string>({ query: date => ({url:'/hr/attendance/summary',params:{date}}), providesTags:['HR'] }),
    hrCheckIn: builder.mutation<ApiResponse<HrAttendance>, HrAttendanceCheckRequest>({ query: body => ({url:'/hr/attendance/check-in',method:'POST',body}), invalidatesTags:['HR'] }),
    hrCheckOut: builder.mutation<ApiResponse<HrAttendance>, HrAttendanceCheckRequest>({ query: body => ({url:'/hr/attendance/check-out',method:'POST',body}), invalidatesTags:['HR'] }),
    hrLeaveTypes: builder.query<ApiResponse<HrLeaveType[]>, void>({ query: () => '/hr/leave-types', providesTags:['HR'] }),
    createHrLeaveType: builder.mutation<ApiResponse<HrLeaveType>, HrLeaveTypeRequest>({ query: body => ({url:'/hr/leave-types',method:'POST',body}), invalidatesTags:['HR'] }),
    createHrLeaveRequest: builder.mutation<ApiResponse<HrLeaveRequest>, HrLeaveRequestRequest>({ query: body => ({url:'/hr/leave-requests',method:'POST',body}), invalidatesTags:['HR'] }),
    hrEmployeeLeave: builder.query<ApiResponse<HrLeaveRequest[]>, string>({ query: id => `/hr/employees/${id}/leave-requests`, providesTags:['HR'] }),
    hrPendingLeave: builder.query<ApiResponse<HrLeaveRequest[]>, void>({ query: () => '/hr/leave-requests/pending', providesTags:['HR'] }),
    reviewHrLeave: builder.mutation<ApiResponse<HrLeaveRequest>, {id:string;body:HrLeaveReview}>({ query: ({id,body}) => ({url:`/hr/leave-requests/${id}/review`,method:'POST',body}), invalidatesTags:['HR'] }),
    cancelHrLeave: builder.mutation<ApiResponse<HrLeaveRequest>, {id:string;employeeId:string}>({ query: ({id,employeeId}) => ({url:`/hr/leave-requests/${id}/cancel`,method:'POST',params:{employeeId}}), invalidatesTags:['HR'] }),
    initializeHrLeaveBalance: builder.mutation<ApiResponse<HrLeaveBalance>, HrLeaveBalanceInitializeRequest>({ query: body => ({url:'/hr/leave-balances/initialize',method:'POST',body}), invalidatesTags:['HR'] }),
    hrLeaveBalances: builder.query<ApiResponse<HrLeaveBalance[]>, {id:string;year?:number}>({ query: ({id,year=2026}) => ({url:`/hr/employees/${id}/leave-balances`,params:{year}}), providesTags:['HR'] }),
    hrPayrollComponents: builder.query<ApiResponse<HrPayrollComponent[]>, void>({ query: () => '/hr/payroll/components', providesTags:['HR'] }),
    createHrPayrollComponent: builder.mutation<ApiResponse<HrPayrollComponent>, HrPayrollComponentRequest>({ query: body => ({url:'/hr/payroll/components',method:'POST',body}), invalidatesTags:['HR'] }),
    hrPayrollPeriods: builder.query<ApiResponse<HrPayrollPeriod[]>, void>({ query: () => '/hr/payroll/periods', providesTags:['HR'] }),
    hrPayrollRuns: builder.query<ApiResponse<HrPayrollRun[]>, void>({ query: () => '/hr/payroll/runs', providesTags:['HR'] }),
    createHrPayrollPeriod: builder.mutation<ApiResponse<HrPayrollPeriod>, HrPayrollPeriodRequest>({ query: body => ({url:'/hr/payroll/periods',method:'POST',body}), invalidatesTags:['HR'] }),
    calculateHrPayroll: builder.mutation<ApiResponse<HrPayrollRun>, string>({ query: periodId => ({url:`/hr/payroll/runs/${periodId}/calculate`,method:'POST'}), invalidatesTags:['HR'] }),
    approveHrPayroll: builder.mutation<ApiResponse<HrPayrollRun>, string>({ query: id => ({url:`/hr/payroll/runs/${id}/approve`,method:'POST'}), invalidatesTags:['HR'] }),
    processHrPayroll: builder.mutation<ApiResponse<HrPayrollRun>, string>({ query: id => ({url:`/hr/payroll/runs/${id}/process`,method:'POST'}), invalidatesTags:['HR'] }),
    hrPayrollEntries: builder.query<ApiResponse<HrPayrollEntry[]>, string>({ query: id => `/hr/payroll/runs/${id}/entries`, providesTags:['HR'] }),
    hrPayslips: builder.query<ApiResponse<HrPayslip[]>, void>({ query: () => '/hr/payslips', providesTags:['HR'] }),
    hrSelfWorkspace: builder.query<ApiResponse<HrSelfWorkspace>, void>({ query: () => '/hr/self', providesTags:['HR'] }),
    hrSelfProfile: builder.query<ApiResponse<HrEmployee>, void>({ query: () => '/hr/self/profile', providesTags:['HR'] }),
    hrSelfContracts: builder.query<ApiResponse<HrContract[]>, void>({ query: () => '/hr/self/contracts', providesTags:['HR'] }),
    hrSelfDocuments: builder.query<ApiResponse<HrEmployeeDocument[]>, void>({ query: () => '/hr/self/documents', providesTags:['HR'] }),
    hrSelfAttendance: builder.query<ApiResponse<HrAttendance[]>, void>({ query: () => '/hr/self/attendance', providesTags:['HR'] }),
    hrSelfLeave: builder.query<ApiResponse<HrLeaveRequest[]>, void>({ query: () => '/hr/self/leave', providesTags:['HR'] }),
    hrSelfLeaveBalances: builder.query<ApiResponse<HrLeaveBalance[]>, number | void>({ query: year => ({url:'/hr/self/leave-balances',params:{year:year ?? new Date().getFullYear()}}), providesTags:['HR'] }),
    hrSelfPayroll: builder.query<ApiResponse<HrPayrollEntry[]>, void>({ query: () => '/hr/self/payroll', providesTags:['HR'] }),
    hrSelfPayslips: builder.query<ApiResponse<HrPayslip[]>, void>({ query: () => '/hr/self/payslips', providesTags:['HR'] }),
    hrSelfRequestLeave: builder.mutation<ApiResponse<HrLeaveRequest>, HrSelfLeaveRequest>({ query: body => ({url:'/hr/self/leave-requests',method:'POST',body}), invalidatesTags:['HR'] }),
    hrSelfCancelLeave: builder.mutation<ApiResponse<HrLeaveRequest>, string>({ query: id => ({url:`/hr/self/leave-requests/${id}/cancel`,method:'POST'}), invalidatesTags:['HR'] }),
    generateHrPayslip: builder.mutation<ApiResponse<HrPayslip>, string>({ query: id => ({url:`/hr/payslips/${id}/generate`,method:'POST'}), invalidatesTags:['HR'] }),
    submitHrPayrollReview: builder.mutation<ApiResponse<HrPayrollRun>, string>({ query: id => ({url:`/hr/payroll/runs/${id}/review`,method:'POST'}), invalidatesTags:['HR'] }),
    rejectHrPayroll: builder.mutation<ApiResponse<HrPayrollRun>, string>({ query: id => ({url:`/hr/payroll/runs/${id}/reject`,method:'POST'}), invalidatesTags:['HR'] }),
    hrWorkforceReport: builder.query<ApiResponse<HrWorkforceReport>, void>({ query: () => '/hr/reports/workforce', providesTags:['HR'] }),
    hrAttendanceReport: builder.query<ApiResponse<HrAttendanceReport>, {start:string;end:string}>({ query: ({start,end}) => ({url:'/hr/reports/attendance',params:{start,end}}), providesTags:['HR'] }),
    hrLeaveReport: builder.query<ApiResponse<HrLeaveReport>, number>({ query: year => ({url:'/hr/reports/leave',params:{year}}), providesTags:['HR'] }),
    hrExpiringContracts: builder.query<ApiResponse<HrContractExpiry[]>, number|void>({ query: days => ({url:'/hr/reports/contracts/expiring',params:{days:days??30}}), providesTags:['HR'] }),
    hrExpiringDocuments: builder.query<ApiResponse<HrDocumentExpiry[]>, number|void>({ query: days => ({url:'/hr/reports/documents/expiring',params:{days:days??30}}), providesTags:['HR'] }),
    hrPayrollReport: builder.query<ApiResponse<HrPayrollReport[]>, void>({ query: () => '/hr/reports/payroll', providesTags:['HR'] }),
  }),
});

export const {
  useDashboardQuery,
  useRoleDashboardQuery,
  useAdmissionsQuery,
  useAdmissionDashboardQuery,
  useCreateAdmissionApplicationMutation,
  useUpdateAdmissionStatusMutation,
  useAcceptAdmissionMutation,
  useGrantAdmissionMutation,
  useAdmissionInvoiceQuery,
  useAdmissionPaymentsQuery,
  useRecordAdmissionPaymentMutation,
  useInitializeAdmissionPaymentMutation,
  useVerifyAdmissionPaymentQuery,
  useAdmissionFeeItemsQuery,
  useCreateAdmissionFeeItemMutation,
  useUpdateAdmissionFeeItemMutation,
  useStudentsQuery,
  useCreateStudentMutation,
  useUpdateStudentMutation,
  useUpdateStudentStatusMutation,
  useGuardiansQuery,
  useCreateGuardianMutation,
  useUpdateGuardianMutation,
  useStudentGuardiansQuery,
  useLinkGuardianMutation,
  useUnlinkGuardianMutation,
  useEnrollmentsQuery,
  useCreateEnrollmentMutation,
  useUpdateEnrollmentMutation,
  useDeleteEnrollmentMutation,
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
  useCreateTeacherMutation,
  useTeacherAttendanceQuery,
  useMarkTeacherAttendanceMutation,
  useUpdateTeacherAttendanceMutation,
  useDeleteTeacherAttendanceMutation,
  useTeacherAttendanceSummaryQuery,
  useAssessmentConfigurationsQuery,
  useCreateAssessmentConfigurationMutation,
  useUpdateAssessmentConfigurationMutation,
  useActivateAssessmentConfigurationMutation,
  useDeleteAssessmentConfigurationMutation,
  useStudentScoresQuery,
  useSaveStudentScoreMutation,
  useSaveStudentScoresBulkMutation,
  useUpdateStudentScoreMutation,
  useSubmitStudentScoresMutation,
  useApproveStudentScoresMutation,
  useReturnStudentScoresMutation,
  useGradingSchemesQuery,
  useCreateGradingSchemeMutation,
  useActivateGradingSchemeMutation,
  useCalculateResultsMutation,
  useCalculatedResultsQuery,
  usePublishedResultsQuery,
  usePublishResultsMutation,
  useReopenPublishedResultMutation,
  useGenerateReportCardMutation,
  useReportCardQuery,
  useStudentReportCardsQuery,
  usePublishReportCardMutation,
  useReopenReportCardMutation,
  useStudentPublishedResultsQuery,

  useTeachingAssignmentsQuery,
  useCreateTeachingAssignmentMutation,
  useDeleteTeachingAssignmentMutation,
  useOperationalDaysQuery,
  useUpdateOperationalDayMutation,
  useTimetablePeriodsQuery,
  useTimetableEntriesQuery,
  useTimetableClassWeeklyQuery,
  useTimetableTeacherWeeklyQuery,
  useTimetableFacilityWeeklyQuery,
  useCreateTimetableEntryMutation,
  useUpdateTimetableEntryMutation,
  useDeleteTimetableEntryMutation,
  useTimetablePublicationsQuery,
  usePublishTimetableMutation,
  useReopenTimetableMutation,
  useCreateTimetablePeriodMutation,
  useUpdateTimetablePeriodMutation,
  useActivateTimetablePeriodMutation,
  useDeactivateTimetablePeriodMutation,
  useDeleteTimetablePeriodMutation,

  useHostelsQuery, useCreateHostelMutation, useActivateHostelMutation, useDeactivateHostelMutation,
  useHostelBlocksQuery, useCreateHostelBlockMutation, useHostelRoomsQuery, useCreateHostelRoomMutation,
  useHostelBedsQuery, useCreateHostelBedMutation, useAvailableHostelBedsQuery, useBoardingAllocationsByTermQuery,
  useBoardingAllocationsByStudentQuery, useCreateBoardingAllocationMutation, useCheckInBoardingMutation, useCheckOutBoardingMutation,
  useFacilitiesQuery,
  useActiveFacilitiesQuery,
  useCreateFacilityMutation,
  useUpdateFacilityMutation,
  useActivateFacilityMutation,
  useDeactivateFacilityMutation,
  useDeleteFacilityMutation,
  useStudentAttendanceQuery,
  useAttendanceSummaryQuery,
  useMarkAttendanceMutation,
  useUpdateAttendanceMutation,
  useDeleteAttendanceMutation,
  useFeeStructuresQuery,
  useCreateFeeStructureMutation,
  useUpdateFeeStructureMutation,
  useActivateFeeStructureMutation,
  useDeleteFeeStructureMutation,
  useFeeChargesQuery,
  useGenerateFeeChargesMutation,
  useInvoicesQuery,
  useInvoiceByIdQuery,
  useCreateInvoiceMutation,
  useRefreshInvoiceMutation,
  useCancelInvoiceMutation,
  usePaymentPlansQuery,
  usePaymentPlanByIdQuery,
  useCreatePaymentPlanMutation,
  useRefreshPaymentPlanMutation,
  useUpdateFeeChargeAdjustmentMutation,
  usePaymentsQuery,
  useCreatePaymentMutation,
  useAllocatePaymentMutation,
  usePaymentAllocationsQuery,
  useReversePaymentMutation,
  useReceiptsQuery,
  useReceiptByPaymentQuery,
  useReconciliationQuery,
  useReconciliationHistoryQuery,
  useReconcileDayMutation,
  useReverseGatewayPaymentMutation,
  usePaymentRefundsQuery,
  useRequestPaymentRefundMutation,
  useApprovePaymentRefundMutation,
  usePaymentAdjustmentsQuery,
  useApplyPaymentAdjustmentMutation,
  usePaymentReconciliationQuery,
  usePaymentReconciliationHistoryQuery,
  useRunPaymentReconciliationMutation,
  useInventoryCategoriesQuery,
  useCreateInventoryCategoryMutation,
  useInventoryItemsQuery,
  useCreateInventoryItemMutation,
  useInventorySuppliersQuery,
  useCreateInventorySupplierMutation,
  useInventoryStoresQuery,
  useCreateInventoryStoreMutation,
  useInventoryBalancesQuery,
  useInventoryMovementsQuery,
  useReceiveInventoryStockMutation,
  useIssueInventoryStockMutation,
  useTransferInventoryStockMutation,
  usePurchaseRequisitionsQuery,
  useCreatePurchaseRequisitionMutation,
  useApprovePurchaseRequisitionMutation,
  usePurchaseOrdersQuery,
  useCreatePurchaseOrderMutation,
  useApprovePurchaseOrderMutation,
  useGoodsReceiptsQuery,
  useCreateGoodsReceiptMutation,

  useLibraryBooksQuery,
  useCreateLibraryBookMutation,
  useLibraryCopiesQuery,
  useCreateLibraryCopyMutation,
  useLibraryMembersQuery,
  useCreateLibraryMemberMutation,
  useLibraryLoansQuery,
  useBorrowLibraryBookMutation,
  useReturnLibraryBookMutation,
  useRenewLibraryBookMutation,
  useLibraryReservationsQuery,
  useReserveLibraryBookMutation,
  useLibraryFinesQuery,
  useAssessLibraryFineMutation,
  usePayLibraryFineMutation,
  useTransportVehiclesQuery,
  useCreateTransportVehicleMutation,
  useTransportDriversQuery,
  useCreateTransportDriverMutation,
  useTransportRoutesQuery,
  useCreateTransportRouteMutation,
  useRouteStopsQuery,
  useCreateRouteStopMutation,
  useTransportAssignmentsQuery,
  useCreateTransportAssignmentMutation,
  useTransportAttendanceQuery,
  useRecordTransportAttendanceMutation,
  useFinancialAccountQuery,
  useInitializeGatewayPaymentMutation,
  useVerifyGatewayPaymentQuery,
  useFinancialStatementQuery,
  useFinancialReportQuery,
  useFinancialBalanceQuery,
  usePortalFinancialStudentsQuery,
  usePortalFinancialAccountQuery,
  usePublicAdmissionOptionsQuery,
  usePublicSubmitAdmissionMutation,
  usePublicAdmissionApplicationQuery,
  useImportAdmissionBatchMutation,
  useAdmissionBatchTemplateMutation,
  useAcademicStudentReportQuery, useAcademicClassReportQuery, useAcademicTermReportQuery, useAcademicPortalStudentsQuery, useAcademicPortalWorkspaceQuery, useParentAcademicWorkspaceQuery,
  useAnnouncementsQuery,
  useAnnouncementFeedQuery,
  useCreateAnnouncementMutation,
  usePublishAnnouncementMutation,
  useArchiveAnnouncementMutation,
  useMarkAnnouncementReadMutation,
  useCbtExamsQuery,
  useCbtExamQuery,
  useCreateCbtExamMutation,
  useAddCbtQuestionMutation,
  usePublishCbtExamMutation,
  useCloseCbtExamMutation,
  useStartCbtAttemptMutation,
  useCbtAttemptQuery,
  useCbtAttemptsForEnrollmentQuery,
  useSaveCbtAnswerMutation,
  useSubmitCbtAttemptMutation,
  useHrDashboardQuery, useHrWorkforceReportQuery, useHrAttendanceReportQuery, useHrLeaveReportQuery, useHrExpiringContractsQuery, useHrExpiringDocumentsQuery, useHrPayrollReportQuery, useHrSelfWorkspaceQuery, useHrSelfProfileQuery, useHrSelfContractsQuery, useHrSelfDocumentsQuery, useHrSelfAttendanceQuery, useHrSelfLeaveQuery, useHrSelfLeaveBalancesQuery, useHrSelfPayrollQuery, useHrSelfPayslipsQuery, useHrSelfRequestLeaveMutation, useHrSelfCancelLeaveMutation, useHrAttendanceForDateQuery, useHrAttendanceSummaryQuery, useHrCheckInMutation, useHrCheckOutMutation, useHrDepartmentsQuery, useCreateHrDepartmentMutation, useHrDesignationsQuery, useCreateHrDesignationMutation, useHrEmployeesQuery, useHrEmployeeQuery, useCreateHrEmployeeMutation, useUpdateHrEmployeeMutation, useSetHrEmployeeActiveMutation, useHrContractsQuery, useCreateHrContractMutation, useUpdateHrContractMutation, useRenewHrContractMutation, useTerminateHrContractMutation, useRecordHrAttendanceMutation, useHrEmployeeAttendanceQuery, useHrEmployeeDocumentsQuery, useAddHrEmployeeDocumentMutation, useUpdateHrEmployeeDocumentMutation, useDeleteHrEmployeeDocumentMutation, useHrLeaveTypesQuery, useCreateHrLeaveTypeMutation, useCreateHrLeaveRequestMutation, useHrEmployeeLeaveQuery, useHrPendingLeaveQuery, useReviewHrLeaveMutation, useCancelHrLeaveMutation, useInitializeHrLeaveBalanceMutation, useHrLeaveBalancesQuery, useHrPayrollComponentsQuery, useCreateHrPayrollComponentMutation, useHrPayrollPeriodsQuery, useHrPayrollRunsQuery, useCreateHrPayrollPeriodMutation, useCalculateHrPayrollMutation, useApproveHrPayrollMutation, useProcessHrPayrollMutation, useHrPayrollEntriesQuery, useHrPayslipsQuery, useGenerateHrPayslipMutation, useSubmitHrPayrollReviewMutation, useRejectHrPayrollMutation,
} = api;

export const { useNotificationsQuery, useUnreadNotificationCountQuery, useMarkNotificationReadMutation, useMarkAllNotificationsReadMutation, useCreateNotificationMutation } = api;
export const { useNotificationPreferencesQuery, useUpdateNotificationPreferencesMutation, useNotificationEmailDeliveriesQuery, useAllNotificationEmailDeliveriesQuery, useRetryNotificationEmailDeliveryMutation } = api;
