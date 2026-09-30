import React, { useState } from 'react';
import { ShieldAlert, Trash2, CheckCircle2, X, AlertTriangle, Sparkles, Database, CheckSquare, Square, RefreshCw } from 'lucide-react';

export interface ResetCategories {
  students: boolean;
  expenses: boolean;
  logs: boolean;
  notifications: boolean;
  courses: boolean;
  staff: boolean;
}

interface ProductionResetModalProps {
  onClose: () => void;
  onExecuteReset: (categories: ResetCategories) => void;
}

export const ProductionResetModal: React.FC<ProductionResetModalProps> = ({
  onClose,
  onExecuteReset,
}) => {
  const [categories, setCategories] = useState<ResetCategories>({
    students: true,
    expenses: true,
    logs: true,
    notifications: true,
    courses: false,
    staff: false,
  });

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const toggleCategory = (key: keyof ResetCategories) => {
    setCategories((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSelectAll = (val: boolean) => {
    setCategories({
      students: val,
      expenses: val,
      logs: val,
      notifications: val,
      courses: val,
      staff: val,
    });
  };

  const isAnySelected = Object.values(categories).some(Boolean);

  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAnySelected) {
      setErrorMsg('يرجى اختيار فئة واحدة على الأقل لمسحها وإعادة التهيئة.');
      return;
    }

    onExecuteReset(categories);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 dir-rtl text-right">
      <div className="bg-[#0b1320] border-2 border-rose-500/50 rounded-3xl max-w-lg w-full p-6 shadow-2xl flex flex-col gap-5 text-white relative">
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-[#182942]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/40 flex items-center justify-center font-bold shrink-0 animate-pulse">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                <span>تهيئة المنظومة والبدء في الإنتاج</span>
                <span className="text-[10px] bg-rose-950 text-rose-300 border border-rose-800/60 px-2 py-0.5 rounded-full font-mono">
                  Production Mode
                </span>
              </h2>
              <p className="text-xs text-slate-400 font-semibold mt-0.5">
                تصفية بيانات التجربة والاختبار وتفريغ السجلات لبدء العمل الفعلي
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            type="button"
            className="p-1.5 hover:bg-[#152336] text-slate-400 hover:text-white rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Warning Banner */}
        <div className="p-3.5 rounded-2xl bg-rose-950/70 border border-rose-500/40 text-rose-200 text-xs font-bold flex items-start gap-2.5">
          <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div className="flex flex-col gap-0.5">
            <span className="text-amber-300 font-black">تحذير هام قبل التهيئة:</span>
            <span>
              هذا الإجراء سيقوم بمسح وتصفير البيانات المحددة أدناه بشكل نهائي لتجهيز المنظومة للاستخدام الرسمي للإنتاج.
            </span>
          </div>
        </div>

        {/* Select All / Deselect All Controls */}
        <div className="flex items-center justify-between text-xs font-bold text-slate-300 pt-1">
          <span>حدد البيانات التجريبية المراد تصفيرها:</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleSelectAll(true)}
              className="text-blue-400 hover:text-blue-300 text-[11px] underline cursor-pointer"
            >
              تحديد الكل
            </button>
            <span className="text-slate-600">•</span>
            <button
              type="button"
              onClick={() => handleSelectAll(false)}
              className="text-slate-400 hover:text-slate-200 text-[11px] underline cursor-pointer"
            >
              إلغاء تحديد الكل
            </button>
          </div>
        </div>

        {/* Category Checkboxes List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-60 overflow-y-auto p-1">
          {/* Item 1: Students */}
          <button
            type="button"
            onClick={() => toggleCategory('students')}
            className={`p-3 rounded-2xl border text-xs text-right transition-all flex items-center justify-between cursor-pointer ${
              categories.students
                ? 'bg-rose-950/40 border-rose-500/60 text-white font-bold'
                : 'bg-[#070d17] border-[#182a40] text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className="flex items-center gap-2.5">
              {categories.students ? (
                <CheckSquare className="w-4 h-4 text-rose-400 shrink-0" />
              ) : (
                <Square className="w-4 h-4 text-slate-600 shrink-0" />
              )}
              <div className="flex flex-col">
                <span className="font-extrabold text-xs">سجل الطلاب والأقساط</span>
                <span className="text-[10px] text-slate-400 font-normal">مسح كافة الاشتراكات والأكواد</span>
              </div>
            </div>
          </button>

          {/* Item 2: Expenses */}
          <button
            type="button"
            onClick={() => toggleCategory('expenses')}
            className={`p-3 rounded-2xl border text-xs text-right transition-all flex items-center justify-between cursor-pointer ${
              categories.expenses
                ? 'bg-rose-950/40 border-rose-500/60 text-white font-bold'
                : 'bg-[#070d17] border-[#182a40] text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className="flex items-center gap-2.5">
              {categories.expenses ? (
                <CheckSquare className="w-4 h-4 text-rose-400 shrink-0" />
              ) : (
                <Square className="w-4 h-4 text-slate-600 shrink-0" />
              )}
              <div className="flex flex-col">
                <span className="font-extrabold text-xs">سجل المصروفات والأرباح</span>
                <span className="text-[10px] text-slate-400 font-normal">تصفير بنود الصرف والمالية</span>
              </div>
            </div>
          </button>

          {/* Item 3: Audit Logs */}
          <button
            type="button"
            onClick={() => toggleCategory('logs')}
            className={`p-3 rounded-2xl border text-xs text-right transition-all flex items-center justify-between cursor-pointer ${
              categories.logs
                ? 'bg-rose-950/40 border-rose-500/60 text-white font-bold'
                : 'bg-[#070d17] border-[#182a40] text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className="flex items-center gap-2.5">
              {categories.logs ? (
                <CheckSquare className="w-4 h-4 text-rose-400 shrink-0" />
              ) : (
                <Square className="w-4 h-4 text-slate-600 shrink-0" />
              )}
              <div className="flex flex-col">
                <span className="font-extrabold text-xs">سجل الرقابة (Audit Log)</span>
                <span className="text-[10px] text-slate-400 font-normal">مسح سجل التعديلات والعمليات</span>
              </div>
            </div>
          </button>

          {/* Item 4: Notifications */}
          <button
            type="button"
            onClick={() => toggleCategory('notifications')}
            className={`p-3 rounded-2xl border text-xs text-right transition-all flex items-center justify-between cursor-pointer ${
              categories.notifications
                ? 'bg-rose-950/40 border-rose-500/60 text-white font-bold'
                : 'bg-[#070d17] border-[#182a40] text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className="flex items-center gap-2.5">
              {categories.notifications ? (
                <CheckSquare className="w-4 h-4 text-rose-400 shrink-0" />
              ) : (
                <Square className="w-4 h-4 text-slate-600 shrink-0" />
              )}
              <div className="flex flex-col">
                <span className="font-extrabold text-xs">التنبيهات والإشعارات</span>
                <span className="text-[10px] text-slate-400 font-normal">تفريع قائمة إشعارات الفريق</span>
              </div>
            </div>
          </button>

          {/* Item 5: Courses & Grades */}
          <button
            type="button"
            onClick={() => toggleCategory('courses')}
            className={`p-3 rounded-2xl border text-xs text-right transition-all flex items-center justify-between cursor-pointer ${
              categories.courses
                ? 'bg-rose-950/40 border-rose-500/60 text-white font-bold'
                : 'bg-[#070d17] border-[#182a40] text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className="flex items-center gap-2.5">
              {categories.courses ? (
                <CheckSquare className="w-4 h-4 text-rose-400 shrink-0" />
              ) : (
                <Square className="w-4 h-4 text-slate-600 shrink-0" />
              )}
              <div className="flex flex-col">
                <span className="font-extrabold text-xs">الكورسات والمراحل</span>
                <span className="text-[10px] text-slate-400 font-normal">إعادة ضبط الكورسات الدراسية</span>
              </div>
            </div>
          </button>

          {/* Item 6: Staff */}
          <button
            type="button"
            onClick={() => toggleCategory('staff')}
            className={`p-3 rounded-2xl border text-xs text-right transition-all flex items-center justify-between cursor-pointer ${
              categories.staff
                ? 'bg-rose-950/40 border-rose-500/60 text-white font-bold'
                : 'bg-[#070d17] border-[#182a40] text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className="flex items-center gap-2.5">
              {categories.staff ? (
                <CheckSquare className="w-4 h-4 text-rose-400 shrink-0" />
              ) : (
                <Square className="w-4 h-4 text-slate-600 shrink-0" />
              )}
              <div className="flex flex-col">
                <span className="font-extrabold text-xs">الموظفين والمساعدين</span>
                <span className="text-[10px] text-slate-400 font-normal">حذف الحسابات التجريبية</span>
              </div>
            </div>
          </button>
        </div>

        {/* Confirmation Form */}
        <form onSubmit={handleConfirm} className="flex flex-col gap-3 pt-3 border-t border-[#182942]">
          {errorMsg && (
            <div className="p-2.5 rounded-xl bg-rose-950 border border-rose-500 text-rose-300 text-xs font-bold">
              {errorMsg}
            </div>
          )}

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="bg-[#142338] text-slate-300 text-xs px-4 py-2.5 rounded-xl font-semibold hover:bg-[#1a2d4a] transition-colors cursor-pointer"
            >
              إلغاء
            </button>

            <button
              type="submit"
              disabled={!isAnySelected}
              className="bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white text-xs px-6 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-rose-600/30 flex items-center gap-2 cursor-pointer disabled:opacity-40"
            >
              <Trash2 className="w-4 h-4" />
              <span>تهيئة البيانات والتحول للإنتاج الرسمي 🚀</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
