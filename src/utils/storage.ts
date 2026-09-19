import { Student, Course, Expense, StaffMember, WhatsAppTemplate, AuditLog, WhatsAppIntegrationConfig } from '../types';
import { initialStudents, initialCourses, initialExpenses, initialStaff, initialWhatsAppTemplates, initialAuditLogs } from '../data/initialData';

const STORAGE_KEYS = {
  STUDENTS: 'el_saqqa_students_v5',
  COURSES: 'el_saqqa_courses_v5',
  EXPENSES: 'el_saqqa_expenses_v5',
  STAFF: 'el_saqqa_staff_v5',
  TEMPLATES: 'el_saqqa_templates_v5',
  LOGS: 'el_saqqa_logs_v5',
  THEME: 'el_saqqa_theme_v5',
  WHATSAPP_CONFIG: 'el_saqqa_whatsapp_config_v5',
};

export const defaultWhatsConfig: WhatsAppIntegrationConfig = {
  isConnected: true,
  gatewayType: 'qr_web',
  senderPhone: '+20 102 984 7561',
  instanceName: 'سنتر الأستاذ أشرف السقا - بوت الرد والتفعيل الفوري',
  webhookUrl: 'https://api.el-saqqa-chem.online/v1/whatsapp-webhook',
  apiKey: 'wsk_live_98a7df542cbe819',
  autoSendOnRegistration: true,
  autoSendReceipt: true,
  autoSendExamScores: false,
  lastSyncTime: 'متصل الآن - بث مباشر',
  batteryLevel: 94,
};

export function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    if (!item) return fallback;
    return JSON.parse(item) as T;
  } catch (e) {
    console.error(`Error loading key ${key} from storage:`, e);
    return fallback;
  }
}

export function saveToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Error saving key ${key} to storage:`, e);
  }
}

export function getStoredStudents(): Student[] {
  return loadFromStorage<Student[]>(STORAGE_KEYS.STUDENTS, initialStudents);
}

export function saveStoredStudents(students: Student[]): void {
  saveToStorage(STORAGE_KEYS.STUDENTS, students);
}

export function getStoredCourses(): Course[] {
  return loadFromStorage<Course[]>(STORAGE_KEYS.COURSES, initialCourses);
}

export function saveStoredCourses(courses: Course[]): void {
  saveToStorage(STORAGE_KEYS.COURSES, courses);
}

export function getStoredExpenses(): Expense[] {
  return loadFromStorage<Expense[]>(STORAGE_KEYS.EXPENSES, initialExpenses);
}

export function saveStoredExpenses(expenses: Expense[]): void {
  saveToStorage(STORAGE_KEYS.EXPENSES, expenses);
}

export function getStoredStaff(): StaffMember[] {
  return loadFromStorage<StaffMember[]>(STORAGE_KEYS.STAFF, initialStaff);
}

export function saveStoredStaff(staff: StaffMember[]): void {
  saveToStorage(STORAGE_KEYS.STAFF, staff);
}

export function getStoredTemplates(): WhatsAppTemplate[] {
  return loadFromStorage<WhatsAppTemplate[]>(STORAGE_KEYS.TEMPLATES, initialWhatsAppTemplates);
}

export function saveStoredTemplates(templates: WhatsAppTemplate[]): void {
  saveToStorage(STORAGE_KEYS.TEMPLATES, templates);
}

export function getStoredLogs(): AuditLog[] {
  return loadFromStorage<AuditLog[]>(STORAGE_KEYS.LOGS, initialAuditLogs);
}

export function saveStoredLogs(logs: AuditLog[]): void {
  saveToStorage(STORAGE_KEYS.LOGS, logs);
}

export function getStoredWhatsConfig(): WhatsAppIntegrationConfig {
  return loadFromStorage<WhatsAppIntegrationConfig>(STORAGE_KEYS.WHATSAPP_CONFIG, defaultWhatsConfig);
}

export function saveStoredWhatsConfig(config: WhatsAppIntegrationConfig): void {
  saveToStorage(STORAGE_KEYS.WHATSAPP_CONFIG, config);
}

export function exportDatabaseToJson(): void {
  const data = {
    appName: 'منظومة مستر أشرف السقا v5.0',
    exportDate: new Date().toISOString(),
    students: getStoredStudents(),
    courses: getStoredCourses(),
    expenses: getStoredExpenses(),
    staff: getStoredStaff(),
    templates: getStoredTemplates(),
    logs: getStoredLogs(),
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `el_saqqa_backup_${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportStudentsToExcel(): void {
  const students = getStoredStudents();
  // Generate a UTF-8 BOM CSV that Excel opens cleanly in Arabic
  const headers = ['كود الطالب', 'اسم الطالب', 'رقم الهاتف', 'واتساب ولي الأمر', 'المرحلة', 'الكورس', 'المبلغ المدفوع', 'طريقة السداد', 'الموظف المسؤول', 'الحالة', 'تاريخ التسجيل'];
  const rows = students.map((s) => [
    s.code,
    `"${s.name.replace(/"/g, '""')}"`,
    s.phone,
    s.parentWhatsapp,
    `"${s.grade}"`,
    `"${s.course.replace(/"/g, '""')}"`,
    s.amountPaid,
    `"${s.paymentMethod}"`,
    `"${s.confirmedBy}"`,
    s.status === 'active' ? 'مفعل أونلاين' : 'معلق',
    s.createdAt,
  ]);

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `سجل_طلاب_مستر_أشرف_السقا_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
