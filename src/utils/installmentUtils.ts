import { Student } from '../types';

export interface InstallmentInfo {
  isInstallment: boolean;
  hasPending: boolean;
  registrationDate: Date;
  registrationDateStr: string;
  daysSinceRegistration: number;
  dueDate: Date;
  dueDateStr: string;
  daysUntilDue: number;
  remainingAmount: number;
  status: 'overdue' | 'due_today' | 'due_tomorrow' | 'due_soon' | 'later';
  urgency: 'critical' | 'high' | 'medium' | 'normal';
  badgeText: string;
  badgeColorClass: string;
  isApproachingOrOverdue: boolean;
  cycleDays: number;
}

/**
 * Safely parses various date formats (e.g., 'YYYY-MM-DD HH:mm', ISO strings, 'YYYY-MM-DD')
 */
export function parseDateSafe(dateStr?: string): Date {
  if (!dateStr) return new Date();
  
  // Clean string
  const trimmed = dateStr.trim();
  
  // Replace space with T if format is "YYYY-MM-DD HH:mm"
  const isoFormatted = trimmed.includes(' ') && !trimmed.includes('T')
    ? trimmed.replace(' ', 'T')
    : trimmed;

  const parsed = new Date(isoFormatted);
  if (!isNaN(parsed.getTime())) {
    return parsed;
  }

  // Fallback try YYYY-MM-DD
  const parts = trimmed.slice(0, 10).split('-');
  if (parts.length === 3) {
    const y = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10) - 1;
    const d = parseInt(parts[2], 10);
    const dObj = new Date(y, m, d);
    if (!isNaN(dObj.getTime())) return dObj;
  }

  return new Date();
}

/**
 * Formats a Date object to YYYY-MM-DD
 */
export function formatDateIso(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Computes installment due details for a student based on their registration date (createdAt)
 * and their installment due date (or default 30-day cycle from registration).
 */
export function getStudentInstallmentInfo(
  student: Student,
  referenceDate: Date = new Date(),
  alertThresholdDays: number = 7
): InstallmentInfo {
  const isInstallment = student.paymentType === 'installment';
  const hasPending =
    isInstallment &&
    student.installmentStatus === 'pending_installment' &&
    (student.remainingAmount === undefined || student.remainingAmount > 0);

  const regDate = parseDateSafe(student.createdAt);
  const regDateStr = formatDateIso(regDate);

  // Normalize reference date to start of day (midnight)
  const today = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), referenceDate.getDate());
  const regDay = new Date(regDate.getFullYear(), regDate.getMonth(), regDate.getDate());

  const msPerDay = 1000 * 60 * 60 * 24;
  const daysSinceRegistration = Math.max(0, Math.floor((today.getTime() - regDay.getTime()) / msPerDay));

  // Determine Due Date:
  // If explicitly set on the student, use it; otherwise, calculate cycle (default 30 days from registration date)
  let dueDate: Date;
  let cycleDays = 30;

  if (student.installmentDueDate && student.installmentDueDate.trim()) {
    dueDate = parseDateSafe(student.installmentDueDate);
    const dueDay = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());
    cycleDays = Math.max(1, Math.round((dueDay.getTime() - regDay.getTime()) / msPerDay));
  } else {
    // Default 30-day installment period starting from registration date
    dueDate = new Date(regDay.getTime() + 30 * msPerDay);
    cycleDays = 30;
  }

  const dueDay = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());
  const daysUntilDue = Math.round((dueDay.getTime() - today.getTime()) / msPerDay);

  const remainingAmount =
    student.remainingAmount !== undefined
      ? student.remainingAmount
      : student.totalCourseFee
      ? Math.max(0, student.totalCourseFee - student.amountPaid)
      : 0;

  let status: InstallmentInfo['status'] = 'later';
  let urgency: InstallmentInfo['urgency'] = 'normal';
  let badgeText = '';
  let badgeColorClass = '';

  if (daysUntilDue < 0) {
    const overdueDays = Math.abs(daysUntilDue);
    status = 'overdue';
    urgency = 'critical';
    badgeText = overdueDays === 1 ? 'متأخر منذ يوم واحد' : `متأخر منذ ${overdueDays} أيام`;
    badgeColorClass = 'bg-rose-500/20 text-rose-300 border-rose-500/40';
  } else if (daysUntilDue === 0) {
    status = 'due_today';
    urgency = 'critical';
    badgeText = 'مستحق السداد اليوم!';
    badgeColorClass = 'bg-amber-500/30 text-amber-300 border-amber-500/50 animate-pulse';
  } else if (daysUntilDue === 1) {
    status = 'due_tomorrow';
    urgency = 'high';
    badgeText = 'مستحق غداً';
    badgeColorClass = 'bg-amber-500/25 text-amber-300 border-amber-500/40';
  } else if (daysUntilDue <= alertThresholdDays) {
    status = 'due_soon';
    urgency = daysUntilDue <= 3 ? 'high' : 'medium';
    badgeText = `متبقي ${daysUntilDue} أيام`;
    badgeColorClass =
      daysUntilDue <= 3
        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
        : 'bg-yellow-500/15 text-yellow-300 border-yellow-500/30';
  } else {
    status = 'later';
    urgency = 'normal';
    badgeText = `بعد ${daysUntilDue} يوم`;
    badgeColorClass = 'bg-slate-700/40 text-slate-300 border-slate-600/40';
  }

  // Is it approaching or overdue?
  const isApproachingOrOverdue = hasPending && daysUntilDue <= alertThresholdDays;

  return {
    isInstallment,
    hasPending,
    registrationDate: regDate,
    registrationDateStr: regDateStr,
    daysSinceRegistration,
    dueDate,
    dueDateStr: formatDateIso(dueDate),
    daysUntilDue,
    remainingAmount,
    status,
    urgency,
    badgeText,
    badgeColorClass,
    isApproachingOrOverdue,
    cycleDays,
  };
}

/**
 * Filter students who have active installments approaching due date or overdue
 */
export function getDueInstallments(
  students: Student[],
  referenceDate: Date = new Date(),
  alertThresholdDays: number = 7
): Array<{ student: Student; info: InstallmentInfo }> {
  return students
    .map((student) => ({
      student,
      info: getStudentInstallmentInfo(student, referenceDate, alertThresholdDays),
    }))
    .filter((item) => item.info.isApproachingOrOverdue)
    .sort((a, b) => a.info.daysUntilDue - b.info.daysUntilDue); // Most urgent (overdue, today, soonest) first
}
