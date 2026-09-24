import React from 'react';
import { Send, Sun, Moon, Database, CheckCircle2, MessageSquare, Phone, Globe, ExternalLink, Bell, Cloud, CloudOff } from 'lucide-react';
import { CenterSettings } from '../types';

interface HeaderProps {
  isDarkMode: boolean;
  onToggleTheme: () => void;
  storageStatusText?: string;
  onOpenStorageInfo?: () => void;
  isCloudConnected?: boolean;
  cloudStatusText?: string;
  onOpenCloudSettings?: () => void;
  isWhatsConnected?: boolean;
  onOpenWhatsAppScreen?: () => void;
  centerSettings?: CenterSettings;
  dueInstallmentsCount?: number;
  onNavigateToDueInstallments?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  isDarkMode,
  onToggleTheme,
  storageStatusText = 'التخزين المحلي متصل (LocalStorage)',
  onOpenStorageInfo,
  isCloudConnected = false,
  cloudStatusText,
  onOpenCloudSettings,
  isWhatsConnected = true,
  onOpenWhatsAppScreen,
  centerSettings,
  dueInstallmentsCount = 0,
  onNavigateToDueInstallments,
}) => {
  const currentCenterName = centerSettings?.centerName || 'منظومة مستر أشرف السقا';
  const currentPhone = centerSettings?.phoneNumber || '01029847561';
  const currentUrl = centerSettings?.platformUrl || 'https://el-saqqa-chem.online';
  const currentYear = centerSettings?.academicYear || 'v5.0 أونلاين 2025';
  const currentDesc = centerSettings?.systemDescription || 'نظام الإدارة الأكاديمية والمالية المتكامل والربط السحابي والواتساب';
  const currentManager = centerSettings?.managerName || 'أك. محمود عزت';

  // Manager initials
  const managerInitials = currentManager.split(' ').slice(0, 2).map((w) => w[0]).join('.') || 'أ.س';

  return (
    <header
      id="main-app-header"
      className="w-full bg-[#0a111c] border-b border-[#16253b] px-4 md:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4 transition-colors"
    >
      {/* Right side: Branding & Center Name */}
      <div className="flex items-center gap-3.5">
        <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-blue-600 via-blue-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-600/25 ring-1 ring-blue-400/30">
          <Send className="w-5 h-5 text-white -rotate-45 translate-x-0.5 -translate-y-0.5" />
        </div>
        <div>
          <div className="flex items-center gap-2.5">
            <h1 id="header-center-name" className="text-lg md:text-xl font-extrabold text-white tracking-wide">
              {currentCenterName}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#132238] text-blue-400 border border-blue-500/30 shadow-inner">
              {currentYear}
            </span>
          </div>
          <p className="text-xs text-slate-400 font-medium mt-0.5">
            {currentDesc}
          </p>
        </div>
      </div>

      {/* Left side: Center Quick Info, Profile & Badges */}
      <div className="flex flex-wrap items-center gap-2.5">
        {/* Platform URL Pill in Header */}
        {currentUrl && (
          <a
            id="header-platform-url-link"
            href={currentUrl.startsWith('http') ? currentUrl : `https://${currentUrl}`}
            target="_blank"
            rel="noreferrer"
            title={`الانتقال إلى المنصة الرسمية: ${currentUrl}`}
            className="flex items-center gap-1.5 bg-[#082029] border border-cyan-500/40 hover:border-cyan-400 text-cyan-300 text-xs px-3 py-1.5 rounded-full font-bold transition-all shadow-sm hover:shadow-cyan-500/10"
          >
            <Globe className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span dir="ltr" className="font-mono text-[11px] tracking-tight truncate max-w-[140px] sm:max-w-[180px]">
              {currentUrl.replace(/^https?:\/\//, '').replace(/\/$/, '')}
            </span>
            <ExternalLink className="w-3 h-3 text-cyan-400/70 shrink-0" />
          </a>
        )}

        {/* Center Phone Number Pill in Header */}
        {currentPhone && (
          <a
            id="header-phone-contact-link"
            href={`tel:${currentPhone.replace(/\s+/g, '')}`}
            title={`رقم التواصل بالمركز: ${currentPhone}`}
            className="flex items-center gap-1.5 bg-[#0b1c2e] border border-blue-500/40 hover:border-blue-400 text-blue-300 text-xs px-3 py-1.5 rounded-full font-bold transition-all shadow-sm hover:shadow-blue-500/10"
          >
            <Phone className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            <span dir="ltr" className="font-mono text-[11px] tracking-tight">{currentPhone}</span>
          </a>
        )}

        {/* User Pill */}
        <div
          id="user-profile-badge"
          className="flex items-center gap-2.5 bg-[#0f172a] border border-[#1e293b] rounded-full px-3 py-1.5 shadow-sm"
        >
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 text-slate-950 font-black flex items-center justify-center text-[11px] shadow-sm">
            {managerInitials}
          </div>
          <div className="flex flex-col leading-tight pl-1">
            <span className="text-xs font-bold text-white">{currentManager}</span>
            <span className="text-[10px] text-amber-400 font-semibold">المدير الإداري والمالي</span>
          </div>
        </div>

        {/* Installment Due Alert Quick Header Button */}
        {dueInstallmentsCount > 0 && onNavigateToDueInstallments && (
          <button
            id="header-due-installments-pill"
            type="button"
            onClick={onNavigateToDueInstallments}
            title={`يوجد ${dueInstallmentsCount} أقساط مستحقة أو متأخرة - انقر للعرض والمتابعة في السجل`}
            className="flex items-center gap-2 bg-[#1c1017] border border-rose-500/40 hover:border-rose-400 text-rose-300 text-xs px-3.5 py-1.5 rounded-full font-bold transition-all shadow-sm cursor-pointer hover:shadow-rose-500/10"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500" />
            </span>
            <Bell className="w-3.5 h-3.5 text-rose-400" />
            <span>{dueInstallmentsCount} أقساط مستحقة</span>
          </button>
        )}

        {/* WhatsApp Connection Indicator Pill */}
        <button
          id="whatsapp-gateway-header-button"
          onClick={onOpenWhatsAppScreen}
          type="button"
          title="حالة اتصال بوابة الواتساب وإرسال الإيصالات التلقائية"
          className={`flex items-center gap-2 text-xs px-3.5 py-1.5 rounded-full font-bold transition-all shadow-sm cursor-pointer border ${
            isWhatsConnected
              ? 'bg-[#081b16] border-emerald-500/40 hover:border-emerald-400 text-emerald-300'
              : 'bg-[#1e0e13] border-rose-500/40 hover:border-rose-400 text-rose-300'
          }`}
        >
          <span className="relative flex h-2 w-2">
            {isWhatsConnected && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            )}
            <span
              className={`relative inline-flex rounded-full h-2 w-2 ${
                isWhatsConnected ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]' : 'bg-rose-500'
              }`}
            ></span>
          </span>
          <MessageSquare className="w-3.5 h-3.5" />
          <span>{isWhatsConnected ? 'الواتساب مربوط ومفعل' : 'الواتساب غير متصل'}</span>
        </button>

        {/* Cloud Storage (Supabase) Indicator Pill */}
        <button
          id="cloud-storage-indicator-button"
          onClick={onOpenCloudSettings}
          type="button"
          title={
            isCloudConnected
              ? 'حالة السحابة: متصل ومستقر (Supabase) - انقر لفتح إعدادات الربط والمزامنة'
              : 'حالة السحابة: غير متصل (Supabase) - انقر هنا لربط المنظومة بالسحابة وحفظ البيانات أونلاين'
          }
          className={`flex items-center gap-2 text-xs px-3.5 py-1.5 rounded-full font-bold transition-all shadow-sm cursor-pointer border ${
            isCloudConnected
              ? 'bg-[#081b16] border-emerald-500/40 hover:border-emerald-400 text-emerald-300 hover:shadow-emerald-500/10'
              : 'bg-[#1e0e13] border-rose-500/40 hover:border-rose-400 text-rose-300 hover:shadow-rose-500/10'
          }`}
        >
          <span className="relative flex h-2 w-2">
            {isCloudConnected && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            )}
            <span
              className={`relative inline-flex rounded-full h-2 w-2 ${
                isCloudConnected ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]' : 'bg-rose-500 shadow-[0_0_6px_#f43f5e]'
              }`}
            ></span>
          </span>
          {isCloudConnected ? (
            <Cloud className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          ) : (
            <CloudOff className="w-3.5 h-3.5 text-rose-400 shrink-0" />
          )}
          <span>
            {cloudStatusText || (isCloudConnected ? 'السحابة متصلة (Supabase)' : 'السحابة غير متصلة')}
          </span>
        </button>

        {/* Local Storage Pill */}
        <button
          id="local-storage-indicator-button"
          onClick={onOpenStorageInfo}
          type="button"
          title="حالة اتصال التخزين المحلي والنسخ الاحتياطي"
          className="flex items-center gap-2 bg-[#0c1b18] border border-emerald-500/40 hover:border-emerald-400 text-emerald-300 text-xs px-3.5 py-1.5 rounded-full font-semibold transition-all shadow-sm cursor-pointer"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400 shadow-[0_0_8px_#34d399]"></span>
          </span>
          <Database className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>{storageStatusText}</span>
        </button>

        {/* Theme Toggle Pill */}
        <button
          id="theme-toggle-header-button"
          onClick={onToggleTheme}
          type="button"
          title={isDarkMode ? 'التبديل إلى الوضع النهاري (Light Mode)' : 'التبديل إلى الوضع الليلي (Dark Mode)'}
          className="flex items-center gap-2 bg-[#1b1a13] border border-amber-500/30 hover:border-amber-400 text-amber-300 text-xs px-3.5 py-1.5 rounded-full font-bold transition-all shadow-sm cursor-pointer"
        >
          {isDarkMode ? (
            <>
              <Moon className="w-3.5 h-3.5 text-amber-400 fill-amber-400/20" />
              <span>الوضع الليلي (تفعيل النهاري ☀️)</span>
            </>
          ) : (
            <>
              <Sun className="w-3.5 h-3.5 text-amber-500 fill-amber-500/20" />
              <span>الوضع النهاري (تفعيل الليلي 🌙)</span>
            </>
          )}
        </button>
      </div>
    </header>
  );
};
