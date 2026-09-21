import React, { useState } from 'react';
import {
  Users,
  Search,
  Filter,
  MessageCircle,
  Eye,
  Trash2,
  CheckCircle2,
  Clock,
  Phone,
  BookOpen,
  UserCheck,
  FileSpreadsheet,
  Wallet,
  Calendar,
  AlertTriangle,
  ArrowDownLeft,
  Edit3,
  GraduationCap,
  X,
  Save,
  Bell,
  AlertCircle,
  FileText,
  Printer,
  Download,
  Loader2,
} from 'lucide-react';
import { Student, Course } from '../../types';
import { InstallmentSettleModal } from '../modals/InstallmentSettleModal';
import { getStudentInstallmentInfo, getDueInstallments } from '../../utils/installmentUtils';
import { downloadReceiptPdf, printReceiptPdf } from '../../utils/receiptPdf';

interface StudentsListScreenProps {
  students: Student[];
  courses?: Course[];
  grades?: string[];
  initialPaymentFilter?: 'all' | 'full' | 'pending_installment' | 'paid_in_full' | 'due_soon';
  onDeleteStudent: (id: string) => void;
  onUpdateStudent: (id: string, updatedData: Partial<Student>) => void;
  onViewReceipt: (url: string) => void;
  onOpenWhatsAppModal: (student: Student) => void;
  onExportExcel: () => void;
  onUpdateGradeName?: (oldGrade: string, newGrade: string) => void;
  onDeleteGrade?: (gradeToDelete: string) => void;
}

export const StudentsListScreen: React.FC<StudentsListScreenProps> = ({
  students,
  courses = [],
  grades = [],
  initialPaymentFilter = 'all',
  onDeleteStudent,
  onUpdateStudent,
  onViewReceipt,
  onOpenWhatsAppModal,
  onExportExcel,
  onUpdateGradeName,
  onDeleteGrade,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState<'all' | 'full' | 'pending_installment' | 'paid_in_full' | 'due_soon'>(
    initialPaymentFilter
  );
  const [settleStudent, setSettleStudent] = useState<Student | null>(null);

  // Grade Edit & Delete states inside StudentsListScreen
  const [editingGradeModal, setEditingGradeModal] = useState<string | null>(null);
  const [editingGradeNewName, setEditingGradeNewName] = useState('');
  const [gradeToDeleteModal, setGradeToDeleteModal] = useState<string | null>(null);

  // Sync with initialPaymentFilter prop if it changes
  React.useEffect(() => {
    if (initialPaymentFilter) {
      setPaymentFilter(initialPaymentFilter);
    }
  }, [initialPaymentFilter]);

  // Edit Student Grade & Course State
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [editStudentGrade, setEditStudentGrade] = useState('');
  const [editStudentCourse, setEditStudentCourse] = useState('');
  const [editStudentName, setEditStudentName] = useState('');
  const [editStudentPhone, setEditStudentPhone] = useState('');
  const [editParentWhatsapp, setEditParentWhatsapp] = useState('');
  const [generatingPdfId, setGeneratingPdfId] = useState<string | null>(null);

  const handleDownloadStudentPdf = async (student: Student) => {
    try {
      setGeneratingPdfId(student.id);
      await downloadReceiptPdf(student, student.courseSchedule);
    } catch (e) {
      console.error(e);
      alert('حدث خطأ أثناء إنشاء وتنزيل ملف PDF');
    } finally {
      setGeneratingPdfId(null);
    }
  };

  const handlePrintStudentPdf = async (student: Student) => {
    try {
      setGeneratingPdfId(student.id);
      await printReceiptPdf(student, student.courseSchedule);
    } catch (e) {
      console.error(e);
      alert('حدث خطأ أثناء فتح طباعة إيصال PDF');
    } finally {
      setGeneratingPdfId(null);
    }
  };

  // Collect all unique grades for filtering
  const allFilterGrades = Array.from(
    new Set([
      ...grades,
      ...students.map((s) => s.grade).filter(Boolean),
      ...courses.map((c) => c.grade).filter(Boolean),
    ])
  );

  const handleOpenEditStudent = (student: Student) => {
    setEditingStudent(student);
    setEditStudentGrade(student.grade);
    setEditStudentCourse(student.course);
    setEditStudentName(student.name);
    setEditStudentPhone(student.phone);
    setEditParentWhatsapp(student.parentWhatsapp);
  };

  const handleSaveStudentEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;

    onUpdateStudent(editingStudent.id, {
      name: editStudentName.trim(),
      grade: editStudentGrade.trim(),
      course: editStudentCourse.trim(),
      phone: editStudentPhone.trim(),
      parentWhatsapp: editParentWhatsapp.trim(),
    });

    setEditingStudent(null);
  };

  // Installment count metrics
  const pendingInstallmentsCount = students.filter(
    (s) => s.paymentType === 'installment' && s.installmentStatus === 'pending_installment'
  ).length;

  const paidInstallmentsCount = students.filter(
    (s) => s.paymentType === 'installment' && s.installmentStatus === 'paid_in_full'
  ).length;

  const dueInstallmentsList = getDueInstallments(students);
  const dueSoonCount = dueInstallmentsList.length;

  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.name.includes(searchTerm) ||
      s.phone.includes(searchTerm) ||
      s.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.parentWhatsapp.includes(searchTerm);
    const matchesGrade = selectedGrade === 'all' || s.grade.includes(selectedGrade);
    
    let matchesPayment = true;
    if (paymentFilter === 'full') {
      matchesPayment = s.paymentType === 'full' || !s.paymentType;
    } else if (paymentFilter === 'pending_installment') {
      matchesPayment = s.paymentType === 'installment' && s.installmentStatus === 'pending_installment';
    } else if (paymentFilter === 'paid_in_full') {
      matchesPayment = s.paymentType === 'installment' && s.installmentStatus === 'paid_in_full';
    } else if (paymentFilter === 'due_soon') {
      const info = getStudentInstallmentInfo(s);
      matchesPayment = info.isApproachingOrOverdue;
    }

    return matchesSearch && matchesGrade && matchesPayment;
  });

  // Handle settlement from modal
  const handleSettleInstallment = (
    studentId: string,
    settlementData: {
      newAmountPaid: number;
      newRemaining: number;
      newStatus: 'paid_in_full' | 'pending_installment';
      settlementMethod: string;
      notes?: string;
      sendWhatsAppNotice: boolean;
    }
  ) => {
    const target = students.find((s) => s.id === studentId);
    if (!target) return;

    const updatedData: Partial<Student> = {
      amountPaid: settlementData.newAmountPaid,
      remainingAmount: settlementData.newRemaining,
      installmentStatus: settlementData.newStatus,
      paymentMethod: settlementData.settlementMethod || target.paymentMethod,
      installmentNotes: settlementData.notes?.trim() || target.installmentNotes,
    };

    onUpdateStudent(studentId, updatedData);
    setSettleStudent(null);

    // If requested, open WhatsApp modal for the updated student
    if (settlementData.sendWhatsAppNotice) {
      const updatedStudent: Student = {
        ...target,
        ...updatedData,
      };
      setTimeout(() => {
        onOpenWhatsAppModal(updatedStudent);
      }, 250);
    }
  };

  // Quick 1-click toggle directly from row
  const handleQuickMarkAsPaid = (student: Student) => {
    const total = student.totalCourseFee || student.amountPaid;
    onUpdateStudent(student.id, {
      amountPaid: total,
      remainingAmount: 0,
      installmentStatus: 'paid_in_full',
      installmentNotes: 'تم سداد القسط بالكامل وتصفية الحساب بنجاح',
    });
  };

  return (
    <div
      id="students-list-screen"
      className="bg-[#0b1320] border border-[#192b42] rounded-2xl p-4 md:p-7 shadow-2xl flex-1 flex flex-col transition-all"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#16253b]">
        <div>
          <h2 className="text-lg md:text-xl font-extrabold text-white flex items-center gap-2.5">
            <Users className="w-5 h-5 text-blue-400" />
            <span>سجل ومدفوعات الطلاب والأقساط</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1 font-medium">
            متابعة المشتركين، تحصيل الأقساط، توثيق الإيصالات، وتفعيل الحسابات والتواصل مع أولياء الأمور
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onExportExcel}
            type="button"
            className="flex items-center gap-2 bg-[#132238] hover:bg-[#1b2f4d] border border-blue-500/30 text-blue-300 text-xs px-3.5 py-2 rounded-xl font-bold transition-all cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>تصدير Excel</span>
          </button>
        </div>
      </div>

      {/* Payment Filter Pills / Tabs */}
      <div className="flex flex-wrap items-center gap-2 pt-4">
        <button
          type="button"
          onClick={() => setPaymentFilter('all')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            paymentFilter === 'all'
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-[#0e1929] text-slate-400 hover:text-slate-200 border border-[#1c2e47]'
          }`}
        >
          <span>جميع الطلاب ({students.length})</span>
        </button>

        {/* Installment Due Alert Filter Tab */}
        <button
          type="button"
          id="filter-due-soon-btn"
          onClick={() => setPaymentFilter('due_soon')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            paymentFilter === 'due_soon'
              ? 'bg-gradient-to-r from-rose-600 to-amber-600 text-white shadow-lg shadow-rose-900/30 border border-rose-400/40'
              : 'bg-[#160d16] text-rose-300 border border-rose-500/35 hover:border-rose-400/50 hover:bg-[#221322]'
          }`}
        >
          <div className="w-4 h-4 rounded-full bg-rose-500/20 flex items-center justify-center text-rose-400">
            <Bell className="w-2.5 h-2.5" />
          </div>
          <span>تنبيهات استحقاق الأقساط</span>
          {dueSoonCount > 0 && (
            <span className="bg-rose-500 text-white text-[10px] font-mono px-2 py-0.5 rounded-full font-bold">
              {dueSoonCount} مستحق
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setPaymentFilter('pending_installment')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            paymentFilter === 'pending_installment'
              ? 'bg-amber-600 text-white shadow-md'
              : 'bg-[#181307] text-amber-300 border border-amber-500/40 hover:bg-[#241c0a]'
          }`}
        >
          <Wallet className="w-3.5 h-3.5" />
          <span>كل الأقساط المعلقة</span>
          {pendingInstallmentsCount > 0 && (
            <span className="bg-amber-400 text-black text-[10px] px-1.5 py-0.2 rounded-full font-black">
              {pendingInstallmentsCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setPaymentFilter('paid_in_full')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            paymentFilter === 'paid_in_full'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'bg-[#091a14] text-emerald-300 border border-emerald-500/40 hover:bg-[#0d261e]'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>أقساط تم سدادها ({paidInstallmentsCount})</span>
        </button>

        <button
          type="button"
          onClick={() => setPaymentFilter('full')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            paymentFilter === 'full'
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-[#0e1929] text-slate-400 hover:text-slate-200 border border-[#1c2e47]'
          }`}
        >
          <span>سداد كامل بدون تقسيط</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-4">
        {/* Search */}
        <div className="relative sm:col-span-2">
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5" />
          <input
            type="text"
            placeholder="بحث بالاسم، رقم الطالب، رقم ولي الأمر، أو كود التفعيل..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#070d17] border border-[#1c2e47] focus:border-blue-500 rounded-xl pr-10 pl-4 py-2.5 text-xs text-white placeholder-slate-500 outline-none transition-all"
          />
        </div>

        {/* Grade Filter with Direct Edit & Delete Buttons */}
        <div className="flex flex-col gap-1.5">
          <div className="relative">
            <Filter className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5" />
            <select
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              className="w-full bg-[#070d17] border border-[#1c2e47] focus:border-blue-500 rounded-xl pr-10 pl-4 py-2.5 text-xs text-white outline-none transition-all cursor-pointer"
            >
              <option value="all">جميع الصفوف والمراحل الدراسية ({students.length} طالب)</option>
              {allFilterGrades.map((g) => {
                const count = students.filter((s) => s.grade === g).length;
                return (
                  <option key={g} value={g}>
                    {g} ({count} طالب)
                  </option>
                );
              })}
            </select>
          </div>

          {/* Quick Buttons to Edit / Delete Selected Grade */}
          {selectedGrade !== 'all' && (
            <div className="flex items-center justify-between gap-1.5 px-1 py-1 bg-[#09111c] border border-blue-500/20 rounded-lg">
              <span className="text-[11px] text-blue-300 font-bold truncate max-w-[120px]">
                {selectedGrade}
              </span>
              <div className="flex items-center gap-1">
                {onUpdateGradeName && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingGradeModal(selectedGrade);
                      setEditingGradeNewName(selectedGrade);
                    }}
                    title={`تعديل اسم مرحلة (${selectedGrade}) في جميع الكورسات والطلاب`}
                    className="bg-[#12233b] hover:bg-[#193252] border border-blue-500/40 text-blue-300 text-[10px] px-2 py-1 rounded-md font-bold flex items-center gap-1 transition-all cursor-pointer"
                  >
                    <Edit3 className="w-3 h-3 text-blue-400" />
                    <span>تعديل المرحلة</span>
                  </button>
                )}

                {onDeleteGrade && (
                  <button
                    type="button"
                    onClick={() => setGradeToDeleteModal(selectedGrade)}
                    title={`حذف مرحلة (${selectedGrade})`}
                    className="bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/40 text-rose-300 text-[10px] px-2 py-1 rounded-md font-bold flex items-center gap-1 transition-all cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3 text-rose-400" />
                    <span>حذف المرحلة</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-[#17273f] bg-[#070d17]">
        <table className="w-full text-right text-xs">
          <thead className="bg-[#0f1b2c] text-slate-300 font-bold border-b border-[#1c2e47]">
            <tr>
              <th className="p-3.5">كود الطالب</th>
              <th className="p-3.5">اسم الطالب</th>
              <th className="p-3.5">الكورس والمرحلة</th>
              <th className="p-3.5">الهاتف وولي الأمر</th>
              <th className="p-3.5">المبلغ وحالة القسط</th>
              <th className="p-3.5">الإيصال</th>
              <th className="p-3.5">الحالة</th>
              <th className="p-3.5 text-center">إجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#132238] text-slate-200">
            {filteredStudents.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-8 text-slate-400 font-medium">
                  لا توجد نتائج مطابقة لبحثك في هذا الفلتر
                </td>
              </tr>
            ) : (
              filteredStudents.map((s) => {
                const isInstallment = s.paymentType === 'installment';
                const hasPending = isInstallment && s.installmentStatus === 'pending_installment';
                const isPaidInstallment = isInstallment && s.installmentStatus === 'paid_in_full';
                const instInfo = hasPending ? getStudentInstallmentInfo(s) : null;

                return (
                  <tr
                    key={s.id}
                    className={`transition-colors border-b border-[#142236] ${
                      instInfo?.isApproachingOrOverdue
                        ? instInfo.status === 'overdue'
                          ? 'bg-rose-950/20 hover:bg-rose-950/30'
                          : 'bg-amber-950/20 hover:bg-amber-950/30'
                        : 'hover:bg-[#0d1726]'
                    }`}
                  >
                    {/* Code */}
                    <td className="p-3.5 font-mono font-bold text-blue-400">
                      {s.code}
                    </td>

                    {/* Name */}
                    <td className="p-3.5">
                      <div className="font-bold text-white text-sm flex items-center gap-1.5">
                        <span>{s.name}</span>
                        {isInstallment && (
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                            hasPending
                              ? instInfo?.isApproachingOrOverdue
                                ? instInfo.status === 'overdue'
                                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse'
                                  : 'bg-amber-500/25 text-amber-300 border border-amber-500/50'
                                : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          }`}>
                            {hasPending
                              ? instInfo?.isApproachingOrOverdue
                                ? `⚠️ ${instInfo.badgeText}`
                                : 'قسط'
                              : 'قسط مسدد ✓'}
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        تسجيل: {s.createdAt}
                      </div>
                    </td>

                    {/* Course & Grade */}
                    <td className="p-3.5 max-w-[200px]">
                      <div className="font-semibold text-slate-200 truncate">{s.course}</div>
                      <div className="text-[10px] text-blue-300 mt-0.5">{s.grade}</div>
                    </td>

                    {/* Contact */}
                    <td className="p-3.5 font-mono">
                      <div className="text-slate-300 flex items-center gap-1">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span>{s.phone}</span>
                      </div>
                      <div className="text-emerald-400 text-[11px] flex items-center gap-1 mt-0.5">
                        <MessageCircle className="w-3 h-3" />
                        <span>{s.parentWhatsapp}</span>
                      </div>
                    </td>

                    {/* Payment & Installment Status */}
                    <td className="p-3.5">
                      {/* Financial Amount & Progress */}
                      <div className="flex flex-col gap-1">
                        <div className="flex items-baseline gap-1.5 font-mono">
                          <span className="font-extrabold text-white text-sm">
                            {s.amountPaid.toLocaleString('ar-EG')} ج.م
                          </span>
                          {isInstallment && s.totalCourseFee && (
                            <span className="text-[10px] text-slate-400">
                              / {s.totalCourseFee.toLocaleString('ar-EG')} ج.م
                            </span>
                          )}
                        </div>

                        {/* Visual Payment Progress Bar for Installments */}
                        {isInstallment && s.totalCourseFee && (
                          <div className="w-full max-w-[140px] h-1.5 bg-slate-800/80 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${
                                isPaidInstallment ? 'bg-emerald-400' : 'bg-amber-400'
                              }`}
                              style={{
                                width: `${Math.min(100, Math.round((s.amountPaid / s.totalCourseFee) * 100))}%`,
                              }}
                            />
                          </div>
                        )}

                        <div className="text-[10px] text-slate-400 flex items-center gap-1.5">
                          <span>{s.paymentMethod}</span>
                          {isInstallment && (
                            <span className="text-slate-500">• تقسيط</span>
                          )}
                        </div>
                      </div>

                      {/* Active Pending Installment Alert & Actions */}
                      {hasPending && instInfo && (
                        <div className="mt-2 flex flex-col gap-1.5">
                          {/* Unified Status Pill */}
                          <div
                            className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg border text-[10px] font-bold self-start ${
                              instInfo.status === 'overdue'
                                ? 'bg-rose-950/50 border-rose-500/40 text-rose-300'
                                : instInfo.status === 'due_today'
                                ? 'bg-amber-950/60 border-amber-500/50 text-amber-300'
                                : 'bg-[#131f30] border-[#22354e] text-amber-200'
                            }`}
                            title={`تاريخ الاستحقاق: ${instInfo.dueDateStr}`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                instInfo.status === 'overdue'
                                  ? 'bg-rose-500 animate-pulse'
                                  : instInfo.status === 'due_today'
                                  ? 'bg-amber-400'
                                  : 'bg-amber-500'
                              }`}
                            />
                            <span>{instInfo.badgeText}</span>
                            <span className="font-mono text-amber-400 font-extrabold">
                              (باقي: {instInfo.remainingAmount.toLocaleString('ar-EG')} ج.م)
                            </span>
                          </div>

                          {/* Quick Actions Bar */}
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <button
                              type="button"
                              onClick={() => setSettleStudent(s)}
                              className="text-[10px] font-bold bg-[#1a2b42] hover:bg-[#223755] text-amber-300 border border-amber-500/30 rounded-lg px-2.5 py-1 transition-all flex items-center gap-1 cursor-pointer shadow-sm"
                              title="تسجيل سداد القسط أو تحصيل دفعة مع إشعار ولي الأمر"
                            >
                              <Wallet className="w-3 h-3 text-amber-400" />
                              <span>تحصيل القسط</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleQuickMarkAsPaid(s)}
                              className="text-[10px] font-bold bg-emerald-950/50 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-600/30 rounded-lg px-2 py-1 transition-all flex items-center gap-1 cursor-pointer"
                              title="تصفية الحساب وتحويل إلى تم دفع القسط بالكامل"
                            >
                              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                              <span>تصفية كاملة</span>
                            </button>
                          </div>
                        </div>
                      )}

                      {isPaidInstallment && (
                        <div className="mt-1.5">
                          <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-emerald-300 bg-emerald-500/10 border border-emerald-500/25 px-2 py-0.5 rounded-lg">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            <span>تم سداد كامل الأقساط ✓</span>
                          </span>
                        </div>
                      )}

                      {!isInstallment && (
                        <div className="mt-1">
                          <span className="text-[10px] font-medium text-blue-300 bg-blue-950/40 border border-blue-800/30 px-2 py-0.5 rounded-md inline-block">
                            سداد كامل
                          </span>
                        </div>
                      )}
                    </td>

                    {/* Receipt */}
                    <td className="p-3.5">
                      <div className="flex items-center gap-1.5 justify-center">
                        <button
                          onClick={() => handleDownloadStudentPdf(s)}
                          disabled={generatingPdfId === s.id}
                          type="button"
                          className="bg-red-950/60 hover:bg-red-900/70 border border-red-500/50 text-red-300 text-[11px] px-2.5 py-1 rounded-lg flex items-center gap-1 font-bold transition-all cursor-pointer disabled:opacity-60 shadow-sm"
                          title="تحميل إيصال دفع رسمي A4 بصيغة PDF"
                        >
                          {generatingPdfId === s.id ? (
                            <Loader2 className="w-3 h-3 animate-spin text-red-400" />
                          ) : (
                            <FileText className="w-3 h-3 text-red-400" />
                          )}
                          <span>PDF</span>
                        </button>

                        <button
                          onClick={() => handlePrintStudentPdf(s)}
                          disabled={generatingPdfId === s.id}
                          type="button"
                          className="bg-[#132238] hover:bg-[#1a2d48] border border-blue-500/40 text-blue-300 p-1 rounded-lg transition-all cursor-pointer disabled:opacity-60"
                          title="طباعة إيصال الدفع PDF"
                        >
                          <Printer className="w-3 h-3 text-blue-400" />
                        </button>

                        {s.receiptUrl && (
                          <button
                            onClick={() => onViewReceipt(s.receiptUrl!)}
                            type="button"
                            className="bg-[#0f1d30] hover:bg-[#172b44] border border-slate-700 text-slate-300 p-1 rounded-lg transition-all cursor-pointer"
                            title="معاينة صورة الإيصال"
                          >
                            <Eye className="w-3 h-3 text-slate-400" />
                          </button>
                        )}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="p-3.5">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                        <span>مفعل أونلاين</span>
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="p-3.5">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => onOpenWhatsAppModal(s)}
                          title="إرسال إشعار وإيصال واتساب"
                          type="button"
                          className="p-1.5 bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-700/50 text-emerald-400 rounded-lg transition-colors cursor-pointer"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDownloadStudentPdf(s)}
                          disabled={generatingPdfId === s.id}
                          title="توليد وتحميل إيصال دفع PDF"
                          type="button"
                          className="p-1.5 bg-red-950/60 hover:bg-red-900/60 border border-red-700/50 text-red-400 rounded-lg transition-colors cursor-pointer disabled:opacity-60"
                        >
                          {generatingPdfId === s.id ? (
                            <Loader2 className="w-4 h-4 animate-spin text-red-400" />
                          ) : (
                            <FileText className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => handleOpenEditStudent(s)}
                          title="تعديل المرحلة والصف الدراسي والكورس"
                          type="button"
                          className="p-1.5 bg-blue-950/60 hover:bg-blue-900/60 border border-blue-700/50 text-blue-400 rounded-lg transition-colors cursor-pointer"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDeleteStudent(s.id)}
                          title="حذف الطالب"
                          type="button"
                          className="p-1.5 bg-red-950/40 hover:bg-red-900/50 border border-red-800/40 text-red-400 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Settle Installment Modal */}
      {settleStudent && (
        <InstallmentSettleModal
          student={settleStudent}
          onClose={() => setSettleStudent(null)}
          onSettle={handleSettleInstallment}
        />
      )}

      {/* Edit Student Stage, Grade & Course Modal */}
      {editingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#0b1320] border border-blue-500/40 rounded-2xl max-w-lg w-full p-5 shadow-2xl flex flex-col gap-4 text-right">
            <div className="flex items-center justify-between pb-3 border-b border-[#16253b]">
              <button
                onClick={() => setEditingStudent(null)}
                className="p-1.5 hover:bg-[#152336] text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-blue-400" />
                <h3 className="font-extrabold text-white text-base">
                  تعديل المرحلة والصف الدراسي وبيانات الطالب
                </h3>
              </div>
            </div>

            <form onSubmit={handleSaveStudentEdit} className="flex flex-col gap-3.5">
              {/* Student Name */}
              <div className="flex flex-col gap-1">
                <label className="text-xs text-slate-300 font-bold">اسم الطالب *</label>
                <input
                  type="text"
                  required
                  value={editStudentName}
                  onChange={(e) => setEditStudentName(e.target.value)}
                  className="bg-[#070d17] border border-[#1b2f48] focus:border-blue-500 rounded-xl px-3.5 py-2 text-xs text-white outline-none"
                />
              </div>

              {/* Educational Stage / Grade */}
              <div className="flex flex-col gap-1">
                <label className="text-xs text-blue-300 font-bold flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4 text-blue-400" />
                  <span>المرحلة والصف الدراسي *</span>
                </label>
                <input
                  type="text"
                  list="grades-datalist"
                  required
                  value={editStudentGrade}
                  onChange={(e) => setEditStudentGrade(e.target.value)}
                  placeholder="اختر أو اكتب المرحلة والصف الدراسي..."
                  className="bg-[#070d17] border border-blue-500/50 focus:border-blue-400 rounded-xl px-3.5 py-2 text-xs text-white outline-none"
                />
                <datalist id="grades-datalist">
                  {allFilterGrades.map((g) => (
                    <option key={g} value={g} />
                  ))}
                </datalist>
              </div>

              {/* Course */}
              <div className="flex flex-col gap-1">
                <label className="text-xs text-slate-300 font-bold flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-amber-400" />
                  <span>الكورس أو المقرر المسجل به *</span>
                </label>
                <input
                  type="text"
                  list="courses-datalist"
                  required
                  value={editStudentCourse}
                  onChange={(e) => setEditStudentCourse(e.target.value)}
                  placeholder="اختر أو اكتب اسم الكورس..."
                  className="bg-[#070d17] border border-[#1b2f48] focus:border-blue-500 rounded-xl px-3.5 py-2 text-xs text-white outline-none"
                />
                <datalist id="courses-datalist">
                  {courses.map((c) => (
                    <option key={c.id} value={c.name} />
                  ))}
                </datalist>
              </div>

              {/* Phone numbers */}
              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-slate-300 font-bold">هاتف الطالب</label>
                  <input
                    type="text"
                    value={editStudentPhone}
                    onChange={(e) => setEditStudentPhone(e.target.value)}
                    className="bg-[#070d17] border border-[#1b2f48] focus:border-blue-500 rounded-xl px-3 py-2 text-xs text-white outline-none font-mono"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-slate-300 font-bold">واتساب ولي الأمر</label>
                  <input
                    type="text"
                    value={editParentWhatsapp}
                    onChange={(e) => setEditParentWhatsapp(e.target.value)}
                    className="bg-[#070d17] border border-[#1b2f48] focus:border-blue-500 rounded-xl px-3 py-2 text-xs text-white outline-none font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#16253b]">
                <button
                  type="button"
                  onClick={() => setEditingStudent(null)}
                  className="bg-[#152336] hover:bg-[#1a2d48] text-slate-300 text-xs px-4 py-2 rounded-xl transition-colors cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-500 text-white text-xs px-5 py-2 rounded-xl font-bold transition-all shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>حفظ التعديلات</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================= MODAL: EDIT GRADE NAME (DIRECT FROM STUDENTS LIST) ======================= */}
      {editingGradeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#0b1320] border border-blue-500/40 rounded-2xl max-w-md w-full p-5 shadow-2xl flex flex-col gap-4 text-right">
            <div className="flex items-center justify-between pb-3 border-b border-[#16253b]">
              <button
                onClick={() => setEditingGradeModal(null)}
                className="p-1.5 hover:bg-[#152336] text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-blue-400" />
                <h3 className="font-extrabold text-white text-base">تعديل المرحلة والصف الدراسي</h3>
              </div>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!editingGradeNewName.trim() || !onUpdateGradeName) return;
                onUpdateGradeName(editingGradeModal, editingGradeNewName.trim());
                setSelectedGrade(editingGradeNewName.trim());
                setEditingGradeModal(null);
              }}
              className="flex flex-col gap-3.5"
            >
              <div className="p-3 bg-blue-950/40 border border-blue-500/30 rounded-xl text-xs text-blue-300 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <span>
                  عند تعديل اسم المرحلة، سيتم تحديث جميع الطلاب والكورسات المرتبطة بها تلقائياً!
                </span>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-slate-300 font-bold">اسم المرحلة الجديد *</label>
                <input
                  type="text"
                  required
                  value={editingGradeNewName}
                  onChange={(e) => setEditingGradeNewName(e.target.value)}
                  placeholder="اكتب الاسم الجديد للمرحلة..."
                  className="bg-[#070d17] border border-[#1b2f48] focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#16253b]">
                <button
                  type="button"
                  onClick={() => setEditingGradeModal(null)}
                  className="bg-[#152336] hover:bg-[#1a2d48] text-slate-300 text-xs px-4 py-2 rounded-xl transition-colors cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-500 text-white text-xs px-5 py-2 rounded-xl font-bold transition-all shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>تحديث وحفظ المرحلة</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================= MODAL: CONFIRM DELETE GRADE (FROM STUDENTS LIST) ======================= */}
      {gradeToDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#0f172a] border border-rose-500/50 rounded-2xl max-w-md w-full p-5 shadow-2xl flex flex-col gap-4 text-right">
            <div className="flex items-center gap-3 text-rose-400 border-b border-rose-500/20 pb-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5 text-rose-400" />
              </div>
              <div>
                <h3 className="font-extrabold text-white text-sm">تأكيد حذف المرحلة والصف الدراسي</h3>
                <p className="text-[11px] text-slate-400">هل تريد بالتأكيد إزالة هذه المرحلة من قائمة المراحل؟</p>
              </div>
            </div>

            <div className="bg-[#141e30] border border-[#1e2f47] p-3.5 rounded-xl space-y-1 text-xs">
              <div className="text-white font-bold flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4 text-emerald-400" />
                <span>{gradeToDeleteModal}</span>
              </div>
              <p className="text-slate-400 text-[11px] mt-1">
                سيتم إزالة المرحلة من القوائم النشطة، ولن تفقد بيانات الطلاب السابقة.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#1e293b]">
              <button
                type="button"
                onClick={() => setGradeToDeleteModal(null)}
                className="bg-[#1e293b] hover:bg-[#334155] text-slate-300 text-xs px-4 py-2 rounded-xl transition-colors cursor-pointer"
              >
                تراجع
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onDeleteGrade && gradeToDeleteModal) {
                    onDeleteGrade(gradeToDeleteModal);
                    setSelectedGrade('all');
                    setGradeToDeleteModal(null);
                  }
                }}
                className="bg-rose-600 hover:bg-rose-500 text-white text-xs px-5 py-2 rounded-xl font-bold transition-all shadow-md cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>نعم، حذف المرحلة</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
