import React from 'react';
import { Send, Sun, Moon, Database, MessageSquare, Phone, Globe, ExternalLink, Bell, Cloud, CloudOff, LogOut } from 'lucide-react';
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
  storageStatusText = 'التخزين المحلي متصل',
  onOpenStorageInfo,
  isCloudConnected = false,
  cloudStatusText,
  onOpenCloudSettings,
  isWhatsConnected = true,
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
  const currentUrl = centerSettings?.platformUrl || 'https://el-saqqa-chem.online';
  const currentYear = centerSettings?.academicYear || 'v5.0 2025';
  const currentDesc = centerSettings?.systemDescription || 'الإدارة الأكاديمية والمالية المتكاملة';
  const currentManager = currentUser?.name || centerSettings?.managerName || 'أك. محمود عزت';
  const currentRole = currentUser?.role || 'المدير الإداري والمالي';

  // Manager initials
  const managerInitials = currentManager.split(' ').slice(0, 2).map((w) => w[0]).join('.') || 'أ.س';

  return (
    <header
      id="main-app-header"
      className="w-full bg-[#080e18] border-b border-[#16253b] px-4 md:px-7 py-2.5 flex flex-wrap items-center justify-between gap-3 transition-all"
    >
      {/* 1. Right Side: Executive Branding & Center Identity */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-600/20 ring-1 ring-blue-400/30 shrink-0">
          <Send className="w-4 h-4 text-white -rotate-45 translate-x-0.5 -translate-y-0.5" />
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <h1 id="header-center-name" className="text-base md:text-lg font-black text-white tracking-wide">
              {currentCenterName}
            </h1>
            <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-blue-950/80 text-blue-300 border border-blue-800/50">
              {currentYear}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
            {currentDesc}
          </p>
        </div>
      </div>

      {/* 2. Middle Section: Consolidated System Status Toolbar (No Pill Soup!) */}
      <div className="hidden lg:flex items-center gap-3 bg-[#0a1220] border border-[#16273f] rounded-xl px-3.5 py-1.5 text-xs text-slate-300 shadow-inner">
        {/* Cloud Status */}
        <button
          onClick={onOpenCloudSettings}
          type="button"
          className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer group"
          title="حالة الاتصال بالسحابة (Supabase) - انقر لفتح الإعدادات"
        >
          <span className="relative flex h-2 w-2">
            {isCloudConnected && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            )}
            <span
              className={`relative inline-flex rounded-full h-2 w-2 ${
                isCloudConnected ? 'bg-emerald-400 shadow-[0_0_6px_#34d399]' : 'bg-rose-500 shadow-[0_0_6px_#f43f5e]'
              }`}
            />
          </span>
          {isCloudConnected ? (
            <Cloud className="w-3.5 h-3.5 text-emerald-400" />
          ) : (
            <CloudOff className="w-3.5 h-3.5 text-rose-400" />
          )}
          <span className="font-medium text-[11px]">
            {isCloudConnected ? 'السحابة متصلة' : 'السحابة غير متصلة'}
          </span>
        </button>

        <span className="w-px h-3.5 bg-[#1a2c47]" />

        {/* WhatsApp Status */}
        <button
          onClick={onOpenWhatsAppScreen}
          type="button"
          className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer group"
          title="حالة بوابة الواتساب - انقر للتفعيل"
        >
          <span className="relative flex h-2 w-2">
            {isWhatsConnected && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            )}
            <span
              className={`relative inline-flex rounded-full h-2 w-2 ${
                isWhatsConnected ? 'bg-emerald-400 shadow-[0_0_6px_#34d399]' : 'bg-rose-500'
              }`}
            />
          </span>
          <MessageSquare className={`w-3.5 h-3.5 ${isWhatsConnected ? 'text-emerald-400' : 'text-rose-400'}`} />
          <span className="font-medium text-[11px]">
            {isWhatsConnected ? 'الواتساب مفعل' : 'الواتساب غير متصل'}
          </span>
        </button>

        <span className="w-px h-3.5 bg-[#1a2c47]" />

        {/* Local Database */}
        <button
          onClick={onOpenStorageInfo}
          type="button"
          className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer"
          title="حالة قاعدة البيانات المحلية"
        >
          <Database className="w-3.5 h-3.5 text-blue-400" />
          <span className="font-medium text-[11px] text-slate-300">التخزين المحلي نشط</span>
        </button>

        <span className="w-px h-3.5 bg-[#1a2c47]" />

        {/* Platform URL Link */}
        {currentUrl && (
          <a
            href={currentUrl.startsWith('http') ? currentUrl : `https://${currentUrl}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 transition-colors font-mono text-[11px]"
            title={`الانتقال إلى المنصة: ${currentUrl}`}
          >
            <Globe className="w-3.5 h-3.5 text-cyan-400" />
            <span dir="ltr" className="truncate max-w-[130px]">{currentUrl.replace(/^https?:\/\//, '').replace(/\/$/, '')}</span>
            <ExternalLink className="w-2.5 h-2.5 opacity-70" />
          </a>
        )}

        <span className="w-px h-3.5 bg-[#1a2c47]" />

        {/* Phone Contact */}
        {currentPhone && (
          <a
            href={`tel:${currentPhone.replace(/\s+/g, '')}`}
            className="flex items-center gap-1 text-slate-300 hover:text-white transition-colors font-mono text-[11px]"
            title={`هاتف التواصل: ${currentPhone}`}
          >
            <Phone className="w-3.5 h-3.5 text-blue-400" />
            <span dir="ltr">{currentPhone}</span>
          </a>
        )}
      </div>

      {/* 3. Left Side: Action Icons & Executive User Profile */}
      <div className="flex items-center gap-2">
        {/* Due Installments Alert Badge */}
        {dueInstallmentsCount > 0 && onNavigateToDueInstallments && (
          <button
            id="header-due-installments-pill"
            type="button"
            onClick={onNavigateToDueInstallments}
            title={`يوجد ${dueInstallmentsCount} أقساط مستحقة - انقر للعرض`}
            className="flex items-center gap-1.5 bg-rose-950/80 hover:bg-rose-900 border border-rose-500/50 text-rose-200 text-xs px-3 py-1.5 rounded-xl font-bold transition-all shadow-sm cursor-pointer animate-pulse"
          >
            <Bell className="w-3.5 h-3.5 text-rose-400" />
            <span>{dueInstallmentsCount} قسط مستحق</span>
          </button>
        )}

        {/* Live Notification Bell Dropdown Component */}
        <NotificationBell
          notifications={notifications}
          onMarkAllAsRead={onMarkAllAsRead}
          onClearAll={onClearNotifications}
          onNotificationClick={onNotificationClick}
          onNavigateToScreen={onNavigateToScreen}
        />

        {/* Dark/Light Theme Icon Button */}
        <button
          id="theme-toggle-header-button"
          onClick={onToggleTheme}
          type="button"
          title={isDarkMode ? 'التبديل إلى الوضع النهاري (Light Mode)' : 'التبديل إلى الوضع الليلي (Dark Mode)'}
          className="p-2 rounded-xl bg-[#0e1726] hover:bg-[#16243a] border border-[#1b2c45] text-amber-400 transition-all cursor-pointer shadow-sm"
        >
          {isDarkMode ? (
            <Moon className="w-4 h-4 fill-amber-400/20" />
          ) : (
            <Sun className="w-4 h-4 text-amber-500 fill-amber-500/20" />
          )}
        </button>

        {/* Executive User Profile Badge */}
        <div className="flex items-center gap-2 bg-[#0d1624] border border-[#1a2d48] rounded-xl p-1 pr-2.5 shadow-sm">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 text-slate-950 font-black flex items-center justify-center text-[10px] shadow-sm shrink-0">
              {managerInitials}
            </div>
            <div className="flex flex-col leading-tight min-w-0 max-w-[120px] sm:max-w-[150px]">
              <span className="text-xs font-bold text-white truncate">{currentManager}</span>
              <span className="text-[10px] text-amber-400/90 font-semibold truncate">{currentRole}</span>
            </div>
          </div>

          {onLogout && (
            <button
              onClick={onLogout}
              type="button"
              title="تسجيل الخروج من المنظومة"
              className="p-1.5 rounded-lg bg-[#142238] hover:bg-rose-600 hover:text-white text-rose-300 transition-all cursor-pointer shrink-0 border border-[#1e3250]"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
