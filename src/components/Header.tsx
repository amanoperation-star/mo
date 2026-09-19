import React from 'react';
import { Send, Sun, Moon, Database, CheckCircle2, MessageSquare } from 'lucide-react';

interface HeaderProps {
  isDarkMode: boolean;
  onToggleTheme: () => void;
  storageStatusText?: string;
  onOpenStorageInfo?: () => void;
  isWhatsConnected?: boolean;
  onOpenWhatsAppScreen?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  isDarkMode,
  onToggleTheme,
  storageStatusText = 'التخزين المحلي متصل (LocalStorage)',
  onOpenStorageInfo,
  isWhatsConnected = true,
  onOpenWhatsAppScreen,
}) => {
  return (
    <header
      id="main-app-header"
      className="w-full bg-[#0a111c] border-b border-[#16253b] px-4 md:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4 transition-colors"
    >
      {/* Right side: Branding & System Name */}
      <div className="flex items-center gap-3.5">
        <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-blue-600 via-blue-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-600/25 ring-1 ring-blue-400/30">
          <Send className="w-5 h-5 text-white -rotate-45 translate-x-0.5 -translate-y-0.5" />
        </div>
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-lg md:text-xl font-extrabold text-white tracking-wide">
              منظومة مستر أشرف السقا
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#132238] text-blue-400 border border-blue-500/30 shadow-inner">
              v5.0 أونلاين 2025
            </span>
          </div>
          <p className="text-xs text-slate-400 font-medium mt-0.5">
            نظام الإدارة الأكاديمية والمالية المتكامل والربط السحابي والواتساب
          </p>
        </div>
      </div>

      {/* Left side: Quick User Profile & Status Badges */}
      <div className="flex flex-wrap items-center gap-2.5">
        {/* User Pill */}
        <div
          id="user-profile-badge"
          className="flex items-center gap-2.5 bg-[#0f172a] border border-[#1e293b] rounded-full px-3 py-1.5 shadow-sm"
        >
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 text-slate-950 font-black flex items-center justify-center text-[11px] shadow-sm">
            أ.س
          </div>
          <div className="flex flex-col leading-tight pl-1">
            <span className="text-xs font-bold text-white">أك. محمود عزت</span>
            <span className="text-[10px] text-amber-400 font-semibold">المدير الإداري والمالي</span>
          </div>
        </div>

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
