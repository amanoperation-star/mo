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
} from 'lucide-react';
import { Student } from '../../types';
import { InstallmentSettleModal } from '../modals/InstallmentSettleModal';

interface StudentsListScreenProps {
  students: Student[];
  onDeleteStudent: (id: string) => void;
  onUpdateStudent: (id: string, updatedData: Partial<Student>) => void;
  onViewReceipt: (url: string) => void;
  onOpenWhatsAppModal: (student: Student) => void;
  onExportExcel: () => void;
}

export const StudentsListScreen: React.FC<StudentsListScreenProps> = ({
  students,
  onDeleteStudent,
  onUpdateStudent,
  onViewReceipt,
  onOpenWhatsAppModal,
  onExportExcel,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState<'all' | 'full' | 'pending_installment' | 'paid_in_full'>('all');
  const [settleStudent, setSettleStudent] = useState<Student | null>(null);

  // Installment count metrics
  const pendingInstallmentsCount = students.filter(
    (s) => s.paymentType === 'installment' && s.installmentStatus === 'pending_installment'
  ).length;

  const paidInstallmentsCount = students.filter(
    (s) => s.paymentType === 'installment' && s.installmentStatus === 'paid_in_full'
  ).length;

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
          <span>متبقي عليه قسط</span>
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

        {/* Grade Filter */}
        <div className="relative">
          <Filter className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5" />
          <select
            value={selectedGrade}
            onChange={(e) => setSelectedGrade(e.target.value)}
            className="w-full bg-[#070d17] border border-[#1c2e47] focus:border-blue-500 rounded-xl pr-10 pl-4 py-2.5 text-xs text-white outline-none transition-all cursor-pointer"
          >
            <option value="all">جميع الصفوف الدراسية</option>
            <option value="الثالث">الصف الثالث الثانوي</option>
            <option value="الثاني">الصف الثاني الثانوي</option>
            <option value="الأول">الصف الأول الثانوي</option>
          </select>
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

                return (
                  <tr key={s.id} className="hover:bg-[#0d1726] transition-colors">
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
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          }`}>
                            {hasPending ? 'قسط' : 'قسط مسدد ✓'}
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{s.createdAt}</div>
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
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-emerald-400 text-sm font-mono">
                          {s.amountPaid.toLocaleString('ar-EG')} ج.م
                        </span>
                        {isInstallment && s.totalCourseFee && (
                          <span className="text-[10px] text-slate-400 font-mono">
                            من {s.totalCourseFee.toLocaleString('ar-EG')}
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{s.paymentMethod}</div>

                      {/* Installment Badge & Quick Conversion Button */}
                      {hasPending && (
                        <div className="mt-1.5 flex flex-col gap-1">
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-400 bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 rounded-md self-start font-mono">
                            <Clock className="w-3 h-3" />
                            <span>متبقي: {s.remainingAmount?.toLocaleString('ar-EG')} ج.م</span>
                          </span>

                          <div className="flex items-center gap-1.5 mt-0.5">
                            {/* Detailed Settle Modal button */}
                            <button
                              type="button"
                              onClick={() => setSettleStudent(s)}
                              className="text-[10px] font-bold bg-amber-500/25 hover:bg-amber-500/40 text-amber-200 border border-amber-500/50 rounded-lg px-2 py-1 transition-all flex items-center gap-1 cursor-pointer shadow-sm"
                              title="تسجيل سداد القسط أو تحصيل دفعة مع إشعار ولي الأمر"
                            >
                              <Wallet className="w-3 h-3 text-amber-400" />
                              <span>سداد القسط</span>
                            </button>

                            {/* 1-Click Quick Mark as Paid */}
                            <button
                              type="button"
                              onClick={() => handleQuickMarkAsPaid(s)}
                              className="text-[10px] font-bold bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-600/40 rounded-lg px-2 py-1 transition-all flex items-center gap-1 cursor-pointer"
                              title="تحويل فوري إلى تم دفع القسط بالكامل"
                            >
                              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                              <span>تحويل لـ تم دفع القسط</span>
                            </button>
                          </div>

                          {s.installmentDueDate && (
                            <div className="text-[10px] text-slate-400 flex items-center gap-1">
                              <Calendar className="w-2.5 h-2.5 text-slate-500" />
                              <span>استحقاق: {s.installmentDueDate}</span>
                            </div>
                          )}
                        </div>
                      )}

                      {isPaidInstallment && (
                        <div className="mt-1">
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded-md">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            <span>تم دفع القسط بالكامل ✓</span>
                          </span>
                        </div>
                      )}

                      {!isInstallment && (
                        <div className="mt-0.5">
                          <span className="text-[10px] text-blue-300/80 font-medium">سداد كامل</span>
                        </div>
                      )}
                    </td>

                    {/* Receipt */}
                    <td className="p-3.5">
                      {s.receiptUrl ? (
                        <button
                          onClick={() => onViewReceipt(s.receiptUrl!)}
                          type="button"
                          className="bg-[#132238] hover:bg-[#1a2d48] border border-blue-500/30 text-blue-300 text-[11px] px-2.5 py-1 rounded-lg flex items-center gap-1 font-semibold transition-all cursor-pointer"
                        >
                          <Eye className="w-3 h-3 text-blue-400" />
                          <span>معاينة</span>
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-500">لا يوجد</span>
                      )}
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
    </div>
  );
};
