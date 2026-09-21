import React, { useState, useRef } from 'react';
import {
  UserPlus,
  Sparkles,
  User,
  GraduationCap,
  CreditCard,
  Monitor,
  Upload,
  CheckCircle2,
  Send,
  Image as ImageIcon,
  X,
  Eye,
  FileCheck,
  AlertCircle,
  Clock,
  Award,
  Wallet,
  Calendar,
  DollarSign,
} from 'lucide-react';
import { Course, Student } from '../../types';
import { WhatsAppReceiptModal } from '../modals/WhatsAppReceiptModal';

interface NewStudentScreenProps {
  courses: Course[];
  grades?: string[];
  onRegisterStudent: (newStudent: Omit<Student, 'id' | 'code' | 'createdAt' | 'status'>) => void;
  onQuickViewReceipt?: (url: string) => void;
  isWhatsConnected?: boolean;
  onNavigateToWhatsApp?: () => void;
}

export const NewStudentScreen: React.FC<NewStudentScreenProps> = ({
  courses,
  grades,
  onRegisterStudent,
  onQuickViewReceipt,
  isWhatsConnected = true,
  onNavigateToWhatsApp,
}) => {
  // Form States
  const [studentName, setStudentName] = useState('');
  const [studentPhone, setStudentPhone] = useState('');
  const [parentWhatsapp, setParentWhatsapp] = useState('');
  const [grade, setGrade] = useState(() => (grades && grades[0]) || 'الصف الثالث الثانوي (علمي)');
  const [isCustomGrade, setIsCustomGrade] = useState(false);
  const [customGradeInput, setCustomGradeInput] = useState('');
  const [showReceiptPreview, setShowReceiptPreview] = useState(false);

  const availableGrades = Array.from(
    new Set([
      ...(grades || []),
      'الصف الثالث الثانوي (علمي)',
      'الصف الثالث الثانوي (أدبي)',
      'الصف الثاني الثانوي',
      'الصف الأول الثانوي',
      ...courses.map((c) => c.grade).filter(Boolean),
    ])
  );

  const [selectedCourse, setSelectedCourse] = useState(
    courses[0]?.name || 'مراجعة الكيمياء العضوية المكثفة 2025 (800 ج.م)'
  );
  const [attendanceMode, setAttendanceMode] = useState(
    'المنصة أونلاين (بث مباشر ومسجل 24/7)'
  );
  const [amountPaid, setAmountPaid] = useState<number>(800);
  const [paymentType, setPaymentType] = useState<'full' | 'installment'>('full');
  const [totalCourseFee, setTotalCourseFee] = useState<number>(800);
  const [installmentStatus, setInstallmentStatus] = useState<'pending_installment' | 'paid_in_full'>('pending_installment');
  const [installmentDueDate, setInstallmentDueDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 15);
    return d.toISOString().slice(0, 10);
  });
  const [installmentNotes, setInstallmentNotes] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState(
    'فودافون كاش / محفظة ذكية'
  );
  const [confirmedBy, setConfirmedBy] = useState('أك. محمود عزت');
  const [receiptUrl, setReceiptUrl] = useState<string>('');
  const [receiptFileName, setReceiptFileName] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Live remaining calculation for installment
  const remainingInstallment = Math.max(0, totalCourseFee - amountPaid);

  // When course changes, automatically update amount and stage if appropriate
  const handleCourseChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const courseName = e.target.value;
    setSelectedCourse(courseName);
    const matched = courses.find((c) => c.name === courseName);
    if (matched) {
      setTotalCourseFee(matched.price);
      if (paymentType === 'full') {
        setAmountPaid(matched.price);
      } else {
        setAmountPaid(Math.round(matched.price / 2));
      }
      if (matched.grade) {
        setGrade(matched.grade);
        setIsCustomGrade(false);
      }
    }
  };

  // Toggle between Full Payment and Installment Plan
  const handlePaymentTypeChange = (type: 'full' | 'installment') => {
    setPaymentType(type);
    if (type === 'full') {
      setAmountPaid(totalCourseFee);
      setInstallmentStatus('paid_in_full');
    } else {
      setAmountPaid(Math.round(totalCourseFee / 2));
      setInstallmentStatus('pending_installment');
    }
  };

  // Quick autofill test student button ("ملء بيانات طالب تجريبي سريعاً")
  const handleAutofillTestData = (isInstallmentTest: boolean = false) => {
    setStudentName(isInstallmentTest ? 'يوسف إبراهيم خليل (قسط)' : 'أحمد طارق مصطفى');
    setStudentPhone(isInstallmentTest ? '01234567891' : '01012345678');
    setParentWhatsapp(isInstallmentTest ? '01099887766' : '01198765432');
    setGrade('الصف الثالث الثانوي (علمي)');
    setIsCustomGrade(false);
    setCustomGradeInput('');
    const defaultCourse = courses[0]?.name || 'مراجعة الكيمياء العضوية المكثفة 2025 (800 ج.م)';
    setSelectedCourse(defaultCourse);
    const matched = courses.find((c) => c.name === defaultCourse);
    const coursePrice = matched?.price || 800;
    setTotalCourseFee(coursePrice);

    if (isInstallmentTest) {
      setPaymentType('installment');
      setAmountPaid(coursePrice / 2);
      setInstallmentStatus('pending_installment');
      const d = new Date();
      d.setDate(d.getDate() + 20);
      setInstallmentDueDate(d.toISOString().slice(0, 10));
      setInstallmentNotes('قسط أول مسدد، وباقي المبلغ مستحق قبل بداية مراجعة الاتزان');
    } else {
      setPaymentType('full');
      setAmountPaid(coursePrice);
      setInstallmentStatus('paid_in_full');
      setInstallmentNotes('');
    }

    setAttendanceMode('المنصة أونلاين (بث مباشر ومسجل 24/7)');
    setPaymentMethod('فودافون كاش / محفظة ذكية');
    setConfirmedBy('أك. محمود عزت');
    setReceiptUrl('https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80');
    setReceiptFileName('vodafone_cash_receipt_chem.jpg');
    setFormError(null);
  };

  // Matched schedule and resolved grade for registration & live preview
  const matchedCourse = courses.find((c) => c.name === selectedCourse);
  const resolvedSchedule =
    matchedCourse?.schedule || 'الأحد والأربعاء - الساعة 8:00 مساءً (بث مباشر ومسجل)';
  const resolvedGrade =
    isCustomGrade && customGradeInput.trim() ? customGradeInput.trim() : grade;

  const previewStudent: Student = {
    id: 'preview-modal-std',
    code: 'CHEM-2025-8842',
    name: studentName.trim() || 'أحمد طارق مصطفى (نموذج معاينة)',
    phone: studentPhone.trim() || '01012345678',
    parentWhatsapp: parentWhatsapp.trim() || '01198765432',
    grade: resolvedGrade,
    course: selectedCourse,
    courseSchedule: resolvedSchedule,
    attendanceMode,
    amountPaid: Number(amountPaid) || 800,
    paymentMethod,
    confirmedBy,
    receiptUrl: receiptUrl || undefined,
    createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
    status: 'active',
    paymentType,
    totalCourseFee: paymentType === 'installment' ? Number(totalCourseFee) : Number(amountPaid),
    installmentStatus: paymentType === 'installment' ? installmentStatus : 'paid_in_full',
    remainingAmount: paymentType === 'installment' ? remainingInstallment : 0,
    installmentDueDate: paymentType === 'installment' ? installmentDueDate : undefined,
    installmentNotes: paymentType === 'installment' ? installmentNotes : undefined,
  };

  // Handle file input
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setReceiptFileName(file.name);
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setReceiptUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Trigger file selection
  const handleChooseFileClick = () => {
    fileInputRef.current?.click();
  };

  // Quick set sample receipt
  const handleUseSampleReceipt = () => {
    setReceiptUrl('https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80');
    setReceiptFileName('instapay_transfer_receipt_chem.png');
  };

  // Submit Handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!studentName.trim()) {
      setFormError('يرجى إدخال اسم الطالب ثلاثي أو رباعي');
      return;
    }
    if (!studentPhone.trim() || studentPhone.length < 10) {
      setFormError('يرجى إدخال رقم هاتف صحيح للطالب');
      return;
    }
    if (!parentWhatsapp.trim() || parentWhatsapp.length < 10) {
      setFormError('يرجى إدخال رقم واتساب صحيح لولي الأمر لاستلام الإيصال وكود التفعيل');
      return;
    }
    if (!amountPaid || amountPaid <= 0) {
      setFormError('يرجى إدخال المبلغ المدفوع بشكل صحيح');
      return;
    }

    setIsSubmitting(true);

    const matchedCourse = courses.find((c) => c.name === selectedCourse);
    const resolvedSchedule = matchedCourse?.schedule || 'الأحد والأربعاء - الساعة 8:00 مساءً (بث مباشر ومسجل)';

    // Call registration handler
    setTimeout(() => {
      onRegisterStudent({
        name: studentName.trim(),
        phone: studentPhone.trim(),
        parentWhatsapp: parentWhatsapp.trim(),
        grade: resolvedGrade,
        course: selectedCourse,
        courseSchedule: resolvedSchedule,
        attendanceMode,
        amountPaid: Number(amountPaid),
        paymentMethod,
        confirmedBy,
        receiptUrl: receiptUrl || undefined,
        paymentType,
        totalCourseFee: paymentType === 'installment' ? Number(totalCourseFee) : Number(amountPaid),
        installmentStatus: paymentType === 'installment' ? installmentStatus : 'paid_in_full',
        remainingAmount: paymentType === 'installment' ? remainingInstallment : 0,
        installmentDueDate: paymentType === 'installment' ? installmentDueDate : undefined,
        installmentNotes: paymentType === 'installment' ? installmentNotes : undefined,
      });
      setIsSubmitting(false);
    }, 300);
  };

  return (
    <div
      id="new-student-form-screen"
      className="bg-[#0b1320] border border-[#192b42] rounded-2xl p-4 md:p-7 shadow-2xl flex-1 flex flex-col transition-all"
    >
      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#16253b]">
        <div>
          <h2 className="text-lg md:text-xl font-extrabold text-white flex items-center gap-2.5">
            <UserPlus className="w-5 h-5 text-blue-400" />
            <span>تسجيل اشتراك طالب جديد (أونلاين 100%)</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1 font-medium">
            توليد كود التفعيل الفوري للطالب وإرسال الإيصال والجدول لولي الأمر عبر الواتساب تلقائياً
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setShowReceiptPreview(true)}
            className="flex items-center justify-center gap-2 bg-[#12233b] hover:bg-[#183252] text-blue-300 border border-blue-500/40 text-xs px-3.5 py-2 rounded-xl font-bold transition-all shadow-sm cursor-pointer"
            title="معاينة صورة الإيصال والمواعيد كما ستصل لولي الأمر ع الواتساب"
          >
            <Award className="w-4 h-4 text-blue-400" />
            <span>معاينة إيصال الواتساب الاحترافي</span>
          </button>

          {/* Quick autofill buttons */}
          <button
            id="autofill-cash-student-button"
            onClick={() => handleAutofillTestData(false)}
            type="button"
            className="flex items-center justify-center gap-1.5 bg-[#12233b] hover:bg-[#183252] text-blue-300 border border-blue-500/40 text-xs px-3 py-2 rounded-xl font-bold transition-all shadow-sm cursor-pointer"
            title="ملء طالب تجريبي مسدد كاش بالكامل"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>ملء طالب كاش</span>
          </button>

          <button
            id="autofill-installment-student-button"
            onClick={() => handleAutofillTestData(true)}
            type="button"
            className="flex items-center justify-center gap-1.5 bg-[#1d1b14] hover:bg-[#2c2819] text-amber-300 border border-amber-500/40 text-xs px-3 py-2 rounded-xl font-bold transition-all shadow-sm cursor-pointer"
            title="ملء طالب تجريبي مسجل بنظام التقسيط مع قسط متبقي"
          >
            <Wallet className="w-3.5 h-3.5 text-amber-400" />
            <span>ملء طالب قسط</span>
          </button>
        </div>
      </div>

      {formError && (
        <div className="mt-4 p-3 rounded-xl bg-red-950/50 border border-red-500/40 text-red-300 text-xs font-semibold flex items-center gap-2">
          <X className="w-4 h-4 shrink-0" />
          <span>{formError}</span>
        </div>
      )}

      {/* Main Registration Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-6 pt-5">
        {/* Section 1: Personal & Contact Details */}
        <div id="section-personal-info" className="flex flex-col gap-3">
          <div className="flex items-center gap-2 text-sm font-bold text-blue-400">
            <User className="w-4 h-4" />
            <span>البيانات الشخصية وبيانات الاتصال</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Student Name */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="student-name-input" className="text-xs text-slate-300 font-semibold">
                اسم الطالب ثلاثي / رباعي *
              </label>
              <input
                id="student-name-input"
                type="text"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="مثال: أحمد طارق مصطفى"
                required
                className="bg-[#070d17] border border-[#1c2e47] focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition-all"
              />
            </div>

            {/* Student Phone */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="student-phone-input" className="text-xs text-slate-300 font-semibold">
                رقم هاتف الطالب *
              </label>
              <input
                id="student-phone-input"
                type="tel"
                value={studentPhone}
                onChange={(e) => setStudentPhone(e.target.value)}
                placeholder="01012345678"
                required
                className="bg-[#070d17] border border-[#1c2e47] focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition-all font-mono"
              />
            </div>

            {/* Parent WhatsApp */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="parent-whatsapp-input" className="text-xs text-slate-300 font-semibold">
                واتساب ولي الأمر (لاستلام الإيصال) *
              </label>
              <input
                id="parent-whatsapp-input"
                type="tel"
                value={parentWhatsapp}
                onChange={(e) => setParentWhatsapp(e.target.value)}
                placeholder="01198765432"
                required
                className="bg-[#070d17] border border-[#1c2e47] focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition-all font-mono"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Academic Level & Course */}
        <div id="section-academic-info" className="flex flex-col gap-3">
          <div className="flex items-center gap-2 text-sm font-bold text-blue-400">
            <GraduationCap className="w-4 h-4" />
            <span>المستوى الأكاديمي والمقرر الدراسي (المنصة أونلاين)</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Grade */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="grade-select" className="text-xs text-slate-300 font-semibold">
                  المرحلة والصف الدراسي *
                </label>
                <button
                  type="button"
                  onClick={() => setIsCustomGrade(!isCustomGrade)}
                  className="text-[10px] text-blue-400 hover:text-blue-300 underline font-semibold cursor-pointer"
                >
                  {isCustomGrade ? 'اختيار من المراحل' : 'كتابة / تعديل مرحلة'}
                </button>
              </div>

              {isCustomGrade ? (
                <input
                  id="custom-grade-input"
                  type="text"
                  placeholder="اكتب المرحلة والصف الدراسي هنا..."
                  value={customGradeInput}
                  onChange={(e) => setCustomGradeInput(e.target.value)}
                  required
                  className="bg-[#070d17] border border-blue-500/60 focus:ring-1 focus:ring-blue-500 rounded-xl px-3.5 py-2.5 text-sm text-blue-200 outline-none transition-all"
                />
              ) : (
                <select
                  id="grade-select"
                  value={grade}
                  onChange={(e) => {
                    if (e.target.value === 'custom') {
                      setIsCustomGrade(true);
                    } else {
                      setGrade(e.target.value);
                    }
                  }}
                  className="bg-[#070d17] border border-[#1c2e47] focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl px-3.5 py-2.5 text-sm text-white outline-none transition-all cursor-pointer"
                >
                  {availableGrades.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                  <option value="custom">+ كتابة / تعديل مرحلة دراسية أخرى...</option>
                </select>
              )}
            </div>

            {/* Course */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="course-select" className="text-xs text-slate-300 font-semibold">
                الكورس المطلوب الاشتراك به *
              </label>
              <select
                id="course-select"
                value={selectedCourse}
                onChange={handleCourseChange}
                className="bg-[#070d17] border border-[#1c2e47] focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl px-3.5 py-2.5 text-sm text-white outline-none transition-all cursor-pointer"
              >
                {courses.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Attendance Mode */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="attendance-mode-display" className="text-xs text-slate-300 font-semibold">
                مقر المشاهدة والحضور
              </label>
              <div
                id="attendance-mode-display"
                className="bg-[#070d17] border border-[#1c2e47] rounded-xl px-3.5 py-2.5 text-sm text-blue-300 font-medium flex items-center gap-2"
              >
                <Monitor className="w-4 h-4 text-blue-400 shrink-0" />
                <span className="truncate">{attendanceMode}</span>
              </div>
            </div>
          </div>

          {/* Active Course Schedule Indicator */}
          {(() => {
            const curCourse = courses.find((c) => c.name === selectedCourse);
            const sched = curCourse?.schedule || 'الأحد والأربعاء - الساعة 8:00 مساءً (بث مباشر ومسجل عبر المنصة)';
            return (
              <div className="bg-[#141b2b] border border-amber-500/30 rounded-xl p-3 flex items-center gap-2.5 text-xs text-amber-300 mt-1">
                <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                <div>
                  <span className="font-bold text-amber-200">جدول ومواعيد الكورس المعتمدة: </span>
                  <span className="text-amber-300 font-medium">{sched}</span>
                  <span className="block text-[11px] text-slate-400 mt-0.5">
                    (سيتم إدراج هذه المواعيد تلقائياً في رسالة الواتساب وصورة الإيصال الرسمي لولي الأمر)
                  </span>
                </div>
              </div>
            );
          })()}
        </div>

        {/* Section 3: Financials & Payment Verification */}
        <div id="section-financial-info" className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm font-bold text-blue-400">
              <CreditCard className="w-4 h-4" />
              <span>البيانات المالية وخطة السداد</span>
            </div>

            {/* Payment Type Switcher */}
            <div className="flex items-center bg-[#070d17] p-1 rounded-xl border border-[#1c2e47] self-start sm:self-auto">
              <button
                type="button"
                onClick={() => handlePaymentTypeChange('full')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  paymentType === 'full'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                سداد كامل للمقرر
              </button>
              <button
                type="button"
                onClick={() => handlePaymentTypeChange('installment')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  paymentType === 'installment'
                    ? 'bg-amber-600 text-white shadow-md'
                    : 'text-amber-400/80 hover:text-amber-300'
                }`}
              >
                <Wallet className="w-3.5 h-3.5" />
                <span>سداد على أقساط</span>
              </button>
            </div>
          </div>

          {/* If Installment Plan is Active */}
          {paymentType === 'installment' && (
            <div className="bg-[#181307] border border-amber-500/40 rounded-2xl p-4 md:p-5 flex flex-col gap-4 shadow-xl animate-in fade-in duration-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-amber-500/20">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
                  <Wallet className="w-4 h-4 text-amber-400" />
                  <span>تفاصيل خطة التقسيط وحالة السداد</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-amber-300 bg-amber-500/20 px-2.5 py-0.5 rounded-full border border-amber-500/30">
                    نظام الأقساط مفعل
                  </span>
                  <span className="text-[11px] font-bold text-slate-300">
                    المتبقي: <span className="text-amber-400 font-mono" dir="ltr">{remainingInstallment.toLocaleString('en-US')} ج.م</span>
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                {/* Total Course Fee */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-slate-300 font-semibold">
                    إجمالي قيمة الكورس (ج.م) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="10"
                    value={totalCourseFee}
                    onChange={(e) => setTotalCourseFee(Number(e.target.value))}
                    required
                    className="bg-[#0b1320] border border-[#23354d] focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-sm text-white font-mono font-bold outline-none"
                  />
                </div>

                {/* Amount Paid Now (First Installment) */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-amber-300 font-semibold">
                    المبلغ المسدد حالياً (القسط الأول) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={totalCourseFee}
                    step="10"
                    value={amountPaid}
                    onChange={(e) => setAmountPaid(Number(e.target.value))}
                    required
                    className="bg-[#0b1320] border border-amber-500/60 focus:border-amber-400 rounded-xl px-3.5 py-2.5 text-sm text-emerald-300 font-mono font-bold outline-none"
                  />
                </div>

                {/* Remaining Amount (Live calculated) */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-slate-300 font-semibold">
                    المبلغ المتبقي من القسط
                  </label>
                  <div className="bg-[#0b1320] border border-amber-500/30 rounded-xl px-3.5 py-2.5 text-sm text-amber-400 font-mono font-bold flex items-center justify-between">
                    <span dir="ltr">{remainingInstallment.toLocaleString('en-US')} <span className="font-sans text-xs">ج.م</span></span>
                    <span className="text-[10px] text-slate-400 font-sans">
                      {remainingInstallment === 0 ? 'مسدد بالكامل ✓' : 'متبقي'}
                    </span>
                  </div>
                </div>

                {/* Due Date */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-slate-300 font-semibold flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>تاريخ استحقاق القسط القادم</span>
                  </label>
                  <input
                    type="date"
                    value={installmentDueDate}
                    onChange={(e) => setInstallmentDueDate(e.target.value)}
                    className="bg-[#0b1320] border border-[#23354d] focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none"
                  />
                </div>

                {/* Installment Status */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-slate-300 font-semibold">
                    حالة القسط المبدئية *
                  </label>
                  <select
                    value={installmentStatus}
                    onChange={(e) => setInstallmentStatus(e.target.value as any)}
                    className="bg-[#0b1320] border border-[#23354d] focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none cursor-pointer"
                  >
                    <option value="pending_installment">قسط متبقي (في انتظار السداد لاحقاً)</option>
                    <option value="paid_in_full">تم سداد القسط بالكامل الآن</option>
                  </select>
                </div>

                {/* Notes */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-slate-300 font-semibold">
                    ملاحظات القسط
                  </label>
                  <input
                    type="text"
                    placeholder="مثلاً: قسط أول، المتبقي مع بداية الشهر القادم"
                    value={installmentNotes}
                    onChange={(e) => setInstallmentNotes(e.target.value)}
                    className="bg-[#0b1320] border border-[#23354d] focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Standard Fields (if full payment: amount, and in all cases: payment method & confirmed by) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {paymentType === 'full' && (
              <div className="flex flex-col gap-1.5">
                <label htmlFor="amount-paid-input" className="text-xs text-slate-300 font-semibold">
                  المبلغ المدفوع بالكامل (ج.م) *
                </label>
                <input
                  id="amount-paid-input"
                  type="number"
                  min="0"
                  step="10"
                  value={amountPaid}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setAmountPaid(val);
                    setTotalCourseFee(val);
                  }}
                  required
                  className="bg-[#070d17] border border-[#1c2e47] focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition-all font-mono font-bold"
                />
              </div>
            )}

            {/* Payment Method */}
            <div className={`flex flex-col gap-1.5 ${paymentType === 'installment' ? 'md:col-span-2' : ''}`}>
              <label htmlFor="payment-method-select" className="text-xs text-slate-300 font-semibold">
                طريقة السداد والتحويل *
              </label>
              <select
                id="payment-method-select"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="bg-[#070d17] border border-[#1c2e47] focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl px-3.5 py-2.5 text-sm text-white outline-none transition-all cursor-pointer"
              >
                <option value="فودافون كاش / محفظة ذكية">فودافون كاش / محفظة ذكية</option>
                <option value="إنستاباي (InstaPay)">إنستاباي (InstaPay)</option>
                <option value="فوري (Fawry)">فوري (Fawry)</option>
                <option value="تحويل بنكي مباشر (CIB / الأهلي)">تحويل بنكي مباشر (CIB / الأهلي)</option>
                <option value="نقداً بالسنتر">نقداً بالسنتر</option>
              </select>
            </div>

            {/* Confirmed By */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="confirmed-by-input" className="text-xs text-slate-300 font-semibold">
                الموظف المسؤول عن التأكيد
              </label>
              <input
                id="confirmed-by-input"
                type="text"
                value={confirmedBy}
                onChange={(e) => setConfirmedBy(e.target.value)}
                className="bg-[#070d17] border border-[#1c2e47] focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition-all"
              />
            </div>
          </div>
        </div>

        {/* Receipt Upload Dropzone Box */}
        <div
          id="receipt-upload-box"
          className="border-2 border-dashed border-[#1c2e47] hover:border-blue-500/50 bg-[#080f1a]/80 rounded-2xl p-4 md:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 transition-all"
        >
          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />

          <div className="flex items-center gap-3.5 text-right w-full sm:w-auto">
            <div className="w-12 h-12 rounded-xl bg-[#111f33] border border-[#1d3354] flex items-center justify-center shrink-0">
              <ImageIcon className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <div className="text-sm font-bold text-slate-200">
                إرفاق صورة إيصال التحويل (إنستاباي أو فودافون كاش)
              </div>
              <div className="text-xs text-slate-400 mt-0.5">
                يتم تخزين الإيصال مشفراً وربطه بحساب الطالب ورسالة الواتساب
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            {receiptUrl ? (
              <div className="flex items-center gap-2 bg-[#122238] border border-blue-500/30 rounded-xl p-1.5 pr-3">
                <FileCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-xs text-blue-200 font-medium truncate max-w-[120px]">
                  {receiptFileName || 'تم إرفاق الإيصال'}
                </span>
                <button
                  type="button"
                  onClick={() => onQuickViewReceipt?.(receiptUrl)}
                  className="p-1 hover:bg-[#1b3152] rounded-md text-blue-300 transition-colors"
                  title="عرض الإيصال"
                >
                  <Eye className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setReceiptUrl('');
                    setReceiptFileName('');
                  }}
                  className="p-1 hover:bg-red-950/60 rounded-md text-red-400 transition-colors"
                  title="حذف الإيصال"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                id="choose-receipt-file-btn"
                type="button"
                onClick={handleChooseFileClick}
                className="bg-[#122033] hover:bg-[#1a2d48] border border-[#203656] text-white text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 font-bold cursor-pointer transition-all shadow-sm"
              >
                <Upload className="w-4 h-4 text-blue-400" />
                <span>اختر ملف الإيصال</span>
              </button>
            )}

            {!receiptUrl && (
              <button
                type="button"
                onClick={handleUseSampleReceipt}
                className="text-[11px] text-slate-400 hover:text-amber-300 underline font-medium px-2 py-1 transition-colors"
                title="استخدام صورة إيصال تجريبية"
              >
                إيصال تجريبي
              </button>
            )}
          </div>
        </div>

        {/* Bottom Action Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[#16253b] mt-2">
          {/* Info pill with WhatsApp status */}
          <div className="flex items-center gap-2 text-xs font-semibold order-2 sm:order-1 text-center sm:text-right">
            {isWhatsConnected ? (
              <span className="flex items-center gap-1.5 text-emerald-400 bg-emerald-950/60 px-3 py-1.5 rounded-lg border border-emerald-500/30">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>بوابة الواتساب متصلة: سيتم إرسال إيصال الدفع + كود التفعيل لولي الأمر تلقائياً فوراً</span>
              </span>
            ) : (
              <button
                type="button"
                onClick={onNavigateToWhatsApp}
                className="flex items-center gap-1.5 text-amber-300 bg-amber-950/60 hover:bg-amber-950/90 px-3 py-1.5 rounded-lg border border-amber-500/30 cursor-pointer transition-colors"
              >
                <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
                <span>تنبيه: الواتساب غير متصل حالياً (انقر هنا لربط وتفعيل الواتساب)</span>
              </button>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto order-1 sm:order-2">
            <button
              type="button"
              onClick={() => setShowReceiptPreview(true)}
              className="flex-1 sm:flex-none bg-[#12233b] hover:bg-[#193355] border border-blue-500/40 text-blue-300 font-bold text-xs px-4 py-3.5 rounded-xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
              title="معاينة شكل الإيصال والمواعيد كما سيستلمه ولي الأمر ع الواتساب"
            >
              <Award className="w-4 h-4 text-blue-400" />
              <span>معاينة إيصال الواتساب</span>
            </button>

            {/* Submit Action Button */}
            <button
              id="submit-student-registration-btn"
              type="submit"
              disabled={isSubmitting}
              className="flex-1 sm:flex-none bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-sm px-6 py-3.5 rounded-xl shadow-xl shadow-blue-600/30 flex items-center justify-center gap-2.5 transition-all cursor-pointer disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>
                {isSubmitting
                  ? 'جاري تفعيل الحساب وتوليد الإيصال...'
                  : 'تأكيد الاشتراك وتفعيل الحساب'}
              </span>
            </button>
          </div>
        </div>
      </form>

      {/* WhatsApp Receipt Preview Modal */}
      {showReceiptPreview && (
        <WhatsAppReceiptModal
          student={previewStudent}
          courses={courses}
          onClose={() => setShowReceiptPreview(false)}
        />
      )}
    </div>
  );
};
