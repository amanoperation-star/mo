import { Student, Course, Expense, StaffMember, WhatsAppTemplate, AuditLog } from '../types';

// Helper to generate dynamic relative dates for realistic live testing
const getRelativeDateStr = (offsetDays: number): string => {
  const d = new Date(Date.now() + offsetDays * 86400000);
  return d.toISOString().slice(0, 10);
};

const getRelativeDateTimeStr = (offsetDays: number, timeStr = '11:30'): string => {
  const d = new Date(Date.now() + offsetDays * 86400000);
  return `${d.toISOString().slice(0, 10)} ${timeStr}`;
};

export const initialStudents: Student[] = [
  {
    id: 'std-1',
    code: 'CHEM-2025-0841',
    name: 'أحمد طارق مصطفى',
    phone: '01012345678',
    parentWhatsapp: '01198765432',
    grade: 'الصف الثالث الثانوي (علمي)',
    course: 'مراجعة الكيمياء العضوية المكثفة 2025 (800 ج.م)',
    attendanceMode: 'المنصة أونلاين (بث مباشر ومسجل 24/7)',
    amountPaid: 800,
    paymentMethod: 'فودافون كاش / محفظة ذكية',
    confirmedBy: 'أك. محمود عزت',
    receiptUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80',
    createdAt: getRelativeDateTimeStr(-20, '11:30'),
    status: 'active',
    paymentType: 'full',
  },
  {
    id: 'std-2',
    code: 'CHEM-2025-0842',
    name: 'مريم محمد الشناوي',
    phone: '01234567890',
    parentWhatsapp: '01098765432',
    grade: 'الصف الثالث الثانوي (علمي)',
    course: 'كورس الكيمياء الكهربية والاتزان (650 ج.م)',
    attendanceMode: 'المنصة أونلاين (بث مباشر ومسجل 24/7)',
    amountPaid: 650,
    paymentMethod: 'إنستاباي (InstaPay)',
    confirmedBy: 'أك. محمود عزت',
    receiptUrl: 'https://images.unsplash.com/photo-1554224154-26032ffc0d07?auto=format&fit=crop&w=600&q=80',
    createdAt: getRelativeDateTimeStr(-18, '14:15'),
    status: 'active',
    paymentType: 'full',
  },
  {
    id: 'std-3',
    code: 'CHEM-2025-0843',
    name: 'يوسف حازم العشري',
    phone: '01512345678',
    parentWhatsapp: '01298765431',
    grade: 'الصف الثالث الثانوي (علمي)',
    course: 'كورس الكيمياء الكهربية والاتزان (650 ج.م)',
    attendanceMode: 'المنصة أونلاين (بث مباشر ومسجل 24/7)',
    amountPaid: 350,
    paymentMethod: 'فودافون كاش / محفظة ذكية',
    confirmedBy: 'أك. محمود عزت',
    receiptUrl: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=600&q=80',
    createdAt: getRelativeDateTimeStr(-26, '09:45'),
    status: 'active',
    paymentType: 'installment',
    totalCourseFee: 650,
    installmentStatus: 'pending_installment',
    remainingAmount: 300,
    installmentDueDate: getRelativeDateStr(4), // Due in 4 days (اقترب موعد الاستحقاق)
    installmentNotes: 'تم سداد قسط أول 350 ج.م - متبقي 300 ج.م مستحق قبل نهاية الشهر',
  },
  {
    id: 'std-4',
    code: 'CHEM-2025-0844',
    name: 'زياد محمود علام',
    phone: '01122334455',
    parentWhatsapp: '01011223344',
    grade: 'الصف الثالث الثانوي (علمي)',
    course: 'المعسكر الشامل للثانوية العامة 2025 (1200 ج.م)',
    attendanceMode: 'المنصة أونلاين (بث مباشر ومسجل 24/7)',
    amountPaid: 600,
    paymentMethod: 'إنستاباي (InstaPay)',
    confirmedBy: 'أك. محمود عزت',
    receiptUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80',
    createdAt: getRelativeDateTimeStr(-28, '16:20'),
    status: 'active',
    paymentType: 'installment',
    totalCourseFee: 1200,
    installmentStatus: 'pending_installment',
    remainingAmount: 600,
    installmentDueDate: getRelativeDateStr(2), // Due in 2 days (اقترب جداً)
    installmentNotes: 'قسط أول 600 ج.م، القسط الثاني مستحق مع بداية الجزء الثاني من المعسكر',
  },
  {
    id: 'std-5',
    code: 'CHEM-2025-0845',
    name: 'سلمى إبراهيم حسني',
    phone: '01055667788',
    parentWhatsapp: '01233445566',
    grade: 'الصف الثاني الثانوي',
    course: 'منهج الصف الثاني الثانوي - كيمياء الترم الثاني (500 ج.م)',
    attendanceMode: 'المنصة أونلاين (بث مباشر ومسجل 24/7)',
    amountPaid: 250,
    paymentMethod: 'فودافون كاش / محفظة ذكية',
    confirmedBy: 'أك. محمود عزت',
    receiptUrl: 'https://images.unsplash.com/photo-1554224154-26032ffc0d07?auto=format&fit=crop&w=600&q=80',
    createdAt: getRelativeDateTimeStr(-32, '12:00'),
    status: 'active',
    paymentType: 'installment',
    totalCourseFee: 500,
    installmentStatus: 'pending_installment',
    remainingAmount: 250,
    installmentDueDate: getRelativeDateStr(-2), // Overdue by 2 days (متأخر عن الموعد)
    installmentNotes: 'تم دفع القسط الأول، تذكير ولي الأمر باقتراب ميعاد القسط الثاني',
  },
  {
    id: 'std-6',
    code: 'CHEM-2025-0846',
    name: 'عمر خالد النجار',
    phone: '01099881122',
    parentWhatsapp: '01122998877',
    grade: 'الصف الثالث الثانوي (علمي)',
    course: 'مراجعة الكيمياء العضوية المكثفة 2025 (800 ج.م)',
    attendanceMode: 'المنصة أونلاين (بث مباشر ومسجل 24/7)',
    amountPaid: 400,
    paymentMethod: 'إنستاباي (InstaPay)',
    confirmedBy: 'أك. محمود عزت',
    receiptUrl: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=600&q=80',
    createdAt: getRelativeDateTimeStr(-5, '18:40'),
    status: 'active',
    paymentType: 'installment',
    totalCourseFee: 800,
    installmentStatus: 'pending_installment',
    remainingAmount: 400,
    installmentDueDate: getRelativeDateStr(25), // Due in 25 days (مستحق لاحقاً)
    installmentNotes: 'طالب مسجل حديثاً، القسط القادم بعد 25 يوماً',
  },
];

export const initialCourses: Course[] = [
  {
    id: 'c-1',
    name: 'مراجعة الكيمياء العضوية المكثفة 2025 (800 ج.م)',
    grade: 'الصف الثالث الثانوي (علمي)',
    price: 800,
    enrolledCount: 42,
    isActive: true,
    schedule: 'الأحد والأربعاء - الساعة 8:00 مساءً (بث مباشر + تسجيل فوري)',
  },
  {
    id: 'c-2',
    name: 'كورس الكيمياء الكهربية والاتزان (650 ج.م)',
    grade: 'الصف الثالث الثانوي (علمي)',
    price: 650,
    enrolledCount: 38,
    isActive: true,
    schedule: 'السبت والثلاثاء - الساعة 6:00 مساءً (بث مباشر + حل تدريبات)',
  },
  {
    id: 'c-3',
    name: 'المعسكر الشامل للثانوية العامة 2025 (1200 ج.م)',
    grade: 'الصف الثالث الثانوي (علمي)',
    price: 1200,
    enrolledCount: 29,
    isActive: true,
    schedule: 'الجمعة والاثنين - الساعة 5:00 مساءً (مراجعة شاملة وامتحانات دورية)',
  },
  {
    id: 'c-4',
    name: 'منهج الصف الثاني الثانوي - كيمياء الترم الثاني (500 ج.م)',
    grade: 'الصف الثاني الثانوي',
    price: 500,
    enrolledCount: 24,
    isActive: true,
    schedule: 'الإثنين والخميس - الساعة 6:30 مساءً (شرح تفاعلي ومتابعة)',
  },
  {
    id: 'c-5',
    name: 'منهج الصف الأول الثانوي - كيمياء الترم الثاني (450 ج.م)',
    grade: 'الصف الأول الثانوي',
    price: 450,
    enrolledCount: 19,
    isActive: true,
    schedule: 'السبت والثلاثاء - الساعة 4:30 عصراً (أساسيات الكيمياء وتدريبات)',
  },
];

export const initialExpenses: Expense[] = [
  {
    id: 'exp-1',
    title: 'تجديد باقة خوادم المنصة وسيرفرات البث الفيدوي المباشر',
    category: 'منصات وسيرفرات',
    amount: 450,
    date: '2025-03-01',
    paidBy: 'أك. محمود عزت',
    notes: 'استضافة سحابية عالية السرعة لمنع التقطيع أثناء الحصص المباشرة',
  },
  {
    id: 'exp-2',
    title: 'رسوم بوابة رسائل الواتساب الآلية (WhatsApp Business API)',
    category: 'منصات وسيرفرات',
    amount: 200,
    date: '2025-03-02',
    paidBy: 'أك. محمود عزت',
    notes: 'إرسال 500 رسالة إشعار فورية للأهالي وتوليد أكواد التفعيل',
  },
];

export const initialStaff: StaffMember[] = [
  {
    id: 'st-1',
    name: 'أك. محمود عزت',
    role: 'المدير الإداري والمالي',
    phone: '01009988776',
    baseSalary: 4500,
    bonus: 500,
    status: 'مدفوع',
    permissions: ['التحكم الكامل', 'البيانات المالية', 'تأكيد الإيصالات', 'إدارة الكورسات'],
  },
  {
    id: 'st-2',
    name: 'م. سارة أحمد الشريف',
    role: 'مشرفة المنصة والدعم الفني',
    phone: '01122334455',
    baseSalary: 3500,
    bonus: 250,
    status: 'معلق',
    permissions: ['تأكيد الإيصالات', 'متابعة الطلاب', 'إرسال الواتساب'],
  },
  {
    id: 'st-3',
    name: 'أ. عمر عبد الرحمن',
    role: 'مسؤول المتابعة وتصحيح الواجبات',
    phone: '01233445566',
    baseSalary: 3000,
    bonus: 200,
    status: 'معلق',
    permissions: ['متابعة الطلاب', 'رصد الدرجات'],
  },
];

export const initialWhatsAppTemplates: WhatsAppTemplate[] = [
  {
    id: 'tpl-1',
    title: 'رسالة تفعيل الاشتراك وإيصال الدفع الفوري',
    type: 'activation',
    message: `مرحباً ولي أمر الطالب {اسم_الطالب} 🌟
نحيطكم علماً بأنه تم تأكيد واستلام اشتراك الطالب في منظومة مستر أشرف السقا لمادة الكيمياء.

📌 تفاصيل الاشتراك:
• الكورس: {اسم_الكورس}
• كود التفعيل الخاص بالطالب: {كود_التفعيل}
• المبلغ المدفوع: {المبلغ} ج.م
• طريقة السداد: {طريقة_السداد}
• رابط دخول المنصة: https://el-saqqa-chem.online

لأي استفسار أو دعم فني يرجى التواصل معنا عبر هذا الرقم مباشرة.
نتمنى لأولادنا دوام التفوق والدرجات النهائية بإذن الله! 🧪✨`,
  },
  {
    id: 'tpl-2',
    title: 'تذكير موعد الحصة المباشرة والاختبار الأسبوعي',
    type: 'reminder',
    message: `تنبيه هام لطلاب مستر أشرف السقا ⚠️
نذكركم بموعد البث المباشر لشرح وحل أسئلة الكيمياء اليوم الساعة 8:00 مساءً.
يرجى تجهيز مذكرة الشرح وكراسة الملاحظات.`,
  },
  {
    id: 'tpl-3',
    title: 'إشعار نتيجة الاختبار الدوري لولي الأمر',
    type: 'exam',
    message: `تقرير متابعة الطالب {اسم_الطالب}:
تم رصد نتيجة اختبار الكيمياء الأخير بدرجة {الدرجة} / 50.
مستوى الطالب: ممتاز ومستمر في التقدم.`,
  },
];

export const initialAuditLogs: AuditLog[] = [
  {
    id: 'log-1',
    action: 'تسجيل اشتراك طالب جديد وتأكيد الدفع',
    user: 'أك. محمود عزت',
    timestamp: '2025-03-03 09:45:12',
    details: 'تم تفعيل كود CHEM-2025-0843 للطالب يوسف حازم العشري بمبلغ 650 ج.م',
    type: 'success',
  },
  {
    id: 'log-2',
    action: 'تحميل إيصال فودافون كاش ومطابقته',
    user: 'أك. محمود عزت',
    timestamp: '2025-03-02 14:16:04',
    details: 'تم توثيق إيصال تحويل رقم 01098765432 للطالبة مريم محمد الشناوي',
    type: 'info',
  },
  {
    id: 'log-3',
    action: 'تصدير نسخة احتياطية من قاعدة البيانات',
    user: 'أك. محمود عزت',
    timestamp: '2025-03-01 18:20:00',
    details: 'تم تصدير ملف JSON الشامل للمنظومة',
    type: 'info',
  },
];
