import React, { useState } from 'react';
import { Wallet, Plus, TrendingUp, TrendingDown, DollarSign, Calendar, Tag, FileText } from 'lucide-react';
import { Expense } from '../../types';

interface ExpensesScreenProps {
  expenses: Expense[];
  totalRevenue: number;
  onAddExpense: (expense: Omit<Expense, 'id'>) => void;
  onDeleteExpense: (id: string) => void;
}

export const ExpensesScreen: React.FC<ExpensesScreenProps> = ({
  expenses,
  totalRevenue,
  onAddExpense,
  onDeleteExpense,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<Expense['category']>('منصات وسيرفرات');
  const [amount, setAmount] = useState<number>(0);
  const [notes, setNotes] = useState('');

  const totalExpenses = expenses.reduce((acc, curr) => acc + curr.amount, 0);
  const netProfit = totalRevenue - totalExpenses;
  const profitMargin = totalRevenue > 0 ? Math.round((netProfit / totalRevenue) * 100) : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || amount <= 0) return;

    onAddExpense({
      title: title.trim(),
      category,
      amount: Number(amount),
      date: new Date().toISOString().slice(0, 10),
      paidBy: 'أك. محمود عزت',
      notes: notes.trim() || undefined,
    });

    setTitle('');
    setAmount(0);
    setNotes('');
    setShowAddForm(false);
  };

  return (
    <div
      id="expenses-pl-screen"
      className="bg-[#0b1320] border border-[#192b42] rounded-2xl p-4 md:p-7 shadow-2xl flex-1 flex flex-col transition-all"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#16253b]">
        <div>
          <h2 className="text-lg md:text-xl font-extrabold text-white flex items-center gap-2.5">
            <Wallet className="w-5 h-5 text-emerald-400" />
            <span>المصروفات والأرباح (قائمة الدخل P&L)</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1 font-medium">
            حساب صافي الأرباح التشغيلية، ومتابعة تكاليف السيرفرات والمطبوعات وبوابات الدفع
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          type="button"
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-xs px-4 py-2.5 rounded-xl font-bold transition-all shadow-md shadow-blue-600/20 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة بند مصروف جديد</span>
        </button>
      </div>

      {/* P&L Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 my-5">
        {/* Total Revenues */}
        <div className="bg-[#0e1726] border border-[#1b2b40] rounded-xl p-4 flex flex-col gap-1.5">
          <div className="text-xs text-slate-400 font-bold flex items-center justify-between">
            <span>إجمالي الإيرادات</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-extrabold text-white font-mono" dir="ltr">
            {totalRevenue.toLocaleString('en-US')} <span className="text-xs font-normal text-slate-400 font-sans">ج.م</span>
          </div>
          <div className="text-[10px] text-emerald-400 font-semibold">اشتراكات الطلاب النشطة</div>
        </div>

        {/* Total Expenses */}
        <div className="bg-[#0e1726] border border-[#1b2b40] rounded-xl p-4 flex flex-col gap-1.5 shadow-sm">
          <div className="text-xs text-slate-400 font-bold flex items-center justify-between">
            <span>إجمالي المصروفات</span>
            <TrendingDown className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl font-extrabold text-white font-mono" dir="ltr">
            {totalExpenses.toLocaleString('en-US')} <span className="text-xs font-normal text-slate-400 font-sans">ج.م</span>
          </div>
          <div className="text-[10px] text-amber-400 font-semibold font-mono" dir="ltr">{expenses.length.toLocaleString('en-US')} بنود مصروفة</div>
        </div>

        {/* Net Profit */}
        <div className="bg-[#0e1726] border border-[#1b2b40] rounded-xl p-4 flex flex-col gap-1.5 shadow-sm">
          <div className="text-xs text-slate-400 font-bold flex items-center justify-between">
            <span>صافي الربح</span>
            <DollarSign className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-xl font-extrabold text-blue-400 font-mono" dir="ltr">
            {netProfit.toLocaleString('en-US')} <span className="text-xs font-normal text-slate-400 font-sans">ج.م</span>
          </div>
          <div className="text-[10px] text-slate-400 font-semibold">بعد خصم التكاليف</div>
        </div>

        {/* Profit Margin */}
        <div className="bg-[#0e1726] border border-[#1b2b40] rounded-xl p-4 flex flex-col gap-1.5">
          <div className="text-xs text-slate-400 font-bold flex items-center justify-between">
            <span>هامش الربحية</span>
            <span className="text-xs font-bold text-emerald-400">%{profitMargin}</span>
          </div>
          <div className="w-full bg-[#182638] h-2.5 rounded-full overflow-hidden mt-2">
            <div
              className="bg-gradient-to-r from-blue-500 to-emerald-400 h-full rounded-full"
              style={{ width: `${Math.min(Math.max(profitMargin, 0), 100)}%` }}
            />
          </div>
          <div className="text-[10px] text-emerald-400 font-semibold">مؤشر تشغيلي ممتاز</div>
        </div>
      </div>

      {/* Add Expense Form */}
      {showAddForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-[#070d17] border border-blue-500/40 rounded-xl p-4 mb-5 flex flex-col gap-4 animate-in fade-in"
        >
          <div className="text-xs font-bold text-blue-400">إضافة بند مصروف جديد للمنظومة</div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input
              type="text"
              placeholder="بيان المصروف (مثال: سيرفرات البث)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="bg-[#0d1726] border border-[#1f3350] rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-blue-500"
            />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as any)}
              className="bg-[#0d1726] border border-[#1f3350] rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-blue-500"
            >
              <option value="منصات وسيرفرات">منصات وسيرفرات</option>
              <option value="رواتب ومكافآت">رواتب ومكافآت</option>
              <option value="مطبوعات ومذكرات">مطبوعات ومذكرات</option>
              <option value="تسويق وإعلانات">تسويق وإعلانات</option>
              <option value="أخرى">أخرى</option>
            </select>
            <input
              type="number"
              placeholder="المبلغ (ج.م)"
              value={amount || ''}
              onChange={(e) => setAmount(Number(e.target.value))}
              required
              className="bg-[#0d1726] border border-[#1f3350] rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-blue-500 font-mono"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="bg-[#152336] text-slate-300 text-xs px-3 py-1.5 rounded-lg"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-500 text-white text-xs px-4 py-1.5 rounded-lg font-bold"
            >
              حفظ المصروف
            </button>
          </div>
        </form>
      )}

      {/* Expenses Table */}
      <div className="overflow-x-auto rounded-xl border border-[#17273f] bg-[#070d17]">
        <table className="w-full text-right text-xs">
          <thead className="bg-[#0f1b2c] text-slate-300 font-bold border-b border-[#1c2e47]">
            <tr>
              <th className="p-3.5">بند المصروف</th>
              <th className="p-3.5">التصنيف</th>
              <th className="p-3.5">المبلغ</th>
              <th className="p-3.5">التاريخ</th>
              <th className="p-3.5">المسؤول</th>
              <th className="p-3.5 text-center">إجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#132238] text-slate-200">
            {expenses.map((exp) => (
              <tr key={exp.id} className="hover:bg-[#0d1726]">
                <td className="p-3.5">
                  <div className="font-bold text-white">{exp.title}</div>
                  {exp.notes && <div className="text-[10px] text-slate-400 mt-0.5">{exp.notes}</div>}
                </td>
                <td className="p-3.5">
                  <span className="px-2 py-0.5 rounded-md bg-[#142338] text-blue-300 text-[11px] font-semibold border border-[#1e3a5f]">
                    {exp.category}
                  </span>
                </td>
                <td className="p-3.5 font-mono font-bold text-amber-400 text-sm" dir="ltr">
                  {exp.amount.toLocaleString('en-US')} <span className="font-sans text-xs font-normal">ج.م</span>
                </td>
                <td className="p-3.5 text-slate-400 font-mono">{exp.date}</td>
                <td className="p-3.5 text-slate-300">{exp.paidBy}</td>
                <td className="p-3.5 text-center">
                  <button
                    onClick={() => onDeleteExpense(exp.id)}
                    type="button"
                    className="text-red-400 hover:text-red-300 text-[11px] font-semibold"
                  >
                    حذف
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
