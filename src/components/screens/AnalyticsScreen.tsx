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

  // Read customized KPI Card styling from localStorage
  const cardFontSize = localStorage.getItem('el_saqqa_card_font_size') || 'normal';
  const card1Color = localStorage.getItem('el_saqqa_card1_color') || 'amber';
  const card2Color = localStorage.getItem('el_saqqa_card2_color') || 'rose';
  const card3Color = localStorage.getItem('el_saqqa_card3_color') || 'emerald';
  const card4Color = localStorage.getItem('el_saqqa_card4_color') || 'white';

  const fontSizeClass = {
    small: 'text-lg sm:text-xl',
    normal: 'text-2xl sm:text-3xl',
    large: 'text-3xl sm:text-4xl',
    xl: 'text-4xl sm:text-5xl',
  }[cardFontSize] || 'text-2xl sm:text-3xl';

  const colorMap: Record<string, { text: string; bg: string; border: string; hover: string; hoverText: string }> = {
    amber: {
      text: 'text-amber-400',
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/20',
      hover: 'hover:border-amber-500/50',
      hoverText: 'group-hover:text-amber-300'
    },
    emerald: {
      text: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20',
      hover: 'hover:border-emerald-500/50',
      hoverText: 'group-hover:text-emerald-300'
    },
    rose: {
      text: 'text-rose-400',
      bg: 'bg-rose-500/10',
      border: 'border-rose-500/20',
      hover: 'hover:border-rose-500/50',
      hoverText: 'group-hover:text-rose-300'
    },
    cyan: {
      text: 'text-cyan-400',
      bg: 'bg-cyan-500/10',
      border: 'border-cyan-500/20',
      hover: 'hover:border-cyan-500/50',
      hoverText: 'group-hover:text-cyan-300'
    },
    blue: {
      text: 'text-blue-400',
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/20',
      hover: 'hover:border-blue-500/50',
      hoverText: 'group-hover:text-blue-300'
    },
    white: {
      text: 'text-white',
      bg: 'bg-slate-500/10',
      border: 'border-slate-500/20',
      hover: 'hover:border-slate-500/50',
      hoverText: 'group-hover:text-slate-300'
    }
  };

  const getStyle = (colorName: string, defaultColor: string) => {
    return colorMap[colorName] || colorMap[defaultColor];
  };

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

      {/* 2. Executive KPI & Status Cards (Matching image.png exactly with fully dynamic style customizers) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4.5">
        {/* Card 1: Daily Collection */}
        {(() => {
          const style = getStyle(card1Color, 'amber');
          return (
            <div
              onClick={onNavigateToExpenses}
              className={`premium-list-card flex flex-col justify-between gap-4 cursor-pointer transition-all group ${style.hover}`}
            >
              <div className="flex items-center justify-between border-b border-[#14233a]/60 pb-2">
                <span className={`text-xs text-slate-400 font-extrabold transition-colors ${style.hoverText}`}>
                  التحصيل المالي اليومي
                </span>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${style.bg} ${style.border} ${style.text}`}>
                  <Wallet className="w-4 h-4" />
                </div>
              </div>
              <div>
                <div className={`font-black font-sans tracking-tight ${fontSizeClass} ${style.text}`} dir="ltr">
                  EGP {formatNumber(totalRevenue)}{' '}
                </div>
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 mt-2">
                  <span className="text-emerald-400 font-extrabold">تم استلام {students.length} عملية</span>
                  <span className={`text-slate-500 transition-colors ${style.hoverText}`}>عرض التفاصيل ←</span>
                </div>
              </div>
            </div>
          );
        })()}

        {/* Card 2: WhatsApp status */}
        {(() => {
          const style = isWhatsConnected ? getStyle('emerald', 'emerald') : getStyle(card2Color, 'rose');
          return (
            <div
              onClick={onNavigateToWhatsApp}
              className={`premium-list-card flex flex-col justify-between gap-4 cursor-pointer transition-all group ${style.hover}`}
            >
              <div className="flex items-center justify-between border-b border-[#14233a]/60 pb-2">
                <span className={`text-xs text-slate-400 font-extrabold transition-colors ${style.hoverText}`}>
                  رسائل الواتساب
                </span>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${style.bg} ${style.border} ${style.text}`}>
                  <MessageCircle className="w-4 h-4" />
                </div>
              </div>
              <div>
                <div className={`font-black font-sans tracking-tight ${fontSizeClass} ${style.text}`}>
                  {isWhatsConnected ? 'متصل ونشط' : 'تحتاج ربط'}
                </div>
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 mt-2">
                  <span className={style.text}>
                    {isWhatsConnected ? 'النظام جاهز لإرسال الرسائل' : 'اضغط هنا لإعادة الربط'}
                  </span>
                  <span className={`text-slate-500 transition-colors ${style.hoverText}`}>إعدادات الواتساب ←</span>
                </div>
              </div>
            </div>
          );
        })()}

        {/* Card 3: Cloud connection status */}
        {(() => {
          const style = isCloudConnected ? getStyle(card3Color, 'emerald') : getStyle('rose', 'rose');
          return (
            <div
              onClick={onNavigateToSettings}
              className={`premium-list-card flex flex-col justify-between gap-4 cursor-pointer transition-all group ${style.hover}`}
            >
              <div className="flex items-center justify-between border-b border-[#14233a]/60 pb-2">
                <span className={`text-xs text-slate-400 font-extrabold transition-colors ${style.hoverText}`}>
                  حالة الربط السحابي
                </span>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${style.bg} ${style.border} ${style.text}`}>
                  <Cloud className="w-4 h-4" />
                </div>
              </div>
              <div>
                <div className={`font-black font-sans tracking-tight ${fontSizeClass} ${style.text}`}>
                  {isCloudConnected ? 'مستقر (99.9%)' : 'غير متصل بالسحابة'}
                </div>
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 mt-2">
                  <span className={style.text}>
                    {isCloudConnected ? 'آخر مزامنة منذ دقيقة' : 'فشل المزامنة التلقائية'}
                  </span>
                  <span className={`text-slate-500 transition-colors ${style.hoverText}`}>الإعدادات ←</span>
                </div>
              </div>
            </div>
          );
        })()}

        {/* Card 4: Total registered students */}
        {(() => {
          const style = getStyle(card4Color, 'white');
          return (
            <div
              onClick={onNavigateToStudentsList}
              className={`premium-list-card flex flex-col justify-between gap-4 cursor-pointer transition-all group ${style.hover}`}
            >
              <div className="flex items-center justify-between border-b border-[#14233a]/60 pb-2">
                <span className={`text-xs text-slate-400 font-extrabold transition-colors ${style.hoverText}`}>
                  إجمالي الطلاب المسجلين
                </span>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${style.bg} ${style.border} ${style.text}`}>
                  <GraduationCap className="w-4 h-4" />
                </div>
              </div>
              <div>
                <div className={`font-black font-sans tracking-tight ${fontSizeClass} ${style.text}`} dir="ltr">
                  {students.length.toLocaleString('en-US')}
                </div>
                <div className="flex items-center justify-between text-[11px] font-bold text-emerald-400 mt-2">
                  <span className="flex items-center gap-0.5" dir="ltr">
                    <ArrowUpRight className="w-3.5 h-3.5" />
                    <span>+12% هذا الشهر</span>
                  </span>
                  <span className={`text-slate-500 transition-colors ${style.hoverText}`}>عرض السجل ←</span>
                </div>
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
};
