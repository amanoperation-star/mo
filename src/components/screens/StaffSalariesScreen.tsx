import React from 'react';
import { Coins, CheckCircle, Clock, Award, Phone } from 'lucide-react';
import { StaffMember } from '../../types';

interface StaffSalariesScreenProps {
  staff: StaffMember[];
  onToggleStatus: (id: string) => void;
}

export const StaffSalariesScreen: React.FC<StaffSalariesScreenProps> = ({ staff, onToggleStatus }) => {
  const totalSalaries = staff.reduce((acc, curr) => acc + curr.baseSalary + curr.bonus, 0);

  return (
    <div
      id="staff-salaries-screen"
      className="bg-[#0b1320] border border-[#192b42] rounded-2xl p-4 md:p-7 shadow-2xl flex-1 flex flex-col transition-all"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#16253b]">
        <div>
          <h2 className="text-lg md:text-xl font-extrabold text-white flex items-center gap-2.5">
            <Coins className="w-5 h-5 text-amber-400" />
            <span>رواتب ومستحقات فريق العمل والمساعدين</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1 font-medium">
            متابعة استحقاقات المشرفين والمساعدين، وبونص متابعة واجبات الطلاب وحصص البث
          </p>
        </div>

        <div className="bg-[#121e30] border border-amber-500/30 px-3.5 py-1.5 rounded-xl flex items-center gap-2">
          <span className="text-xs text-slate-400">إجمالي الرواتب:</span>
          <span className="text-sm font-bold text-amber-300 font-mono" dir="ltr">
            {totalSalaries.toLocaleString('en-US')} <span className="font-sans text-xs font-normal">ج.م</span>
          </span>
        </div>
      </div>

      {/* Staff Salary Cards / Table */}
      <div className="overflow-x-auto rounded-xl border border-[#17273f] bg-[#070d17] mt-5">
        <table className="w-full text-right text-xs">
          <thead className="bg-[#0f1b2c] text-slate-300 font-bold border-b border-[#1c2e47]">
            <tr>
              <th className="p-3.5">الاسم والصفة</th>
              <th className="p-3.5">الهاتف</th>
              <th className="p-3.5">الراتب الأساسي</th>
              <th className="p-3.5">مكافأة الإنجاز</th>
              <th className="p-3.5">إجمالي المستحق</th>
              <th className="p-3.5">حالة الصرف</th>
              <th className="p-3.5 text-center">إجراء</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#132238] text-slate-200">
            {staff.map((member) => (
              <tr key={member.id} className="hover:bg-[#0d1726]">
                <td className="p-3.5">
                  <div className="font-bold text-white text-sm">{member.name}</div>
                  <div className="text-[11px] text-blue-400 font-medium mt-0.5">{member.role}</div>
                </td>
                <td className="p-3.5 font-mono text-slate-300" dir="ltr">{member.phone}</td>
                <td className="p-3.5 font-mono text-slate-200" dir="ltr">
                  {member.baseSalary.toLocaleString('en-US')} <span className="font-sans text-xs font-normal">ج.م</span>
                </td>
                <td className="p-3.5 font-mono text-emerald-400 font-bold" dir="ltr">
                  +{member.bonus.toLocaleString('en-US')} <span className="font-sans text-xs font-normal">ج.م</span>
                </td>
                <td className="p-3.5 font-mono font-bold text-amber-400 text-sm" dir="ltr">
                  {(member.baseSalary + member.bonus).toLocaleString('en-US')} <span className="font-sans text-xs font-normal">ج.م</span>
                </td>
                <td className="p-3.5">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                      member.status === 'مدفوع'
                        ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                        : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        member.status === 'مدفوع' ? 'bg-emerald-400' : 'bg-amber-400'
                      }`}
                    ></span>
                    <span>{member.status}</span>
                  </span>
                </td>
                <td className="p-3.5 text-center">
                  <button
                    onClick={() => onToggleStatus(member.id)}
                    type="button"
                    className="bg-[#122033] hover:bg-[#1a2d48] border border-[#203656] text-slate-200 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer"
                  >
                    {member.status === 'مدفوع' ? 'تحويل إلى معلق' : 'تأكيد الصرف'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
