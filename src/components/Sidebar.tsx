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
      badge: hasDueInstallments ? `⚠️ ${dueInstallments.length} مستحق` : studentsCount,
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
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer text-right ${
                isActive
                  ? 'bg-[#2563eb] text-white font-bold shadow-lg shadow-blue-600/30 border border-blue-400/40'
                  : 'text-slate-300 hover:text-white hover:bg-[#152336] border border-transparent'
              }`}
            >
              <div className="flex items-center gap-2.5">
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-white shadow-sm" />
                )}
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>

              {item.badge !== undefined && (
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                    item.badgeType === 'success'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : item.badgeType === 'urgent'
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                      : 'bg-[#1a2639] text-slate-300 border-slate-700'
                  }`}
                >
                  {item.badge}
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
          className="bg-[#14191d] border border-amber-500/25 rounded-xl p-3 flex items-center justify-between shadow-sm transition-all"
        >
          <div className="flex items-center gap-2">
            {isDarkMode ? (
              <Moon className="w-4 h-4 text-amber-400 shrink-0 fill-amber-400/20" />
            ) : (
              <Sun className="w-4 h-4 text-amber-500 shrink-0 fill-amber-500/20" />
            )}
            <span className="text-xs font-bold text-amber-300">
              {isDarkMode ? 'المظهر: ليلي (Dark)' : 'المظهر: نهاري (Light)'}
            </span>
          </div>
          <button
            id="theme-appearance-toggle-btn"
            onClick={onToggleTheme}
            type="button"
            className="bg-[#20272c] hover:bg-[#2c363d] text-slate-200 text-xs px-2.5 py-1 rounded-md border border-slate-700 font-semibold cursor-pointer transition-colors"
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

          <div className="text-2xl font-black text-white font-mono tracking-tight flex items-baseline gap-1.5">
            <span>{totalRevenue.toLocaleString('ar-EG')}</span>
            <span className="text-xs font-bold text-slate-400">ج.م</span>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-[#16253b]">
            <button
              id="export-json-sidebar-button"
              onClick={onExportJson}
              type="button"
              className="bg-[#132032] hover:bg-[#1b2d47] border border-[#1f3654] text-xs text-slate-200 py-1.5 px-2 rounded-lg flex items-center justify-center gap-1.5 font-semibold transition-all cursor-pointer"
              title="تصدير قاعدة البيانات كاملة كملف JSON"
            >
              <Download className="w-3.5 h-3.5 text-blue-400" />
              <span>نسخة JSON</span>
            </button>
            <button
              id="export-excel-sidebar-button"
              onClick={onExportExcel}
              type="button"
              className="bg-[#132032] hover:bg-[#1b2d47] border border-[#1f3654] text-xs text-slate-200 py-1.5 px-2 rounded-lg flex items-center justify-center gap-1.5 font-semibold transition-all cursor-pointer"
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
