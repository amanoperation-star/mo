import React, { useState, useEffect } from 'react';
import {
  X,
  MessageCircle,
  Download,
  Copy,
  Check,
  Printer,
  ShieldCheck,
  Clock,
  Sparkles,
  Award,
  ExternalLink,
  Share2,
  FileText,
  Loader2,
} from 'lucide-react';
import { Student, Course } from '../../types';
import { generateProfessionalReceipt } from '../../utils/receiptCanvas';
import { getStoredCenterSettings } from '../../utils/storage';
import { downloadReceiptPdf, printReceiptPdf } from '../../utils/receiptPdf';

interface WhatsAppReceiptModalProps {
  student: Student | null;
  courses?: Course[];
  onClose: () => void;
}

export const WhatsAppReceiptModal: React.FC<WhatsAppReceiptModalProps> = ({
  student,
  courses = [],
  onClose,
}) => {
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [blob, setBlob] = useState<Blob | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [copiedImage, setCopiedImage] = useState(false);
  const [copiedText, setCopiedText] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const centerSettings = getStoredCenterSettings();

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
📅 تاريخ استحقاق القسط المتبقي: ${student.installmentDueDate || 'حسب الاتفاق مع الإدارة'}
💳 طريقة السداد: ${student.paymentMethod}`
    : `💵 المبلغ المسدد: ${student.amountPaid} ج.م (${isInstallment ? 'تم سداد القسط بالكامل وتصفية الحساب' : 'مدفوع بالكامل ومؤكد'})
💳 طريقة السداد: ${student.paymentMethod}`;

  const cleanPlatformUrl = centerSettings.platformUrl?.replace(/\/$/, '') || 'https://el-saqqa-chem.online';

  const whatsappMessage = `السلام عليكم ورحمة الله وبركاته 🌟
مرحباً ولي أمر الطالب: ${student.name}

نحيطكم علماً بأنه تم تأكيد واستلام اشتراك الطالب رسمياً في ${centerSettings.centerName || 'منظومة الأستاذ أشرف السقا'}.

📅 ══════ مواعيد محاضرات الكورس ══════ 📅
📌 المقرر: ${student.course}
⏰ مواعيد الحصص والبث المباشر:
${courseSchedule}
⚠️ يرجى التواجد على المنصة قبل بداية المحاضرة بـ 10 دقائق وتجهيز كشكول الملاحظات.

🔐 ══════ كود التفعيل وبيانات الدخول ══════ 🔐
🔑 كود التفعيل الخاص بالطالب: ${student.code}
🌐 رابط تسجيل ودخول المنصة: ${cleanPlatformUrl}/activate?code=${encodeURIComponent(student.code)}

💰 ══════ تفاصيل الإيصال المالي ══════ 💰
${paymentDetailsSection}
🧾 رقم الإيصال المعتمد: ${receiptSerial}
📌 تم إرفاق وتوليد صورة الإيصال الرسمي المعتمدة لهذا الاشتراك.

📞 لأي استفسار أو دعم فني يرجى التواصل معنا عبر الرقم (${centerSettings.phoneNumber || '01029847561'}) مباشرة.
نتمنى لأولادنا دوام التفوق والدرجات النهائية بإذن الله! 🧪✨`;

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    generateProfessionalReceipt(student, courseSchedule, centerSettings)
      .then((res) => {
        if (isMounted) {
          setDataUrl(res.dataUrl);
          setBlob(res.blob);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('Error generating receipt preview:', err);
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [student, courseSchedule]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleOpenWhatsApp = () => {
    let cleanPhone = student.parentWhatsapp.replace(/\D/g, '');
    if (cleanPhone.startsWith('0')) {
      cleanPhone = '2' + cleanPhone;
    }
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(whatsappMessage)}`;
    window.open(url, '_blank');
  };

  const handleCopyImage = async () => {
    try {
      if (blob && navigator.clipboard && window.ClipboardItem) {
        await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
        setCopiedImage(true);
        setTimeout(() => setCopiedImage(false), 2500);
        showToast('تم نسخ صورة الإيصال للحافظة! افتح واتساب واضغط (Ctrl + V)');
      } else {
        handleDownload();
      }
    } catch (e) {
      console.error(e);
      handleDownload();
    }
  };

  const handleDownloadPdf = async () => {
    try {
      setIsGeneratingPdf(true);
      const filename = await downloadReceiptPdf(student, courseSchedule, centerSettings);
      showToast(`تم تحميل إيصال الدفع بصيغة PDF بنجاح (${filename})! 📄`);
    } catch (e) {
      console.error(e);
      alert('حدث خطأ أثناء تحميل ملف PDF، جاري تنزيل صورة الإيصال كبديل.');
      handleDownload();
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handlePrintPdf = async () => {
    try {
      setIsGeneratingPdf(true);
      showToast('جاري تجهيز إيصال الدفع بصيغة PDF للطباعة...');
      await printReceiptPdf(student, courseSchedule, centerSettings);
    } catch (e) {
      console.error(e);
      window.print();
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleDownload = () => {
    if (!dataUrl) return;
    const link = document.createElement('a');
    link.download = `إيصال_رسمي_${student.name.replace(/\s+/g, '_')}_${student.code}.png`;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('تم بدء تحميل صورة الإيصال بجودة فائقة!');
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(whatsappMessage);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
    showToast('تم نسخ نص الرسالة بالكامل!');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-5 bg-black/85 backdrop-blur-md animate-in fade-in overflow-y-auto">
      {toastMessage && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[60] bg-emerald-600 text-white px-5 py-2.5 rounded-xl shadow-2xl text-xs font-bold flex items-center gap-2 border border-emerald-400 animate-in slide-in-from-top-3">
          <ShieldCheck className="w-4 h-4 text-emerald-200" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="bg-[#0b1322] border border-[#1e3a5f] rounded-2xl max-w-4xl w-full p-4 md:p-6 shadow-2xl flex flex-col gap-4 text-right max-h-[94vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-[#162942]">
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-[#152336] text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
            title="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/40 text-blue-400 flex items-center justify-center shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-white text-base md:text-lg flex items-center gap-2">
                <span>معاينة إيصال الواتساب الاحترافي المعتمد</span>
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/40 font-mono">
                  {student.code}
                </span>
              </h3>
              <p className="text-xs text-slate-400 font-medium mt-0.5">
                هذه هي الصورة والنص المعتمدين التي سيتم إرسالهما لولي أمر الطالب عبر الواتساب
              </p>
            </div>
          </div>
        </div>

        {/* Schedule Alert Banner */}
        <div className="bg-[#241a0b] border border-amber-500/50 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-amber-300 font-bold">
            <Clock className="w-4 h-4 text-amber-400 shrink-0" />
            <span>مواعيد الحصص المضمنة في الإيصال:</span>
            <span className="text-amber-100 font-extrabold mr-1">{courseSchedule}</span>
          </div>
          <span className="text-[10px] bg-amber-500/20 text-amber-200 border border-amber-500/30 px-2 py-0.5 rounded-md self-start sm:self-auto font-semibold">
            {student.grade}
          </span>
        </div>

        {/* Grid Preview: Left Image, Right Details */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
          {/* Receipt Image Canvas View (7 cols) */}
          <div className="lg:col-span-7 bg-[#070d17] border border-[#182a44] rounded-xl p-3 flex flex-col items-center justify-center min-h-[380px] shadow-inner">
            {loading ? (
              <div className="flex flex-col items-center gap-3 py-16 text-slate-400 text-xs">
                <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                <span>جاري توليد وتحضير صورة الإيصال الاحترافي الفائقة...</span>
              </div>
            ) : dataUrl ? (
              <div className="relative group w-full flex flex-col items-center">
                <img
                  src={dataUrl}
                  alt={`إيصال رسمي - ${student.name}`}
                  className="max-h-[58vh] w-auto object-contain rounded-xl shadow-2xl border border-slate-700/60"
                  referrerPolicy="no-referrer"
                />
                <div className="mt-2 text-[11px] text-slate-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>صورة عالية الدقة والوضوح (1000 × 1420 px) ومجهزة للإرسال المباشر</span>
                </div>
              </div>
            ) : (
              <div className="text-red-400 text-xs py-10">تعذر توليد صورة الإيصال</div>
            )}
          </div>

          {/* Details & WhatsApp Text Preview (5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-3">
            {/* Quick Summary Box */}
            <div className="bg-[#09111e] border border-[#1a2d46] rounded-xl p-3.5 space-y-2 text-xs">
              <div className="font-bold text-blue-300 pb-1.5 border-b border-[#142337] flex items-center justify-between">
                <span>بيانات الإيصال المالي</span>
                <span className="font-mono text-slate-400">{receiptSerial}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">الطالب:</span>
                <span className="font-bold text-white">{student.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">المرحلة والصف:</span>
                <span className="font-semibold text-slate-200">{student.grade}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">المقرر / الكورس:</span>
                <span className="font-bold text-blue-300 truncate max-w-[180px]">{student.course}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">المبلغ المسدد:</span>
                <span className="font-bold text-emerald-400 font-mono">
                  {student.amountPaid} ج.م ({student.paymentMethod})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">واتساب ولي الأمر:</span>
                <span className="font-mono text-emerald-400 font-bold">{student.parentWhatsapp}</span>
              </div>
            </div>

            {/* Accompanying WhatsApp Message Preview */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 font-bold flex items-center gap-1">
                  <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                  <span>نص رسالة الواتساب المرفقة:</span>
                </span>
                <button
                  type="button"
                  onClick={handleCopyText}
                  className="text-blue-400 hover:text-blue-300 text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                >
                  {copiedText ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedText ? 'تم النسخ' : 'نسخ النص'}</span>
                </button>
              </div>
              <textarea
                readOnly
                value={whatsappMessage}
                rows={7}
                className="w-full bg-[#070d17] border border-[#1a2d46] rounded-xl p-3 text-[11px] text-slate-300 leading-relaxed font-sans outline-none resize-none"
              />
            </div>
          </div>
        </div>

        {/* Primary Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 pt-3 border-t border-[#162942]">
          <button
            type="button"
            onClick={handleOpenWhatsApp}
            className="bg-[#1da851] hover:bg-[#189144] text-white text-xs py-3 px-3 rounded-xl flex items-center justify-center gap-2 font-black cursor-pointer shadow-lg shadow-emerald-600/20 transition-all"
          >
            <MessageCircle className="w-4 h-4 fill-white text-transparent" />
            <span>إرسال للواتساب</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={isGeneratingPdf}
            className="bg-red-600 hover:bg-red-500 text-white text-xs py-3 px-3 rounded-xl flex items-center justify-center gap-2 font-extrabold cursor-pointer transition-all shadow-md shadow-red-700/30 disabled:opacity-60"
            title="تحميل إيصال رسمي A4 بصيغة PDF"
          >
            {isGeneratingPdf ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
            <span>تحميل PDF (A4)</span>
          </button>

          <button
            type="button"
            onClick={handlePrintPdf}
            disabled={isGeneratingPdf}
            className="bg-[#132840] hover:bg-[#1a3556] border border-blue-400/40 text-blue-200 text-xs py-3 px-3 rounded-xl flex items-center justify-center gap-2 font-bold cursor-pointer transition-all disabled:opacity-60"
            title="طباعة إيصال الدفع بصيغة PDF"
          >
            <Printer className="w-4 h-4 text-blue-400" />
            <span>طباعة PDF</span>
          </button>

          <button
            type="button"
            onClick={handleCopyImage}
            disabled={loading || !blob}
            className="bg-[#12253b] hover:bg-[#18314e] border border-blue-500/40 text-blue-200 text-xs py-3 px-3 rounded-xl flex items-center justify-center gap-2 font-bold cursor-pointer transition-all disabled:opacity-60"
            title="انسخ الصورة والصقها في محادثة الواتساب مباشرة"
          >
            {copiedImage ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-blue-400" />}
            <span>{copiedImage ? 'تم النسخ!' : 'نسخ الصورة'}</span>
          </button>

          <button
            type="button"
            onClick={handleDownload}
            disabled={loading || !dataUrl}
            className="bg-[#102322] hover:bg-[#173332] border border-emerald-500/40 text-emerald-200 text-xs py-3 px-3 rounded-xl flex items-center justify-center gap-2 font-bold cursor-pointer transition-all disabled:opacity-60"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>تحميل (PNG)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
