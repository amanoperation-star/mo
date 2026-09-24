export type NavigationScreen =
  | 'new-student'
  | 'students-list'
  | 'expenses'
  | 'salaries'
  | 'analytics'
  | 'whatsapp'
  | 'courses'
  | 'staff'
  | 'audit-log'
  | 'settings';

export interface Student {
  id: string;
  code: string;
  name: string;
  phone: string;
  parentWhatsapp: string;
  grade: string;
  course: string;
  courseSchedule?: string;
  attendanceMode: string;
  amountPaid: number;
  paymentMethod: string;
  confirmedBy: string;
  receiptUrl?: string;
  createdAt: string;
  status: 'active' | 'pending' | 'suspended';
  paymentType?: 'full' | 'installment';
  totalCourseFee?: number;
  installmentStatus?: 'pending_installment' | 'paid_in_full';
  remainingAmount?: number;
  installmentDueDate?: string;
  installmentNotes?: string;
}

export interface Course {
  id: string;
  name: string;
  grade: string;
  price: number;
  enrolledCount: number;
  isActive: boolean;
  schedule?: string;
}

export interface Expense {
  id: string;
  title: string;
  category: 'منصات وسيرفرات' | 'رواتب ومكافآت' | 'مطبوعات ومذكرات' | 'تسويق وإعلانات' | 'أخرى';
  amount: number;
  date: string;
  paidBy: string;
  notes?: string;
}

export interface StaffMember {
  id: string;
  name: string;
  role: string;
  phone: string;
  baseSalary: number;
  bonus: number;
  status: 'مدفوع' | 'معلق';
  permissions: string[];
}

export interface WhatsAppTemplate {
  id: string;
  title: string;
  type: 'activation' | 'receipt' | 'reminder' | 'exam';
  message: string;
}

export interface WhatsAppIntegrationConfig {
  isConnected: boolean;
  gatewayType: 'qr_web' | 'meta_cloud' | 'ultra_msg';
  senderPhone: string;
  instanceName: string;
  webhookUrl: string;
  apiKey: string;
  autoSendOnRegistration: boolean;
  autoSendReceipt: boolean;
  autoSendExamScores: boolean;
  lastSyncTime?: string;
  batteryLevel?: number;
  qrCodeMock?: string;
}

export interface AuditLog {
  id: string;
  action: string;
  user: string;
  timestamp: string;
  details: string;
  type: 'info' | 'success' | 'warning';
}

export interface CenterSettings {
  centerName: string;
  phoneNumber: string;
  platformUrl: string;
  academicYear?: string;
  teacherName?: string;
  managerName?: string;
  systemDescription?: string;
  receiptSystemTitle?: string;
  receiptFooterText?: string;
}

export interface SupabaseConfig {
  projectUrl: string;
  anonKey: string; // Also serves as Publishable API Key
  publishableKey?: string;
  isConnected: boolean;
  autoSync: boolean;
  lastSyncTime?: string;
  syncStatus?: 'connected' | 'disconnected' | 'testing' | 'error';
}
