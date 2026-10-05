import React, { useState } from 'react';
import {
  X,
  Copy,
  Check,
  ExternalLink,
  Users,
  LogIn,
  Sparkles,
  ShieldCheck,
  MessageCircle,
} from 'lucide-react';
import { CenterSettings } from '../types';

interface TeamShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  centerSettings: CenterSettings;
}

export const TeamShareModal: React.FC<TeamShareModalProps> = ({
  isOpen,
  onClose,
  centerSettings,
}) => {
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  // Compute the live origin URL
  const baseUrl = typeof window !== 'undefined'
    ? `${window.location.origin}${window.location.pathname}`
    : 'https://el-sqqa-chem.online/';

  const loginUrl = `${baseUrl}?auth=login`;

  const handleCopy = () => {
    try {
      navigator.clipboard.writeText(loginUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (e) {
      const ta = document.createElement('textarea');
      ta.value = loginUrl;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const handleSendWhatsApp = () => {
    const centerTitle = centerSettings.centerName || 'منظومة مستر أشرف السقا التعليمية';
    const message = `مرحباً بك في فريق عمل ${centerTitle} 🌟\n\nإليك رابط تسجيل الدخول المباشر إلى المنظومة:\n${loginUrl}\n\nيرجى الدخول باستخدام اسم المستخدم وكلمة المرور المسجلين لك من قِبل الإدارة لمتابعة مهامك وصلاحياتك. 🚀`;
    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200 dir-rtl text-right">
      <div className="bg-[#0b1320] border border-[#1d3250] rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-[#0d1829] via-[#0f1d32] to-[#0d1829] border-b border-[#1b2f4a] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/20 text-white shrink-0">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                <span>مشاركة رابط دخول فريق العمل</span>
                <span className="text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded-full">
                  صفحة الدخول
                </span>
              </h3>
              <p className="text-xs text-slate-400 font-semibold mt-0.5">
                أرسل هذا الرابط لأعضاء فريق العمل والمساعدين ليفتح معهم مباشرة على شاشة تسجيل الدخول
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-[#142338] hover:bg-[#1b2f4a] text-slate-400 hover:text-white transition-colors cursor-pointer"
            title="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex flex-col gap-4 text-xs">
          {/* Note Box */}
          <div className="p-3.5 rounded-2xl bg-blue-950/40 border border-blue-500/30 text-blue-200 flex items-start gap-2.5">
            <Sparkles className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <span className="font-bold text-white">كيف يعمل هذا الرابط؟</span>
              <p className="text-slate-300 text-[11px] mt-0.5">
                يقوم المشرف / الأدمن بإنشاء وتعيين حسابات المساعدين وتخصيص صلاحياتهم من شاشة <strong>«فريق العمل»</strong>، ثم إرسال هذا الرابط للموظف ليسجل دخوله مباشرة ببياناته المعتمدة.
              </p>
            </div>
          </div>

          {/* Standard Login Link */}
          <div className="bg-[#070d17] border border-[#172942] rounded-2xl p-4 flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-black text-white text-xs">
                <LogIn className="w-4 h-4 text-cyan-400" />
                <span>رابط تسجيل الدخول المباشر للتيم</span>
              </div>
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                يفتح على شاشة الدخول
              </span>
            </div>
            <div className="flex items-center gap-2 bg-[#0a1220] border border-[#16273f] rounded-xl p-2.5 font-mono text-[11px] text-cyan-300 overflow-x-auto select-all" dir="ltr">
              <span className="truncate flex-1">{loginUrl}</span>
            </div>
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={handleCopy}
                className={`flex-1 py-2.5 px-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 cursor-pointer text-xs ${
                  copied
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                    : 'bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/20'
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>تم نسخ الرابط بنجاح! ✓</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>نسخ رابط الدخول للتيم</span>
                  </>
                )}
              </button>
              <a
                href={loginUrl}
                target="_blank"
                rel="noreferrer"
                className="p-2.5 rounded-xl bg-[#142338] hover:bg-[#1b2f4a] text-slate-300 hover:text-white transition-colors cursor-pointer"
                title="فتح الرابط لتجربته في تبويب جديد"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick WhatsApp Action Button */}
          <button
            type="button"
            onClick={handleSendWhatsApp}
            className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-bold transition-all flex items-center justify-center gap-2.5 shadow-lg shadow-emerald-600/25 cursor-pointer text-xs sm:text-sm mt-1"
          >
            <MessageCircle className="w-5 h-5 fill-white/20" />
            <span>إرسال رابط تسجيل الدخول للتيم عبر الواتساب 📲</span>
          </button>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-[#080f1a] border-t border-[#16253b] flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
            <span>إنشاء الحسابات وتعيين الصلاحيات يتم بواسطة الأدمن فقط</span>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-[#132238] hover:bg-[#1b2f4a] text-white font-bold transition-colors cursor-pointer"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
