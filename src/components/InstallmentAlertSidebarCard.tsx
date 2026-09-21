import React, { useState } from 'react';
import {
  Clock,
  Calendar,
  MessageCircle,
  Wallet,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  Bell,
  CheckCircle2,
  AlertTriangle,
  Receipt,
  TrendingDown,
  UserCheck,
} from 'lucide-react';
import { Student } from '../types';
import { InstallmentInfo } from '../utils/installmentUtils';

interface InstallmentAlertSidebarCardProps {
  dueInstallments: Array<{ student: Student; info: InstallmentInfo }>;
  onOpenSettle?: (student: Student) => void;
  onOpenWhatsAppReminder?: (student: Student) => void;
  onViewAllInList?: () => void;
}

export const InstallmentAlertSidebarCard: React.FC<InstallmentAlertSidebarCardProps> = ({
  dueInstallments = [],
  onOpenSettle,
  onOpenWhatsAppReminder,
  onViewAllInList,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const count = dueInstallments.length;

  if (count === 0) {
    return (
      <div
        id="installment-alerts-empty-box"
        className="bg-[#0b1422] border border-[#1b2b40] rounded-2xl p-3.5 flex items-center gap-3 text-xs text-slate-300 shadow-md transition-all"
      >
        <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
          <CheckCircle2 className="w-4 h-4" />
        </div>
        <div className="flex-1">
          <div className="text-xs font-bold text-slate-200">الأقساط منتظمة بالكامل</div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            لا توجد أقساط متأخرة أو وشيكة الاستحقاق حالياً
          </div>
        </div>
      </div>
    );
  }

  // Count metrics
  const overdueCount = dueInstallments.filter((item) => item.info.status === 'overdue').length;
  const dueTodayCount = dueInstallments.filter((item) => item.info.status === 'due_today').length;
  const upcomingCount = dueInstallments.filter(
    (item) => item.info.status !== 'overdue' && item.info.status !== 'due_today'
  ).length;

  // Total outstanding balance among these due students
  const totalDueAmount = dueInstallments.reduce(
    (acc, item) => acc + item.info.remainingAmount,
    0
  );

  return (
    <div
      id="installment-alerts-sidebar-card"
      className="bg-[#0b1422] border border-amber-500/35 rounded-2xl p-3.5 flex flex-col gap-3 shadow-xl relative overflow-hidden transition-all"
    >
      {/* Executive Amber/Rose Accent Top Bar */}
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-rose-500 via-amber-400 to-amber-500" />

      {/* Header Section */}
      <div className="flex items-center justify-between gap-2 pt-0.5">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500/20 to-rose-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 shadow-sm">
            <Bell className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-black text-white flex items-center gap-1.5 truncate">
              <span>تنبيهات استحقاق الأقساط</span>
              {overdueCount > 0 && (
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse shrink-0" title="يوجد أقساط متأخرة" />
              )}
            </div>
            <div className="text-[10px] text-slate-400 font-medium">متابعة مواعيد السداد والتحصيل</div>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-lg bg-amber-500/15 text-amber-300 border border-amber-500/30 font-mono">
            {count} {count === 1 ? 'طالب' : 'طلاب'}
          </span>
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800/60 transition-colors cursor-pointer"
            title={isExpanded ? 'طي القائمة' : 'توسيع القائمة'}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Executive Financial Ledger Strip */}
      <div className="bg-[#080e18] border border-[#162338] rounded-xl p-2.5 flex items-center justify-between gap-2 shadow-inner">
        <div className="flex flex-col">
          <span className="text-[10px] text-slate-400 font-medium">إجمالي المستحق</span>
          <span className="text-xs font-black text-amber-300 font-mono tracking-wide">
            {totalDueAmount.toLocaleString('ar-EG')} ج.م
          </span>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap justify-end">
          {overdueCount > 0 && (
            <span className="text-[10px] font-bold text-rose-300 bg-rose-950/70 border border-rose-800/60 px-2 py-0.5 rounded-lg flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
              <span>{overdueCount} متأخر</span>
            </span>
          )}
          {dueTodayCount > 0 && (
            <span className="text-[10px] font-bold text-amber-300 bg-amber-950/70 border border-amber-800/60 px-2 py-0.5 rounded-lg">
              {dueTodayCount} اليوم
            </span>
          )}
          {upcomingCount > 0 && (
            <span className="text-[10px] font-bold text-slate-300 bg-[#121e30] border border-[#1e3250] px-2 py-0.5 rounded-lg">
              {upcomingCount} وشيك
            </span>
          )}
        </div>
      </div>

      {/* Expandable Due Student Cards List */}
      {isExpanded && (
        <div className="flex flex-col gap-2 max-h-64 overflow-y-auto pr-0.5 custom-scrollbar">
          {dueInstallments.map(({ student, info }) => {
            const isOverdue = info.status === 'overdue';
            const isToday = info.status === 'due_today';

            const initials = student.name
              ? student.name.trim().split(' ').slice(0, 2).map((w) => w[0]).join('.')
              : 'ط';

            return (
              <div
                key={student.id}
                id={`sidebar-due-student-${student.id}`}
                className={`p-2.5 rounded-xl border transition-all text-right flex flex-col gap-2 shadow-sm ${
                  isOverdue
                    ? 'bg-[#150e13] border-rose-500/40 hover:border-rose-400/60'
                    : isToday
                    ? 'bg-[#18140c] border-amber-500/40 hover:border-amber-400/60'
                    : 'bg-[#0e1726] border-[#1c2d44] hover:border-blue-500/40'
                }`}
              >
                {/* Student Header Info */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div
                      className={`w-7 h-7 rounded-lg text-[10px] font-black flex items-center justify-center shrink-0 border ${
                        isOverdue
                          ? 'bg-rose-950/80 border-rose-700/60 text-rose-300'
                          : isToday
                          ? 'bg-amber-950/80 border-amber-700/60 text-amber-300'
                          : 'bg-slate-800 border-slate-700 text-slate-300'
                      }`}
                    >
                      {initials}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-white truncate" title={student.name}>
                        {student.name}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate" title={student.course}>
                        {student.course}
                      </div>
                    </div>
                  </div>

                  <div className="text-left shrink-0">
                    <span className="text-xs font-extrabold text-amber-400 font-mono">
                      {info.remainingAmount.toLocaleString('ar-EG')} ج.م
                    </span>
                    <div className="text-[9px] text-slate-400">متبقي</div>
                  </div>
                </div>

                {/* Status Pill & Due Date */}
                <div className="flex items-center justify-between gap-1 text-[10px] pt-1.5 border-t border-slate-800/70">
                  <span
                    className={`font-bold px-2 py-0.5 rounded-lg border inline-flex items-center gap-1 ${info.badgeColorClass}`}
                  >
                    <Clock className="w-2.5 h-2.5" />
                    <span>{info.badgeText}</span>
                  </span>

                  <span className="text-slate-400 text-[10px] flex items-center gap-1" title={`الاستحقاق: ${info.dueDateStr}`}>
                    <Calendar className="w-2.5 h-2.5 text-slate-500" />
                    <span>{info.dueDateStr}</span>
                  </span>
                </div>

                {/* Executive Quick Actions */}
                <div className="grid grid-cols-2 gap-1.5 pt-0.5">
                  {onOpenWhatsAppReminder && (
                    <button
                      type="button"
                      id={`sidebar-whatsapp-btn-${student.id}`}
                      onClick={() => onOpenWhatsAppReminder(student)}
                      className="bg-[#0a1e18] hover:bg-[#102d24] text-emerald-300 border border-emerald-600/40 hover:border-emerald-500 text-[11px] font-bold py-1.5 px-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm"
                      title="إرسال تذكير بموعد القسط لولي الأمر عبر الواتساب"
                    >
                      <MessageCircle className="w-3 h-3 text-emerald-400 shrink-0" />
                      <span>تذكير واتساب</span>
                    </button>
                  )}

                  {onOpenSettle && (
                    <button
                      type="button"
                      id={`sidebar-settle-btn-${student.id}`}
                      onClick={() => onOpenSettle(student)}
                      className="bg-[#1e170d] hover:bg-[#2b2112] text-amber-300 border border-amber-600/40 hover:border-amber-500 text-[11px] font-bold py-1.5 px-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm"
                      title="تسجيل تحصيل القسط وتحديث الحالة وتوليد الإيصال"
                    >
                      <Wallet className="w-3 h-3 text-amber-400 shrink-0" />
                      <span>سداد القسط</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Footer Navigation Button */}
      {onViewAllInList && (
        <button
          type="button"
          id="view-all-due-installments-sidebar-btn"
          onClick={onViewAllInList}
          className="w-full bg-[#111f32] hover:bg-[#172b46] text-blue-300 hover:text-white text-xs font-bold py-2 px-3 rounded-xl border border-blue-500/30 flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
        >
          <span>فلترة وعرض المستحقات في السجل</span>
          <ArrowLeft className="w-3.5 h-3.5 text-blue-400" />
        </button>
      )}
    </div>
  );
};
