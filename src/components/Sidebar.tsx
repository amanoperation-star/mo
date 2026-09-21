import React from 'react';
import {
  UserPlus,
  Users,
  Wallet,
  Coins,
  BarChart3,
  MessageSquare,
  BookOpen,
  ShieldCheck,
  Activity,
  Settings,
  Sun,
  Moon,
  TrendingUp,
  Download,
  FileSpreadsheet,
} from 'lucide-react';
import { NavigationScreen, Student } from '../types';
import { InstallmentInfo } from '../utils/installmentUtils';
import { InstallmentAlertSidebarCard } from './InstallmentAlertSidebarCard';

interface SidebarProps {
  currentScreen: NavigationScreen;
  onSelectScreen: (screen: NavigationScreen) => void;
  studentsCount: number;
  totalRevenue: number;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  onExportJson: () => void;
  onExportExcel: () => void;
  isWhatsConnected?: boolean;
  dueInstallments?: Array<{ student: Student; info: InstallmentInfo }>;
  onOpenInstallmentSettle?: (student: Student) => void;
  onOpenWhatsAppReminder?: (student: Student) => void;
  onNavigateToDueInstallments?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentScreen,
  onSelectScreen,
  studentsCount,
  totalRevenue,
  isDarkMode,
  onToggleTheme,
  onExportJson,
  onExportExcel,
  isWhatsConnected = true,
  dueInstallments = [],
  onOpenInstallmentSettle,
  onOpenWhatsAppReminder,
  onNavigateToDueInstallments,
}) => {
  const hasDueInstallments = dueInstallments.length > 0;

  const navItems: {
    id: NavigationScreen;
    label: string;
    icon: React.ElementType;
    badge?: string | number;
    badgeType?: 'default' | 'urgent' | 'success';
  }[] = [
    {
      id: 'new-student',
      label: 'تسجيل طالب جديد',
      icon: UserPlus,
    },
    {
      id: 'students-list',
      label: 'سجل ومدفوعات الطلاب',
      icon: Users,
      badge: hasDueInstallments
        ? `⚠️ ${dueInstallments.length.toLocaleString('en-US')} مستحق`
        : studentsCount.toLocaleString('en-US'),
      badgeType: hasDueInstallments ? 'urgent' : 'default',
    },
    {
      id: 'expenses',
      label: 'المصروفات والأرباح P&L',
      icon: Wallet,
      badge: 'هام',
      badgeType: 'urgent',
    },
    {
      id: 'salaries',
      label: 'رواتب فريق العمل',
      icon: Coins,
    },
    {
      id: 'analytics',
      label: 'لوحة المؤشرات والتحليلات',
      icon: BarChart3,
    },
    {
      id: 'whatsapp',
      label: 'ربط وتفعيل الواتساب',
      icon: MessageSquare,
      badge: isWhatsConnected ? 'متصل' : 'غير متصل',
      badgeType: isWhatsConnected ? 'success' : 'urgent',
    },
    {
      id: 'courses',
      label: 'إدارة وتعديل الكورسات',
      icon: BookOpen,
    },
    {
      id: 'staff',
      label: 'فريق العمل والصلاحيات',
      icon: ShieldCheck,
    },
    {
      id: 'audit-log',
      label: 'سجل الرقابة (Audit Log)',
      icon: Activity,
    },
    {
      id: 'settings',
      label: 'إعدادات السحابة Supabase',
      icon: Settings,
    },
  ];

  return (
    <aside
      id="system-navigation-sidebar"
      className="w-full lg:w-72 shrink-0 bg-[#0d1522] border border-[#1a2b42] rounded-2xl p-3.5 flex flex-col gap-4 shadow-xl"
    >
      {/* Title */}
      <div className="px-2 pt-1 flex items-center justify-between">
        <span className="text-xs font-bold text-slate-400">شاشات المنظومة</span>
        <span className="text-[10px] text-blue-400/80 font-semibold bg-blue-950/60 px-2 py-0.5 rounded-md border border-blue-800/40">
          لوحة الإدارة
        </span>
      </div>

      {/* Navigation List */}
      <nav className="flex flex-col gap-1.5" aria-label="شاشات المنظومة">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentScreen === item.id;
          return (
            <button
              key={item.id}
              id={`nav-item-${item.id}`}
              onClick={() => onSelectScreen(item.id)}
              type="button"
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer text-right group ${
                isActive
                  ? 'bg-[#2563eb] text-white font-bold shadow-lg shadow-blue-600/30 border border-blue-400/40 active-nav-button'
                  : isDarkMode
                  ? 'text-slate-300 hover:text-white hover:bg-[#152336] border border-transparent'
                  : 'text-slate-700 hover:text-blue-700 hover:bg-blue-50/90 active:bg-blue-100 border border-transparent bg-transparent'
              }`}
            >
              <div className="flex items-center gap-2.5">
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-white shadow-sm shrink-0" />
                )}
                <Icon
                  className={`w-4 h-4 shrink-0 transition-colors ${
                    isActive
                      ? 'text-white'
                      : isDarkMode
                      ? 'text-slate-400 group-hover:text-white'
                      : 'text-slate-500 group-hover:text-blue-600'
                  }`}
                />
                <span
                  className={
                    isActive
                      ? 'text-white font-bold'
                      : isDarkMode
                      ? 'text-slate-300 group-hover:text-white'
                      : 'text-slate-700 group-hover:text-blue-700 font-medium'
                  }
                >
                  {item.label}
                </span>
              </div>

              {item.badge !== undefined && (
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-full border font-mono ${
                    item.badgeType === 'success'
                      ? isDarkMode
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : 'bg-emerald-100 text-emerald-700 border-emerald-300'
                      : item.badgeType === 'urgent'
                      ? isDarkMode
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                        : 'bg-rose-100 text-rose-700 border-rose-300'
                      : isActive
                      ? 'bg-blue-700 text-white border-blue-400/40'
                      : isDarkMode
                      ? 'bg-[#1a2639] text-slate-300 border-slate-700'
                      : 'bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                  dir="ltr"
                >
                  {typeof item.badge === 'number'
                    ? item.badge.toLocaleString('en-US')
                    : item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Installment Alerts Card (Main Menu Alert Feature) */}
      <InstallmentAlertSidebarCard
        dueInstallments={dueInstallments}
        onOpenSettle={onOpenInstallmentSettle}
        onOpenWhatsAppReminder={onOpenWhatsAppReminder}
        onViewAllInList={onNavigateToDueInstallments}
      />

      {/* Spacer */}
      <div className="mt-auto flex flex-col gap-3 pt-2">
        {/* Appearance Card */}
        <div
          id="theme-appearance-card"
          className={`rounded-xl p-3 flex items-center justify-between shadow-sm transition-all border ${
            isDarkMode
              ? 'bg-[#14191d] border-amber-500/25'
              : 'bg-amber-50/80 border-amber-200/80'
          }`}
        >
          <div className="flex items-center gap-2">
            {isDarkMode ? (
              <Moon className="w-4 h-4 text-amber-400 shrink-0 fill-amber-400/20" />
            ) : (
              <Sun className="w-4 h-4 text-amber-600 shrink-0 fill-amber-500/20" />
            )}
            <span className={`text-xs font-bold ${isDarkMode ? 'text-amber-300' : 'text-amber-900'}`}>
              {isDarkMode ? 'المظهر: ليلي (Dark)' : 'المظهر: نهاري (Light)'}
            </span>
          </div>
          <button
            id="theme-appearance-toggle-btn"
            onClick={onToggleTheme}
            type="button"
            className={`text-xs px-2.5 py-1 rounded-md border font-semibold cursor-pointer transition-colors ${
              isDarkMode
                ? 'bg-[#20272c] hover:bg-[#2c363d] text-slate-200 border-slate-700'
                : 'bg-white hover:bg-amber-100 text-amber-900 border-amber-300 shadow-sm'
            }`}
          >
            {isDarkMode ? 'تبديل للنهاري ☀️' : 'تبديل لليلي 🌙'}
          </button>
        </div>

        {/* Revenue & Quick Export Card */}
        <div
          id="revenue-summary-sidebar-card"
          className="bg-[#0b1320] border border-[#1b2f48] rounded-xl p-3.5 flex flex-col gap-2.5 shadow-md"
        >
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
            <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
              <TrendingUp className="w-4 h-4" />
              <span>إجمالي الإيرادات</span>
            </div>
            <span className="text-[10px] bg-emerald-950/60 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-800/40">
              محدث
            </span>
          </div>

          <div className="text-2xl font-black text-white font-mono tracking-tight flex items-baseline gap-1.5" dir="ltr">
            <span>{totalRevenue.toLocaleString('en-US')}</span>
            <span className="text-xs font-bold text-slate-400 font-sans">ج.م</span>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-[#16253b]">
            <button
              id="export-json-sidebar-button"
              onClick={onExportJson}
              type="button"
              className={`border text-xs py-1.5 px-2 rounded-lg flex items-center justify-center gap-1.5 font-semibold transition-all cursor-pointer ${
                isDarkMode
                  ? 'bg-[#132032] hover:bg-[#1b2d47] border-[#1f3654] text-slate-200'
                  : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700'
              }`}
              title="تصدير قاعدة البيانات كاملة كملف JSON"
            >
              <Download className="w-3.5 h-3.5 text-blue-400" />
              <span>نسخة JSON</span>
            </button>
            <button
              id="export-excel-sidebar-button"
              onClick={onExportExcel}
              type="button"
              className={`border text-xs py-1.5 px-2 rounded-lg flex items-center justify-center gap-1.5 font-semibold transition-all cursor-pointer ${
                isDarkMode
                  ? 'bg-[#132032] hover:bg-[#1b2d47] border-[#1f3654] text-slate-200'
                  : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700'
              }`}
              title="تصدير سجل الطلاب إلى ملف Excel / CSV"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              <span>ملف Excel</span>
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};
