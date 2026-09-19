import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  CheckCircle2,
  MessageCircle,
  Copy,
  Check,
  Printer,
  X,
  User,
  BookOpen,
  ShieldCheck,
  QrCode,
  Download,
  Calendar,
  Clock,
  ExternalLink,
  Image as ImageIcon,
  Sparkles,
  Award,
  CreditCard,
  Share2,
} from 'lucide-react';
import { Student, Course } from '../../types';
import { generateProfessionalReceipt } from '../../utils/receiptCanvas';

interface StudentSuccessModalProps {
  student: Student | null;
  courses?: Course[];
  onClose: () => void;
  onGoToStudentsList: () => void;
}

export const StudentSuccessModal: React.FC<StudentSuccessModalProps> = ({
  student,
  courses = [],
  onClose,
  onGoToStudentsList,
}) => {
  const [activeTab, setActiveTab] = useState<'whatsapp' | 'receipt'>('whatsapp');
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedText, setCopiedText] = useState(false);
  const [copiedImage, setCopiedImage] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [receiptDataUrl, setReceiptDataUrl] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  if (!student) return null;

  // Resolve Course Schedule
  const matchedCourse = courses.find((c) => c.name === student.course);
  const courseSchedule =
    student.courseSchedule ||
    matchedCourse?.schedule ||
    'الأحد والأربعاء - الساعة 8:00 مساءً (بث مباشر ومسجل عبر المنصة)';

  const receiptSerial = `REC-2025-${student.code.replace(/\D/g, '').slice(-5) || '84100'}`;

  // Comprehensive WhatsApp Message with Course Schedule & Receipt Announcement
  const whatsappMessage = `السلام عليكم ورحمة الله وبركاته 🌟
مرحباً ولي أمر الطالب: ${student.name}

نحيطكم علماً بأنه تم تأكيد واستلام اشتراك الطالب رسمياً في منظومة الأستاذ أشرف السقا لمادة الكيمياء.

📅 ══════ مواعيد محاضرات الكورس ══════ 📅
📌 المقرر: ${student.course}
⏰ مواعيد الحصص والبث المباشر:
${courseSchedule}
⚠️ يرجى التواجد على المنصة قبل بداية المحاضرة بـ 10 دقائق وتجهيز كشكول الملاحظات.

🔐 ══════ كود التفعيل وبيانات الدخول ══════ 🔐
🔑 كود التفعيل الخاص بالطالب: ${student.code}
🌐 رابط تسجيل ودخول المنصة: https://el-saqqa-chem.online/activate?code=${encodeURIComponent(student.code)}

💰 ══════ تفاصيل الإيصال المالي ══════ 💰
💵 المبلغ المسدد: ${student.amountPaid} ج.م (مدفوع بالكامل ومؤكد)
💳 طريقة السداد: ${student.paymentMethod}
🧾 رقم الإيصال المعتمد: ${receiptSerial}
📌 تم إرفاق وتوليد صورة الإيصال الرسمي المعتمدة لهذا الاشتراك.

📞 لأي استفسار أو دعم فني يرجى التواصل معنا عبر هذا الرقم مباشرة.
نتمنى لأولادنا دوام التفوق والدرجات النهائية بإذن الله! 🧪✨`;

  // Pre-generate HD receipt image on mount or when student changes
  useEffect(() => {
    let isMounted = true;
    generateProfessionalReceipt(student, courseSchedule)
      .then((res) => {
        if (isMounted) {
          setReceiptDataUrl(res.dataUrl);
        }
      })
      .catch((err) => console.error('Failed to pre-generate receipt:', err));

    return () => {
      isMounted = false;
    };
  }, [student, courseSchedule]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // 1. Open WhatsApp
  const handleOpenWhatsApp = () => {
    let cleanPhone = student.parentWhatsapp.replace(/\D/g, '');
    if (cleanPhone.startsWith('0')) {
      cleanPhone = '2' + cleanPhone;
    }
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(whatsappMessage)}`;
    window.open(url, '_blank');
  };

  // 2. Download HD PNG Receipt Image
  const handleDownloadReceiptImage = async () => {
    try {
      setIsGeneratingImage(true);
      const res = await generateProfessionalReceipt(student, courseSchedule);
      const link = document.createElement('a');
      link.download = `إيصال_اشتراك_${student.name.replace(/\s+/g, '_')}_${student.code}.png`;
      link.href = res.dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast('تم تحميل صورة الإيصال الاحترافي بنجاح! يمكنك إرسالها الآن كصورة في واتساب');
    } catch (e) {
      console.error(e);
      alert('حدث خطأ أثناء حفظ صورة الإيصال');
    } finally {
      setIsGeneratingImage(false);
    }
  };

  // 3. Copy Receipt Image to Clipboard (for 1-click paste into WhatsApp chat)
  const handleCopyReceiptImage = async () => {
    try {
      setIsGeneratingImage(true);
      const res = await generateProfessionalReceipt(student, courseSchedule);
      if (navigator.clipboard && window.ClipboardItem) {
        await navigator.clipboard.write([
          new ClipboardItem({
            'image/png': res.blob,
          }),
        ]);
        setCopiedImage(true);
        setTimeout(() => setCopiedImage(false), 2500);
        showToast('تم نسخ صورة الإيصال! افتح واتساب واضغط (Ctrl + V) لإرسال الصورة مباشرة 🚀');
      } else {
        // Fallback: download the image
        handleDownloadReceiptImage();
      }
    } catch (e) {
      console.error('Clipboard write error:', e);
      handleDownloadReceiptImage();
    } finally {
      setIsGeneratingImage(false);
    }
  };

  // 4. Copy Code
  const handleCopyCode = () => {
    navigator.clipboard.writeText(student.code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
    showToast('تم نسخ كود التفعيل!');
  };

  // 5. Copy Message Text
  const handleCopyMessageText = () => {
    navigator.clipboard.writeText(whatsappMessage);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
    showToast('تم نسخ نص رسالة المواعيد والإيصال بالكامل!');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-5 bg-black/85 backdrop-blur-md animate-in fade-in overflow-y-auto">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[60] bg-emerald-600 text-white px-5 py-2.5 rounded-xl shadow-2xl text-xs font-bold flex items-center gap-2 border border-emerald-400 animate-in slide-in-from-top-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-200" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="bg-[#0b1322] border border-[#1e3a5f] rounded-2xl max-w-2xl w-full p-4 md:p-6 shadow-2xl flex flex-col gap-4 text-right max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-[#162942]">
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-[#152336] text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
            title="إغلاق النافذة"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-white text-base md:text-lg flex items-center gap-2">
                <span>تم تسجيل وتأكيد اشتراك الطالب بنجاح!</span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/40 font-mono">
                  {student.code}
                </span>
              </h3>
              <p className="text-xs text-emerald-400 font-semibold mt-0.5">
                تم حفظ الحساب، وتجهيز جدول المواعيد، وتوليد الإيصال الرسمي المعتمد
              </p>
            </div>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex rounded-xl bg-[#070d17] p-1 border border-[#16273e]">
          <button
            type="button"
            onClick={() => setActiveTab('whatsapp')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              activeTab === 'whatsapp'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <MessageCircle className="w-4 h-4" />
            <span>إرسال الواتساب والمواعيد</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('receipt')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              activeTab === 'receipt'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>صورة الإيصال الاحترافي (معاينة وتحميل)</span>
          </button>
        </div>

        {/* TAB 1: WHATSAPP & SCHEDULE SENDING */}
        {activeTab === 'whatsapp' && (
          <div className="flex flex-col gap-4">
            {/* Activation Code & Real Scannable QR Box */}
            <div className="bg-[#070e1b] border border-blue-500/40 rounded-xl p-3.5 flex items-center justify-between gap-3">
              <div className="flex-1">
                <div className="text-[11px] text-slate-400 font-medium">كود التفعيل الفوري للطالب:</div>
                <div className="text-xl font-mono font-black text-blue-400 tracking-wider mt-0.5">
                  {student.code}
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <button
                    onClick={handleCopyCode}
                    type="button"
                    className="bg-[#122238] hover:bg-[#1a2d48] border border-blue-500/30 text-blue-300 text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-bold transition-all cursor-pointer"
                  >
                    {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCode ? 'تم النسخ!' : 'نسخ الكود'}</span>
                  </button>
                  <span className="text-[10px] text-slate-400">للدخول المباشر للمنصة</span>
                </div>
              </div>
              <div className="bg-white p-2 rounded-xl border-2 border-slate-700 shrink-0 text-center shadow" title="رمز QR للتفعيل الفوري عبر كاميرا الهاتف">
                <QRCodeSVG
                  value={`https://el-saqqa-chem.online/activate?code=${encodeURIComponent(student.code)}`}
                  size={66}
                  level="M"
                  bgColor="#FFFFFF"
                  fgColor="#0f172a"
                />
                <span className="block text-[8px] text-slate-700 font-bold mt-0.5">مسح الكود</span>
              </div>
            </div>

            {/* Crucial Course Schedule Highlight Box */}
            <div className="bg-[#241a0b] border-2 border-amber-500/50 rounded-xl p-3.5 flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-amber-300 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-amber-400" />
                  <span>مواعيد الحصص والمحاضرات (المدرجة في رسالة الواتساب والإيصال):</span>
                </span>
                <span className="text-[10px] bg-amber-500/20 text-amber-200 border border-amber-500/30 px-2 py-0.5 rounded-md font-bold">
                  جدول رسمي
                </span>
              </div>
              <div className="text-sm font-extrabold text-amber-100 bg-[#161005] border border-amber-500/30 rounded-lg p-2.5 tracking-wide">
                {courseSchedule}
              </div>
              <p className="text-[11px] text-amber-300/80 font-medium">
                ⚡ سيتم إرسال هذا الجدول نصياً لولي الأمر، كما أنه مطبوع بالكامل داخل صورة الإيصال المعتمدة.
              </p>
            </div>

            {/* Student & Financial Details Summary */}
            <div className="bg-[#08101c] border border-[#17273f] rounded-xl p-3.5 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">اسم الطالب:</span>
                <span className="font-bold text-white">{student.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">الكورس المشترك به:</span>
                <span className="font-bold text-blue-300 truncate max-w-[280px]">{student.course}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">المبلغ وطريقة الدفع:</span>
                <span className="font-bold text-emerald-400 font-mono">
                  {student.amountPaid} ج.م ({student.paymentMethod}) - مدفوع ومؤكد
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">واتساب ولي الأمر:</span>
                <span className="font-bold text-white font-mono">{student.parentWhatsapp}</span>
              </div>
            </div>

            {/* Primary Action 1: Send WhatsApp Message */}
            <button
              onClick={handleOpenWhatsApp}
              type="button"
              className="w-full bg-[#1da851] hover:bg-[#189144] text-white text-sm font-extrabold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2.5 transition-all shadow-lg shadow-emerald-600/30 cursor-pointer"
            >
              <MessageCircle className="w-5 h-5 fill-white text-transparent" />
              <span>إرسال المواعيد وتفاصيل الاشتراك لولي الأمر عبر الواتساب الآن</span>
            </button>

            {/* Quick Actions Bar for the Receipt Picture */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={handleCopyReceiptImage}
                disabled={isGeneratingImage}
                className="bg-[#12253b] hover:bg-[#18314e] border border-blue-500/40 text-blue-200 text-xs py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 font-bold cursor-pointer transition-all"
                title="نسخ الصورة ولصقها مباشرة في شات الواتساب"
              >
                {copiedImage ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-blue-400" />}
                <span>{copiedImage ? 'تم نسخ الصورة!' : 'نسخ صورة الإيصال (Ctrl+V في واتساب)'}</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadReceiptImage}
                disabled={isGeneratingImage}
                className="bg-[#102322] hover:bg-[#173332] border border-emerald-500/40 text-emerald-200 text-xs py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 font-bold cursor-pointer transition-all"
              >
                <Download className="w-4 h-4 text-emerald-400" />
                <span>تحميل صورة الإيصال (PNG HD)</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: PROFESSIONAL RECEIPT CARD & LIVE PREVIEW */}
        {activeTab === 'receipt' && (
          <div className="flex flex-col gap-4">
            {/* The Professional Graphic Receipt Card Frame */}
            <div className="relative bg-[#09111e] border-2 border-emerald-500/50 rounded-2xl p-5 shadow-2xl text-right overflow-hidden">
              {/* Gold/Emerald Top Accent Line */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-blue-500 to-amber-500" />

              {/* Receipt Header */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pb-4 border-b border-[#182c47]">
                <div className="text-center sm:text-right">
                  <div className="text-xs text-blue-400 font-bold tracking-wide">المنظومة التعليمية الرسمية</div>
                  <h4 className="text-xl font-black text-white mt-0.5">منظومة الأستاذ أشرف السقا</h4>
                  <div className="text-xs text-slate-400 font-medium">خبير مادة الكيمياء للثانوية العامة واللغات</div>
                </div>

                <div className="flex flex-col items-center sm:items-end gap-1">
                  <span className="bg-emerald-950/80 text-emerald-300 border border-emerald-500/50 text-xs px-3 py-1 rounded-full font-bold flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>إيصال سداد وتفعيل رسمي معتمد</span>
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">
                    رقم الإيصال: {receiptSerial}
                  </span>
                </div>
              </div>

              {/* Receipt Body: Student & Course info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 py-4 text-xs">
                <div className="bg-[#0e192a] p-3 rounded-xl border border-[#1d3556]">
                  <span className="text-slate-400 block text-[11px]">اسم الطالب:</span>
                  <span className="text-white font-bold text-sm block mt-0.5">{student.name}</span>
                </div>

                <div className="bg-[#0e192a] p-3 rounded-xl border border-[#1d3556]">
                  <span className="text-slate-400 block text-[11px]">المرحلة والصف:</span>
                  <span className="text-white font-bold text-sm block mt-0.5">{student.grade}</span>
                </div>

                <div className="bg-[#0e192a] p-3 rounded-xl border border-[#1d3556] sm:col-span-2">
                  <span className="text-slate-400 block text-[11px]">الكورس والمقرر المشترك به:</span>
                  <span className="text-blue-300 font-extrabold text-sm block mt-0.5">{student.course}</span>
                </div>

                {/* Highly Visible Schedule in Receipt Card */}
                <div className="bg-[#241a0b] p-3.5 rounded-xl border-2 border-amber-500/50 sm:col-span-2">
                  <div className="flex items-center gap-1.5 text-amber-300 font-bold text-xs mb-1">
                    <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>مواعيد الحصص والمحاضرات (الجدول الرسمي):</span>
                  </div>
                  <div className="text-amber-100 font-black text-sm tracking-wide">
                    {courseSchedule}
                  </div>
                </div>

                <div className="bg-[#07241c] p-3 rounded-xl border border-emerald-500/40 flex items-center justify-between">
                  <div>
                    <span className="text-emerald-300/80 block text-[11px]">المبلغ المدفوع:</span>
                    <span className="text-emerald-400 font-mono font-black text-lg block mt-0.5">
                      {student.amountPaid} ج.م
                    </span>
                  </div>
                  <span className="text-[10px] bg-emerald-600 text-white font-bold px-2 py-1 rounded-md">
                    ✓ مدفوع ومؤكد
                  </span>
                </div>

                <div className="bg-[#0e192a] p-3 rounded-xl border border-[#1d3556]">
                  <span className="text-slate-400 block text-[11px]">طريقة السداد والتحصيل:</span>
                  <span className="text-white font-bold block mt-1">{student.paymentMethod}</span>
                </div>
              </div>

              {/* Receipt Footer with QR Code & Official Stamp */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-3 border-t border-[#182c47]">
                {/* Activation Code & Scannable QR */}
                <div className="flex items-center gap-3 bg-[#0d1727] p-2.5 rounded-xl border border-[#1b3150]">
                  <div className="bg-white p-1 rounded-lg border border-slate-700">
                    <QRCodeSVG
                      value={`https://el-saqqa-chem.online/activate?code=${encodeURIComponent(student.code)}`}
                      size={54}
                      level="M"
                      bgColor="#FFFFFF"
                      fgColor="#0f172a"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">كود التفعيل بالمنصة:</span>
                    <span className="text-sm font-mono font-black text-blue-400 block">
                      {student.code}
                    </span>
                  </div>
                </div>

                {/* Circular Official Certified Stamp */}
                <div className="flex items-center gap-2 border border-emerald-500/40 bg-emerald-950/40 px-3.5 py-2 rounded-xl">
                  <div className="w-8 h-8 rounded-full border-2 border-emerald-400 flex items-center justify-center text-emerald-400 font-bold text-xs">
                    ✓
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-emerald-300 font-bold">ختم المنظومة المعتمد</div>
                    <div className="text-xs text-white font-extrabold">أ. أشرف السقا</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Receipt Action Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={handleDownloadReceiptImage}
                disabled={isGeneratingImage}
                className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs py-3 px-3 rounded-xl flex items-center justify-center gap-2 font-extrabold cursor-pointer transition-all shadow-md shadow-emerald-700/20"
              >
                <Download className="w-4 h-4" />
                <span>تحميل صورة الإيصال (PNG)</span>
              </button>

              <button
                type="button"
                onClick={handleCopyReceiptImage}
                disabled={isGeneratingImage}
                className="bg-[#12253b] hover:bg-[#19324f] border border-blue-500/40 text-blue-200 text-xs py-3 px-3 rounded-xl flex items-center justify-center gap-2 font-bold cursor-pointer transition-all"
              >
                {copiedImage ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-blue-400" />}
                <span>نسخ لصق في شات الواتساب</span>
              </button>

              <button
                type="button"
                onClick={handleOpenWhatsApp}
                className="bg-[#122033] hover:bg-[#1a2d48] border border-[#1f3654] text-slate-200 text-xs py-3 px-3 rounded-xl flex items-center justify-center gap-2 font-bold cursor-pointer transition-all"
              >
                <MessageCircle className="w-4 h-4 text-emerald-400" />
                <span>إرسال للواتساب</span>
              </button>
            </div>
          </div>
        )}

        {/* Footer Navigation Buttons */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#16253b]">
          <button
            onClick={() => window.print()}
            type="button"
            className="bg-[#122033] hover:bg-[#1a2d48] border border-[#1f3654] text-slate-200 text-xs py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 font-bold cursor-pointer"
          >
            <Printer className="w-4 h-4 text-blue-400" />
            <span>طباعة الإيصال</span>
          </button>

          <button
            onClick={handleCopyMessageText}
            type="button"
            className="bg-[#122033] hover:bg-[#1a2d48] border border-[#1f3654] text-slate-200 text-xs py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 font-bold cursor-pointer"
          >
            {copiedText ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-slate-400" />}
            <span>نسخ نص الرسالة</span>
          </button>

          <button
            onClick={onGoToStudentsList}
            type="button"
            className="bg-[#122033] hover:bg-[#1a2d48] border border-[#1f3654] text-slate-200 text-xs py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 font-bold cursor-pointer"
          >
            <User className="w-4 h-4 text-emerald-400" />
            <span>عرض بسجل الطلاب</span>
          </button>
        </div>
      </div>
    </div>
  );
};
