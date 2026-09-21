import React from 'react';
import { BarChart3, TrendingUp, Users, BookOpen, CreditCard, Award, CheckCircle2 } from 'lucide-react';
import { Student, Course } from '../../types';

interface AnalyticsScreenProps {
  students: Student[];
  courses: Course[];
  totalRevenue: number;
}

export const AnalyticsScreen: React.FC<AnalyticsScreenProps> = ({
  students,
  courses,
  totalRevenue,
}) => {
  // Payment methods distribution
  const paymentCounts = students.reduce<Record<string, number>>((acc, curr) => {
    acc[curr.paymentMethod] = (acc[curr.paymentMethod] || 0) + 1;
    return acc;
  }, {});

  // Grade distribution
  const gradeCounts = students.reduce<Record<string, number>>((acc, curr) => {
    acc[curr.grade] = (acc[curr.grade] || 0) + 1;
    return acc;
  }, {});

  return (
    <div
      id="analytics-dashboard-screen"
      className="bg-[#0b1320] border border-[#192b42] rounded-2xl p-4 md:p-7 shadow-2xl flex-1 flex flex-col transition-all"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#16253b]">
        <div>
          <h2 className="text-lg md:text-xl font-extrabold text-white flex items-center gap-2.5">
            <BarChart3 className="w-5 h-5 text-blue-400" />
            <span>لوحة المؤشرات والتحليلات الأكاديمية</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1 font-medium">
            بيانات الاشتراكات، الإقبال على الكورسات، وتحليلات بوابات الدفع الإلكتروني
          </p>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 my-5">
        <div className="bg-[#0e1726] border border-[#1b2b40] rounded-xl p-4 flex flex-col gap-1.5">
          <div className="text-xs text-slate-400 font-bold flex items-center justify-between">
            <span>إجمالي المشتركين</span>
            <Users className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono">{students.length}</div>
          <div className="text-[10px] text-emerald-400 font-semibold">اشتراكات مؤكدة بالمنصة</div>
        </div>

        <div className="bg-[#0e1726] border border-[#1b2b40] rounded-xl p-4 flex flex-col gap-1.5">
          <div className="text-xs text-slate-400 font-bold flex items-center justify-between">
            <span>معدل التحصيل</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400 font-mono" dir="ltr">
            {totalRevenue.toLocaleString('en-US')} <span className="text-xs font-normal font-sans">ج.م</span>
          </div>
          <div className="text-[10px] text-slate-400 font-semibold" dir="ltr">متوسط {(students.length > 0 ? Math.round(totalRevenue / students.length) : 0).toLocaleString('en-US')} ج.م للطالب</div>
        </div>

        <div className="bg-[#0e1726] border border-[#1b2b40] rounded-xl p-4 flex flex-col gap-1.5">
          <div className="text-xs text-slate-400 font-bold flex items-center justify-between">
            <span>الكورسات المتاحة</span>
            <BookOpen className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono">{courses.length}</div>
          <div className="text-[10px] text-amber-400 font-semibold">جاهزة للبث والتسجيل</div>
        </div>

        <div className="bg-[#0e1726] border border-[#1b2b40] rounded-xl p-4 flex flex-col gap-1.5">
          <div className="text-xs text-slate-400 font-bold flex items-center justify-between">
            <span>نسبة الرضا والمتابعة</span>
            <Award className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-black text-cyan-400 font-mono">99.4%</div>
          <div className="text-[10px] text-cyan-400 font-semibold">تسليم إيصالات الواتساب فورياً</div>
        </div>
      </div>

      {/* Visual Analytics Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-2">
        {/* Payment Gateways Breakdown */}
        <div className="bg-[#080f1a] border border-[#17273f] rounded-xl p-4.5 flex flex-col gap-3">
          <div className="text-xs font-bold text-slate-200 flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-blue-400" />
            <span>توزيع بوابات وطرق السداد المستخدمة</span>
          </div>
          <div className="flex flex-col gap-3 pt-2">
            {Object.entries(paymentCounts).map(([method, count]) => {
              const pct = Math.round((count / students.length) * 100) || 0;
              return (
                <div key={method} className="flex flex-col gap-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-300">{method}</span>
                    <span className="text-blue-400 font-mono">{count} طالب ({pct}%)</span>
                  </div>
                  <div className="w-full bg-[#132032] h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-cyan-400 h-full rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Grade Level Breakdown */}
        <div className="bg-[#080f1a] border border-[#17273f] rounded-xl p-4.5 flex flex-col gap-3">
          <div className="text-xs font-bold text-slate-200 flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-400" />
            <span>توزيع الطلاب حسب الصف والمرحلة الدراسية</span>
          </div>
          <div className="flex flex-col gap-3 pt-2">
            {Object.entries(gradeCounts).map(([grade, count]) => {
              const pct = Math.round((count / students.length) * 100) || 0;
              return (
                <div key={grade} className="flex flex-col gap-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-300">{grade}</span>
                    <span className="text-emerald-400 font-mono">{count} طالب ({pct}%)</span>
                  </div>
                  <div className="w-full bg-[#132032] h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
