import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  DollarSign,
  Wallet,
  Calendar,
  MessageCircle,
  AlertCircle,
  ArrowRightLeft,
  Sparkles,
  FileText,
  Printer,
  Download,
  Loader2,
} from 'lucide-react';
import { Student } from '../../types';
import { downloadReceiptPdf, printReceiptPdf } from '../../utils/receiptPdf';

interface InstallmentSettleModalProps {
  student: Student | null;
  onClose: () => void;
  onSettle: (
    studentId: string,
    settlementData: {
      newAmountPaid: number;
      newRemaining: number;
      newStatus: 'paid_in_full' | 'pending_installment';
      settlementMethod: string;
      notes?: string;
      sendWhatsAppNotice: boolean;
    }
  ) => void;
}

export const InstallmentSettleModal: React.FC<InstallmentSettleModalProps> = ({
  student,
  onClose,
  onSettle,
}) => {
  if (!student) return null;

  const totalFee =
    student.totalCourseFee ||
    student.amountPaid + (student.remainingAmount || 0);
  const currentRemaining =
    student.remainingAmount ?? Math.max(0, totalFee - student.amountPaid);

  const [paymentAmount, setPaymentAmount] = useState<number>(currentRemaining);
  const [paymentMethod, setPaymentMethod] = useState<string>('فودافون كاش / محفظة ذكية');
  const [settlementType, setSettlementType] = useState<'full' | 'partial'>('full');
  const [additionalNotes, setAdditionalNotes] = useState<string>('تم سداد باقي القسط بالكامل');
  const [sendWhatsApp, setSendWhatsApp] = useState<boolean>(true);
  const [downloadPdf, setDownloadPdf] = useState<boolean>(true);
  const [isPrintingPdf, setIsPrintingPdf] = useState<boolean>(false);

  const calculatedNewRemaining =
    settlementType === 'full'
      ? 0
      : Math.max(0, currentRemaining - paymentAmount);
  const calculatedNewAmountPaid =
    settlementType === 'full'
      ? totalFee
      : student.amountPaid + paymentAmount;
  const newStatus: 'paid_in_full' | 'pending_installment' =
    calculatedNewRemaining === 0 ? 'paid_in_full' : 'pending_installment';

  const getUpdatedStudentObject = (): Student => ({
    ...student,
    amountPaid: calculatedNewAmountPaid,
    remainingAmount: calculatedNewRemaining,
    installmentStatus: newStatus,
    paymentMethod: paymentMethod,
    paymentType: 'installment',
    confirmedBy: 'أك. محمود عزت',
  });

  const handlePrintPdfNow = async () => {
    try {
      setIsPrintingPdf(true);
      const updatedStd = getUpdatedStudentObject();
      await printReceiptPdf(updatedStd, student.courseSchedule);
    } catch (e) {
      console.error(e);
      window.print();
    } finally {
      setIsPrintingPdf(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (downloadPdf) {
      const updatedStd = getUpdatedStudentObject();
      downloadReceiptPdf(updatedStd, student.courseSchedule).catch(console.error);
    }

    onSettle(student.id, {
      newAmountPaid: calculatedNewAmountPaid,
      newRemaining: calculatedNewRemaining,
      newStatus,
      settlementMethod: paymentMethod,
      notes: additionalNotes,
      sendWhatsAppNotice: sendWhatsApp,
    });
    onClose();
  };

  return (
    <div
      id="installment-settle-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
    >
      <div
        id="installment-settle-modal-card"
        className="bg-[#0b1320] border border-[#1e3452] w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Modal Header */}
        <div className="bg-[#0f1b2c] border-b border-[#1c2e47] p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>سداد القسط وتحويل الحساب</span>
                <span className="text-[11px] font-mono text-amber-400 bg-amber-500/15 px-2 py-0.5 rounded-full border border-amber-500/30">
                  {student.code}
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                تسجيل استلام المبلغ المتبقي وتحديث حالة الطالب
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4">
          {/* Student Info Card */}
          <div className="bg-[#070d17] border border-[#17273f] rounded-xl p-3.5 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white">{student.name}</span>
              <span className="text-[11px] text-blue-400">{student.course}</span>
            </div>
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#132238] text-center">
              <div className="bg-[#0d1726] p-2 rounded-lg">
                <span className="block text-[10px] text-slate-400">إجمالي الكورس</span>
                <span className="text-xs font-bold font-mono text-slate-200" dir="ltr">
                  {totalFee.toLocaleString('en-US')} <span className="font-sans text-[10px] font-normal">ج.م</span>
                </span>
              </div>
              <div className="bg-[#0d1726] p-2 rounded-lg">
                <span className="block text-[10px] text-slate-400">المسدد سابقاً</span>
                <span className="text-xs font-bold font-mono text-emerald-400" dir="ltr">
                  {student.amountPaid.toLocaleString('en-US')} <span className="font-sans text-[10px] font-normal">ج.م</span>
                </span>
              </div>
              <div className="bg-amber-950/40 border border-amber-800/40 p-2 rounded-lg">
                <span className="block text-[10px] text-amber-300 font-bold">المتبقي حالياً</span>
                <span className="text-xs font-bold font-mono text-amber-400" dir="ltr">
                  {currentRemaining.toLocaleString('en-US')} <span className="font-sans text-[10px] font-normal">ج.م</span>
                </span>
              </div>
            </div>
          </div>

          {/* Settle Type Options */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-300">
              خيار التسوية المطلوب:
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setSettlementType('full');
                  setPaymentAmount(currentRemaining);
                }}
                className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  settlementType === 'full'
                    ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300 shadow-md'
                    : 'bg-[#070d17] border-[#1c2e47] text-slate-400 hover:text-slate-200'
                }`}
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>سداد كامل المتبقي ({currentRemaining} ج.م)</span>
              </button>

              <button
                type="button"
                onClick={() => setSettlementType('partial')}
                className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  settlementType === 'partial'
                    ? 'bg-amber-600/20 border-amber-500 text-amber-300 shadow-md'
                    : 'bg-[#070d17] border-[#1c2e47] text-slate-400 hover:text-slate-200'
                }`}
              >
                <ArrowRightLeft className="w-4 h-4 text-amber-400" />
                <span>سداد دفعة جزئية أخرى</span>
              </button>
            </div>
          </div>

          {/* Amount Input */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-300">
                المبلغ المستلم الآن (ج.م) *
              </label>
              <input
                type="number"
                min="1"
                max={currentRemaining}
                value={paymentAmount}
                disabled={settlementType === 'full'}
                onChange={(e) => setPaymentAmount(Number(e.target.value))}
                className="bg-[#070d17] border border-[#1c2e47] focus:border-blue-500 rounded-xl px-3 py-2 text-sm text-white font-mono font-bold outline-none disabled:opacity-80"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-300">
                طريقة السداد المستلم بها
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="bg-[#070d17] border border-[#1c2e47] focus:border-blue-500 rounded-xl px-3 py-2 text-xs text-white outline-none cursor-pointer"
              >
                <option value="فودافون كاش / محفظة ذكية">فودافون كاش / محفظة ذكية</option>
                <option value="إنستاباي (InstaPay)">إنستاباي (InstaPay)</option>
                <option value="نقداً بالسنتر">نقداً بالسنتر</option>
                <option value="فوري (Fawry)">فوري (Fawry)</option>
                <option value="تحويل بنكي">تحويل بنكي</option>
              </select>
            </div>
          </div>

          {/* Status Result Preview */}
          <div
            className={`p-3 rounded-xl border text-xs flex items-center justify-between ${
              newStatus === 'paid_in_full'
                ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                : 'bg-amber-950/40 border-amber-500/40 text-amber-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <CheckCircle2
                className={`w-4 h-4 ${
                  newStatus === 'paid_in_full' ? 'text-emerald-400' : 'text-amber-400'
                }`}
              />
              <span className="font-bold">
                الحالة الجديدة بعد الحفظ:{' '}
                {newStatus === 'paid_in_full'
                  ? 'تم دفع القسط بالكامل (خالص 100%)'
                  : `متبقي قسط جديد: ${calculatedNewRemaining} ج.م`}
              </span>
            </div>
            <span className="font-mono font-bold">
              إجمالي المدفوع: {calculatedNewAmountPaid} ج.م
            </span>
          </div>

          {/* Notes */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-slate-300">
              ملاحظات السداد والتأكيد
            </label>
            <input
              type="text"
              value={additionalNotes}
              onChange={(e) => setAdditionalNotes(e.target.value)}
              placeholder="مثلاً: تم استلام القسط الثاني كاش بالسنتر"
              className="bg-[#070d17] border border-[#1c2e47] rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 outline-none"
            />
          </div>

          {/* Send WhatsApp checkbox */}
          <label className="flex items-center gap-2.5 p-2.5 bg-[#070d17] rounded-xl border border-[#17273f] cursor-pointer">
            <input
              type="checkbox"
              checked={sendWhatsApp}
              onChange={(e) => setSendWhatsApp(e.target.checked)}
              className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-500 bg-[#0b1320] border-[#1e3452]"
            />
            <MessageCircle className="w-4 h-4 text-emerald-400" />
            <span className="text-xs text-slate-200">
              فتح محادثة واتساب لولي الأمر لتأكيد استلام وسداد القسط فوراً
            </span>
          </label>

          {/* Download PDF Receipt checkbox */}
          <label className="flex items-center gap-2.5 p-2.5 bg-[#070d17] rounded-xl border border-red-500/30 cursor-pointer">
            <input
              type="checkbox"
              checked={downloadPdf}
              onChange={(e) => setDownloadPdf(e.target.checked)}
              className="w-4 h-4 rounded text-red-500 focus:ring-red-500 bg-[#0b1320] border-[#1e3452]"
            />
            <FileText className="w-4 h-4 text-red-400" />
            <div className="flex-1 flex items-center justify-between">
              <span className="text-xs text-slate-200 font-bold">
                توليد وتحميل إيصال سداد رسمي بصيغة PDF فور الحفظ
              </span>
              <span className="text-[10px] bg-red-500/20 text-red-300 px-2 py-0.5 rounded font-mono font-bold border border-red-500/30">
                PDF A4
              </span>
            </div>
          </label>

          {/* Actions */}
          <div className="flex items-center justify-between gap-2.5 pt-2 border-t border-[#162942]">
            <button
              type="button"
              onClick={handlePrintPdfNow}
              disabled={isPrintingPdf}
              className="bg-[#102338] hover:bg-[#16304c] border border-blue-500/40 text-blue-200 text-xs font-bold py-2.5 px-3.5 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-60"
              title="طباعة إيصال الدفع بصيغة PDF مباشرة"
            >
              {isPrintingPdf ? <Loader2 className="w-4 h-4 animate-spin" /> : <Printer className="w-4 h-4 text-blue-400" />}
              <span>طباعة إيصال PDF</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-xl transition-colors cursor-pointer"
              >
                إلغاء
              </button>

              <button
                type="submit"
                className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-900/30 flex items-center gap-2 transition-all cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>تحويل إلى تم دفع القسط وحفظ</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
