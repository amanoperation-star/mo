import React, { useState } from 'react';
import { X, MessageCircle, Send, Copy, Check, Clock, Download, Image as ImageIcon } from 'lucide-react';
import { Student, Course } from '../../types';
import { generateProfessionalReceipt } from '../../utils/receiptCanvas';

interface DirectWhatsAppModalProps {
  student: Student | null;
  courses?: Course[];
  onClose: () => void;
}

export const DirectWhatsAppModal: React.FC<DirectWhatsAppModalProps> = ({
  student,
  courses = [],
  onClose,
}) => {
  const [copied, setCopied] = useState(false);
  const [copiedImage, setCopiedImage] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  if (!student) return null;

  const matchedCourse = courses.find((c) => c.name === student.course);
  const courseSchedule =
    student.courseSchedule ||
    matchedCourse?.schedule ||
    'الأحد والأربعاء - الساعة 8:00 مساءً (بث مباشر ومسجل عبر المنصة)';

  const receiptSerial = `REC-2025-${student.code.replace(/\D/g, '').slice(-5) || '84100'}`;

  const isInstallment = student.paymentType === 'installment';
  const isPending = isInstallment && student.installmentStatus === 'pending_installment';
  const remAmount =
    student.remainingAmount ??
    (student.totalCourseFee ? Math.max(0, student.totalCourseFee - student.amountPaid) : 0);

  const paymentDetailsSection = isPending
    ? `💵 المبلغ المسدد حالياً: ${student.amountPaid} ج.م (دفعة أولى / قسط)
⏳ المبلغ المتبقي من القسط: ${remAmount} ج.م
📅 موعد استحقاق القسط المتبقي: ${student.installmentDueDate || 'حسب الاتفاق'}
💳 طريقة السداد: ${student.paymentMethod}`
    : `💵 المبلغ المسدد: ${student.amountPaid} ج.م (${isInstallment ? 'تم سداد القسط بالكامل' : 'مدفوع ومؤكد'})
💳 طريقة السداد: ${student.paymentMethod}`;

  const defaultMsg = `السلام عليكم ورحمة الله وبركاته 🌟
مرحباً ولي أمر الطالب: ${student.name}

نحيطكم علماً بأنه تم تأكيد واستلام اشتراك الطالب في منظومة الأستاذ أشرف السقا لمادة الكيمياء.

📅 ══════ مواعيد محاضرات الكورس ══════ 📅
📌 المقرر: ${student.course}
⏰ مواعيد الحصص والبث المباشر:
${courseSchedule}
⚠️ يرجى التواجد على المنصة قبل بداية المحاضرة بـ 10 دقائق وتجهيز كشكول الملاحظات.

🔐 ══════ كود التفعيل وبيانات الدخول ══════ 🔐
🔑 كود التفعيل الخاص بالطالب: ${student.code}
🌐 رابط تسجيل ودخول المنصة: https://el-saqqa-chem.online/activate?code=${encodeURIComponent(student.code)}

💰 ══════ تفاصيل الإيصال المالي ══════ 💰
${paymentDetailsSection}
🧾 رقم الإيصال المعتمد: ${receiptSerial}
📌 تم إرفاق وتوليد صورة الإيصال الرسمي المعتمدة لهذا الاشتراك.

📞 لأي استفسار أو دعم فني يرجى التواصل معنا مباشرة.
نتمنى لأولادنا دوام التفوق والدرجات النهائية بإذن الله! 🧪✨`;

  const [message, setMessage] = useState(defaultMsg);

  const handleSend = () => {
    let cleanPhone = student.parentWhatsapp.replace(/\D/g, '');
    if (cleanPhone.startsWith('0')) {
      cleanPhone = '2' + cleanPhone;
    }
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyReceipt = async () => {
    try {
      setIsGenerating(true);
      const res = await generateProfessionalReceipt(student, courseSchedule);
      if (navigator.clipboard && window.ClipboardItem) {
        await navigator.clipboard.write([new ClipboardItem({ 'image/png': res.blob })]);
        setCopiedImage(true);
        setTimeout(() => setCopiedImage(false), 2500);
      } else {
        handleDownloadReceipt();
      }
    } catch (e) {
      console.error(e);
      handleDownloadReceipt();
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadReceipt = async () => {
    try {
      setIsGenerating(true);
      const res = await generateProfessionalReceipt(student, courseSchedule);
      const link = document.createElement('a');
      link.download = `إيصال_اشتراك_${student.name.replace(/\s+/g, '_')}_${student.code}.png`;
      link.href = res.dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-[#0b1320] border border-[#1b2f48] rounded-2xl max-w-xl w-full p-5 shadow-2xl flex flex-col gap-4 text-right">
        <div className="flex items-center justify-between pb-3 border-b border-[#16253b]">
          <button
            onClick={onClose}
            className="p-1 hover:bg-[#152336] text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-emerald-400" />
            <span className="text-sm font-bold text-white">
              إرسال المواعيد وتفاصيل الإيصال لولي أمر: {student.name}
            </span>
          </div>
        </div>

        {/* Schedule preview box */}
        <div className="bg-[#211709] border border-amber-500/40 rounded-xl p-2.5 flex items-center gap-2 text-xs text-amber-200 font-semibold">
          <Clock className="w-4 h-4 text-amber-400 shrink-0" />
          <span>المواعيد المعتمدة: {courseSchedule}</span>
        </div>

        <div className="flex justify-between items-center text-xs text-slate-300">
          <span>الرقم المستهدف: <strong className="font-mono text-emerald-400">{student.parentWhatsapp}</strong></span>
          <div className="flex items-center gap-3">
            <button
              onClick={handleCopy}
              type="button"
              className="flex items-center gap-1 text-blue-400 hover:text-blue-300 font-semibold cursor-pointer"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? 'تم نسخ النص' : 'نسخ النص'}</span>
            </button>
          </div>
        </div>

        <textarea
          rows={8}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full bg-[#070d17] border border-[#1c2e47] focus:border-emerald-500 rounded-xl p-3 text-xs text-slate-200 outline-none transition-all leading-relaxed font-sans"
        />

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-2 pt-2 border-t border-[#132238]">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleCopyReceipt}
              disabled={isGenerating}
              type="button"
              className="bg-[#12253b] hover:bg-[#18314e] border border-blue-500/30 text-blue-300 text-xs px-3 py-2 rounded-xl flex items-center gap-1.5 font-bold cursor-pointer"
              title="نسخ صورة الإيصال للصق في واتساب (Ctrl+V)"
            >
              {copiedImage ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <ImageIcon className="w-3.5 h-3.5 text-blue-400" />}
              <span>{copiedImage ? 'تم نسخ الصورة!' : 'نسخ صورة الإيصال'}</span>
            </button>

            <button
              onClick={handleDownloadReceipt}
              disabled={isGenerating}
              type="button"
              className="bg-[#0f1f1d] hover:bg-[#152e2a] border border-emerald-500/30 text-emerald-300 text-xs px-3 py-2 rounded-xl flex items-center gap-1.5 font-bold cursor-pointer"
              title="تحميل صورة الإيصال كملف PNG"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>تحميل PNG</span>
            </button>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={onClose}
              type="button"
              className="bg-[#152336] text-slate-300 text-xs px-3.5 py-2 rounded-xl cursor-pointer"
            >
              إلغاء
            </button>
            <button
              onClick={handleSend}
              type="button"
              className="bg-[#1da851] hover:bg-[#189144] text-white text-xs px-5 py-2 rounded-xl font-bold flex items-center gap-1.5 shadow-md shadow-emerald-600/30 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>فتح المحادثة في واتساب</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
