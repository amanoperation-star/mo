import React from 'react';
import {
  BarChart3,
  Users,
  CreditCard,
  UserPlus,
  ArrowUpRight,
  MessageCircle,
  Cloud,
  GraduationCap,
  Wallet,
} from 'lucide-react';
import { Student, Course, StaffMember } from '../../types';
import { formatNumber } from '../../utils/formatters';

interface AnalyticsScreenProps {
  students: Student[];
  courses: Course[];
  totalRevenue: number;
  currentUser?: StaffMember | null;
  isWhatsConnected?: boolean;
  isCloudConnected?: boolean;
  onNavigateToRegister?: () => void;
  onNavigateToStudentsList?: () => void;
  onNavigateToExpenses?: () => void;
  onNavigateToWhatsApp?: () => void;
  onNavigateToSettings?: () => void;
}

export const AnalyticsScreen: React.FC<AnalyticsScreenProps> = ({
  students,
  courses,
  totalRevenue,
  currentUser,
  isWhatsConnected = false,
  isCloudConnected = false,
  onNavigateToRegister,
  onNavigateToStudentsList,
  onNavigateToExpenses,
  onNavigateToWhatsApp,
  onNavigateToSettings,
}) => {
  const displayName = currentUser?.name || 'أك. محمود عزت';

  // Read customized Banner Texts from localStorage (updated via General Settings)
  const badgeText = localStorage.getItem('el_saqqa_banner_badge') || 'لوحة التحكم الاحترافية الممتازة';
  const titleText = localStorage.getItem('el_saqqa_banner_title') || `مرحباً بك مجدداً، ${displayName}`;
  const descText =
    localStorage.getItem('el_saqqa_banner_desc') ||
    'هذا نموذج المعاينة الخاص بالتصميم الجديد لمنظومة مستر أشرف السقا 2025. تم تصميم الهيدر واللوحة خصيصاً ليوافق مع أحدث معايير تجربة المستخدم (UI/UX) مع تحسين المظهر البصري لبيانات الحالة ومؤشرات الأداء.';

  return (
    <div
      id="analytics-dashboard-screen"
      className="flex-1 flex flex-col gap-6 text-right animate-in fade-in duration-300"
    >
      {/* 1. Hero Welcome Banner (Clean, matching reference image 100%) */}
      <div className="premium-list-card relative overflow-hidden flex flex-col gap-6 p-6 sm:p-8">
        {/* Top badge, header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex flex-col gap-2.5 flex-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-black shadow-inner self-start">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
              <span>{badgeText}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2.5 flex-wrap">
              <span>{titleText}</span>
              <span className="inline-block animate-bounce">👋</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 font-semibold max-w-3xl leading-relaxed">
              {descText}
            </p>
          </div>

          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-cyan-500 flex items-center justify-center shadow-xl shadow-blue-500/25 shrink-0 self-start sm:self-center border border-blue-400/30">
            <BarChart3 className="w-7 h-7 text-white" />
          </div>
        </div>

        {/* Action Buttons inside Hero Banner */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-[#16273f]">
          <button
            onClick={onNavigateToExpenses}
            className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold py-2.5 px-5 rounded-xl text-xs flex items-center gap-2 cursor-pointer transition-all duration-300 shadow-md hover:shadow-cyan-500/25 active:scale-95"
          >
            <CreditCard className="w-4 h-4 text-cyan-200" />
            <span>تقارير النظام المالية</span>
          </button>

          <button
            onClick={onNavigateToStudentsList}
            className="bg-[#132238] hover:bg-[#1a2e4c] border border-blue-500/30 text-blue-300 font-bold py-2.5 px-5 rounded-xl text-xs flex items-center gap-2 cursor-pointer transition-all duration-300 active:scale-95 shadow-inner"
          >
            <Users className="w-4 h-4 text-blue-400" />
            <span>إدارة الطلاب والصفوف</span>
          </button>

          {onNavigateToRegister && (
            <button
              onClick={onNavigateToRegister}
              className="bg-[#111f32] hover:bg-[#182c46] border border-slate-700 text-slate-300 hover:text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center gap-2 cursor-pointer transition-all duration-300 active:scale-95"
            >
              <UserPlus className="w-4 h-4 text-emerald-400" />
              <span>تسجيل طالب جديد</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Executive KPI & Status Cards (Matching image.png exactly) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4.5">
        {/* Card 1: Daily Collection */}
        <div
          onClick={onNavigateToExpenses}
          className="premium-list-card flex flex-col justify-between gap-4 cursor-pointer hover:border-amber-500/50 transition-all group"
        >
          <div className="flex items-center justify-between border-b border-[#14233a]/60 pb-2">
            <span className="text-xs text-slate-400 font-extrabold group-hover:text-amber-300 transition-colors">
              التحصيل المالي اليومي
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-amber-400 font-sans tracking-tight" dir="ltr">
              EGP {formatNumber(totalRevenue)}{' '}
            </div>
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 mt-2">
              <span className="text-emerald-400 font-extrabold">تم استلام {students.length} عملية</span>
              <span className="text-slate-500 group-hover:text-amber-400 transition-colors">عرض التفاصيل ←</span>
            </div>
          </div>
        </div>

        {/* Card 2: WhatsApp status */}
        <div
          onClick={onNavigateToWhatsApp}
          className={`premium-list-card flex flex-col justify-between gap-4 cursor-pointer transition-all group ${
            isWhatsConnected ? 'hover:border-emerald-500/50' : 'hover:border-pink-500/50'
          }`}
        >
          <div className="flex items-center justify-between border-b border-[#14233a]/60 pb-2">
            <span className={`text-xs text-slate-400 font-extrabold transition-colors ${
              isWhatsConnected ? 'group-hover:text-emerald-300' : 'group-hover:text-pink-300'
            }`}>
              رسائل الواتساب
            </span>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              isWhatsConnected ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' : 'bg-pink-500/10 border border-pink-500/20 text-pink-400'
            }`}>
              <MessageCircle className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className={`text-xl sm:text-2xl font-black font-sans tracking-tight ${
              isWhatsConnected ? 'text-emerald-400' : 'text-pink-400'
            }`}>
              {isWhatsConnected ? 'متصل ونشط' : 'تحتاج ربط'}
            </div>
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 mt-2">
              <span className={isWhatsConnected ? 'text-emerald-400' : 'text-pink-300'}>
                {isWhatsConnected ? 'النظام جاهز لإرسال الرسائل' : 'اضغط هنا لإعادة الربط'}
              </span>
              <span className={`text-slate-500 transition-colors ${
                isWhatsConnected ? 'group-hover:text-emerald-400' : 'group-hover:text-pink-400'
              }`}>إعدادات الواتساب ←</span>
            </div>
          </div>
        </div>

        {/* Card 3: Cloud connection status */}
        <div
          onClick={onNavigateToSettings}
          className={`premium-list-card flex flex-col justify-between gap-4 cursor-pointer transition-all group ${
            isCloudConnected ? 'hover:border-emerald-500/50' : 'hover:border-cyan-500/50'
          }`}
        >
          <div className="flex items-center justify-between border-b border-[#14233a]/60 pb-2">
            <span className={`text-xs text-slate-400 font-extrabold transition-colors ${
              isCloudConnected ? 'group-hover:text-emerald-300' : 'group-hover:text-cyan-300'
            }`}>
              حالة الربط السحابي
            </span>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              isCloudConnected ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' : 'bg-cyan-500/10 border border-cyan-500/20 text-cyan-400'
            }`}>
              <Cloud className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className={`text-xl sm:text-2xl font-black font-sans tracking-tight ${
              isCloudConnected ? 'text-emerald-400' : 'text-cyan-300'
            }`}>
              {isCloudConnected ? 'مستقر (99.9%)' : 'غير متصل بالسحابة'}
            </div>
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 mt-2">
              <span className={isCloudConnected ? 'text-emerald-400' : 'text-cyan-300'}>
                {isCloudConnected ? 'آخر مزامنة منذ دقيقة' : 'فشل المزامنة التلقائية'}
              </span>
              <span className={`text-slate-500 transition-colors ${
                isCloudConnected ? 'group-hover:text-emerald-400' : 'group-hover:text-cyan-400'
              }`}>الإعدادات ←</span>
            </div>
          </div>
        </div>

        {/* Card 4: Total registered students */}
        <div
          onClick={onNavigateToStudentsList}
          className="premium-list-card flex flex-col justify-between gap-4 cursor-pointer hover:border-blue-500/50 transition-all group"
        >
          <div className="flex items-center justify-between border-b border-[#14233a]/60 pb-2">
            <span className="text-xs text-slate-400 font-extrabold group-hover:text-blue-300 transition-colors">
              إجمالي الطلاب المسجلين
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <GraduationCap className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-white font-sans tracking-tight" dir="ltr">
              {students.length.toLocaleString('en-US')}
            </div>
            <div className="flex items-center justify-between text-[11px] font-bold text-emerald-400 mt-2">
              <span className="flex items-center gap-0.5" dir="ltr">
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>+12% هذا الشهر</span>
              </span>
              <span className="text-slate-500 group-hover:text-blue-400 transition-colors">عرض السجل ←</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
