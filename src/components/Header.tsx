import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Sun,
  Moon,
  Database,
  MessageSquare,
  Phone,
  Globe,
  ExternalLink,
  Bell,
  Cloud,
  CloudOff,
  LogOut,
  ChevronDown,
  Sliders,
  ShieldCheck,
  Activity,
  Crown,
} from 'lucide-react';
import { CenterSettings, StaffMember, AppNotification, NavigationScreen } from '../types';
import { NotificationBell } from './NotificationBell';

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
  currentUser?: StaffMember | null;
  onLogout?: () => void;
  notifications?: AppNotification[];
  onMarkAllAsRead?: () => void;
  onClearNotifications?: () => void;
  onNotificationClick?: (notification: AppNotification) => void;
  onNavigateToScreen?: (screen: NavigationScreen) => void;
  onOpenProductionReset?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  isDarkMode,
  onToggleTheme,
  storageStatusText = 'التخزين نشط',
  onOpenStorageInfo,
  isCloudConnected = false,
  cloudStatusText,
  onOpenCloudSettings,
  isWhatsConnected = false,
  onOpenWhatsAppScreen,
  centerSettings,
  dueInstallmentsCount = 0,
  onNavigateToDueInstallments,
  currentUser,
  onLogout,
  notifications = [],
  onMarkAllAsRead = () => {},
  onClearNotifications = () => {},
  onNotificationClick = () => {},
  onNavigateToScreen,
}) => {
  const currentCenterName = centerSettings?.centerName || 'منظومة مستر أشرف السقا';
  const currentPhone = centerSettings?.phoneNumber || '01029847561';
  const currentUrl = centerSettings?.platformUrl || 'el-sqqa-chem.online';
  const currentYear = centerSettings?.academicYear || 'v5.0 Online 2025';
  const currentDesc = centerSettings?.systemDescription || 'نظام الإدارة الأكاديمية والمالية المتكامل والربط السحابي والواتساب';
  const currentManager = currentUser?.name || centerSettings?.managerName || 'أك. محمود عزت';
  const currentRole = currentUser?.role || 'المدير الإداري والمالي';

  // Profile Dropdown state
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  return (
    <header
      id="main-app-header"
      className="w-full bg-[#070d17] border-b border-[#16253b] px-4 md:px-6 py-3 flex flex-wrap items-center justify-between gap-3 transition-all shadow-md"
    >
      {/* 1. Right Side: Executive Branding & Center Identity */}
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-600/30 ring-1 ring-blue-400/40 shrink-0 relative">
          <Send className="w-5 h-5 text-white -rotate-45 translate-x-0.5 -translate-y-0.5" />
          <div className="absolute inset-0 rounded-2xl bg-cyan-400/20 blur-sm -z-10 animate-pulse"></div>
        </div>

        <div className="flex flex-col">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 id="header-center-name" className="text-base md:text-lg font-black text-white tracking-wide">
              {currentCenterName}
            </h1>
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#0e1c2e] text-cyan-300 border border-cyan-500/30 text-[11px] font-black font-mono shadow-inner" dir="ltr">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_#22d3ee] animate-pulse"></span>
              <span>{currentYear}</span>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 font-semibold hidden sm:block mt-0.5">
            {currentDesc}
          </p>
        </div>
      </div>

      {/* 2. Middle & Left Sections: Consolidated Pill Boxes */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Box 1: Status & Connectivity Pill Container */}
        <div className="flex items-center bg-[#0a1220] border border-[#16273f] rounded-2xl px-3 py-1.5 gap-2.5 shadow-inner text-xs">
          {/* Cloud Status */}
          <button
            onClick={onOpenCloudSettings}
            type="button"
            className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer"
            title="حالة الاتصال بالسحابة"
          >
            <div className="flex flex-col items-end leading-none gap-0.5">
              <span className="text-[10px] font-extrabold text-slate-300">السحابة</span>
              <span className="text-[10px] font-black text-emerald-400">متصلة</span>
            </div>
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400 shadow-[0_0_6px_#34d399]" />
            </span>
          </button>

          {/* Divider */}
          <div className="w-[1px] h-7 bg-[#1b2f4f]"></div>

          {/* WhatsApp Status */}
          <button
            onClick={onOpenWhatsAppScreen}
            type="button"
            className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer"
            title="حالة الواتساب"
          >
            <div className="flex flex-col items-end leading-none gap-0.5">
              <span className="text-[10px] font-extrabold text-slate-300">الواتساب</span>
              <span className={`text-[10px] font-black ${isWhatsConnected ? 'text-emerald-400' : 'text-rose-500'}`}>
                {isWhatsConnected ? 'نشط' : 'غير متصل'}
              </span>
            </div>
            <span className="relative flex h-2 w-2 shrink-0">
              <span className={`relative inline-flex rounded-full h-2 w-2 ${isWhatsConnected ? 'bg-emerald-400 shadow-[0_0_6px_#34d399]' : 'bg-rose-500 shadow-[0_0_6px_#f43f5e]'}`} />
            </span>
          </button>

          {/* Divider */}
          <div className="w-[1px] h-7 bg-[#1b2f4f]"></div>

          {/* Storage Status */}
          <button
            onClick={onOpenStorageInfo}
            type="button"
            className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer"
            title="حالة التخزين"
          >
            <div className="flex flex-col items-end leading-none gap-0.5">
              <span className="text-[10px] font-extrabold text-slate-300">التخزين</span>
              <span className="text-[10px] font-black text-cyan-300">نشط</span>
            </div>
            <Database className="w-4 h-4 text-cyan-400 shrink-0" />
          </button>
        </div>

        {/* Box 2: URL & Phone Pill Container */}
        <div className="flex items-center bg-[#0a1220] border border-[#16273f] rounded-2xl px-3 py-1.5 gap-2.5 shadow-inner text-xs">
          {/* Platform URL */}
          {currentUrl && (
            <a
              href={currentUrl.startsWith('http') ? currentUrl : `https://${currentUrl}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer"
              title={`الانتقال إلى المنصة: ${currentUrl}`}
            >
              <span dir="ltr" className="text-[11px] font-mono text-cyan-200">{currentUrl.replace(/^https?:\/\//, '').replace(/\/$/, '')}</span>
              <Globe className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            </a>
          )}

          {/* Divider */}
          {currentUrl && currentPhone && <div className="w-[1px] h-4 bg-[#1b2f4f]"></div>}

          {/* Phone Contact */}
          {currentPhone && (
            <a
              href={`tel:${currentPhone.replace(/\s+/g, '')}`}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer"
              title={`هاتف التواصل: ${currentPhone}`}
            >
              <span dir="ltr" className="text-[11px] font-mono text-slate-200">{currentPhone}</span>
              <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            </a>
          )}
        </div>

        {/* Box 3: Theme & Notification Bell Pill Container */}
        <div className="flex items-center bg-[#0a1220] border border-[#16273f] rounded-2xl p-1 gap-1 shadow-inner">
          <div className="p-0.5">
            <NotificationBell
              notifications={notifications}
              onMarkAllAsRead={onMarkAllAsRead}
              onClearAll={onClearNotifications}
              onNotificationClick={onNotificationClick}
              onNavigateToScreen={onNavigateToScreen}
            />
          </div>
          <button
            id="theme-toggle-header-button"
            onClick={onToggleTheme}
            type="button"
            title={isDarkMode ? 'التبديل إلى الوضع النهاري' : 'التبديل إلى الوضع الليلي'}
            className="p-2 rounded-xl hover:bg-[#132238] text-amber-400 transition-all cursor-pointer"
          >
            {isDarkMode ? (
              <Moon className="w-4 h-4 fill-amber-400/20" />
            ) : (
              <Sun className="w-4 h-4 text-amber-500 fill-amber-500/20" />
            )}
          </button>
        </div>

        {/* Box 4: User Profile Badge */}
        <div className="relative" ref={profileMenuRef}>
          <button
            type="button"
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2.5 bg-[#0a1220] border border-[#16273f] hover:border-amber-500/50 rounded-2xl p-1.5 pr-3 shadow-inner cursor-pointer transition-all group"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="flex flex-col leading-tight min-w-0 text-right">
                <span className="text-xs font-black text-white truncate flex items-center gap-1">
                  <span>{currentManager}</span>
                  <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${showProfileMenu ? 'rotate-180' : ''}`} />
                </span>
                <span className="text-[10px] text-amber-400 font-extrabold truncate">{currentRole}</span>
              </div>
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 via-amber-600 to-yellow-600 text-slate-950 font-black flex items-center justify-center text-xs shadow-md shrink-0 relative border-2 border-amber-400/80">
                <span className="font-mono font-black text-[11px] tracking-tighter">ع.م</span>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-slate-950 border border-amber-400 flex items-center justify-center text-amber-400 shadow">
                  <Crown className="w-2.5 h-2.5 fill-amber-400" />
                </div>
              </div>
            </div>
          </button>
          {showProfileMenu && (
            <div className="absolute left-0 mt-2 w-64 bg-[#0b1320] border border-[#1d3250] rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 dir-rtl text-right">
              <div className="p-4 bg-[#080f1a] border-b border-[#16253b] flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 text-slate-950 font-black flex items-center justify-center text-xs shrink-0 shadow-md border border-amber-400">
                  <span>ع.م</span>
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-extrabold text-white truncate">{currentManager}</span>
                  <span className="text-[10px] text-slate-400 truncate font-mono">m.ezzat@el-saqqa-chem.online</span>
                </div>
              </div>
              <div className="p-1.5 flex flex-col gap-0.5 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setShowProfileMenu(false);
                    if (onOpenCloudSettings) onOpenCloudSettings();
                  }}
                  className="w-full px-3 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-[#122033] flex items-center gap-2.5 transition-colors cursor-pointer text-right font-bold"
                >
                  <Sliders className="w-4 h-4 text-blue-400" />
                  <span>إعدادات الحساب</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowProfileMenu(false);
                    if (onNavigateToScreen) onNavigateToScreen('staff');
                  }}
                  className="w-full px-3 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-[#122033] flex items-center gap-2.5 transition-colors cursor-pointer text-right font-bold"
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>صلاحيات الأمان</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowProfileMenu(false);
                    if (onNavigateToScreen) onNavigateToScreen('audit-log');
                  }}
                  className="w-full px-3 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-[#122033] flex items-center gap-2.5 transition-colors cursor-pointer text-right font-bold"
                >
                  <Activity className="w-4 h-4 text-purple-400" />
                  <span>سجل النشاطات</span>
                </button>
              </div>
              {onLogout && (
                <div className="p-1.5 bg-[#080f1a] border-t border-[#16253b]">
                  <button
                    type="button"
                    onClick={() => {
                      setShowProfileMenu(false);
                      onLogout();
                    }}
                    className="w-full px-3 py-2 rounded-xl text-rose-400 hover:text-white hover:bg-rose-600 flex items-center gap-2.5 transition-colors cursor-pointer text-right font-extrabold text-xs"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>تسجيل الخروج</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
