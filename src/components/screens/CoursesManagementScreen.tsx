import React, { useState } from 'react';
import {
  BookOpen,
  Plus,
  Users,
  Check,
  X,
  Calendar,
  Clock,
  Edit3,
  GraduationCap,
  Sparkles,
  DollarSign,
  AlertCircle,
  Save,
} from 'lucide-react';
import { Course } from '../../types';

interface CoursesManagementScreenProps {
  courses: Course[];
  onAddCourse: (course: Omit<Course, 'id' | 'enrolledCount'>) => void;
  onUpdateCourse: (id: string, updatedData: Partial<Course>) => void;
  onToggleCourseActive: (id: string) => void;
}

const DEFAULT_GRADES = [
  'الصف الثالث الثانوي (علمي)',
  'الصف الثالث الثانوي (أدبي)',
  'الصف الثاني الثانوي',
  'الصف الأول الثانوي',
  'المرحلة الإعدادية - الصف الثالث',
  'كورسات التأسيس والمراجعة النهائية',
];

const SCHEDULE_PRESETS = [
  'الأحد والأربعاء - الساعة 8:00 مساءً (بث مباشر ومسجل)',
  'السبت والثلاثاء - الساعة 7:00 مساءً (بث مباشر ومسجل)',
  'الإثنين والخميس - الساعة 8:30 مساءً (بث مباشر ومسجل)',
  'الجمعة - الساعة 2:00 ظهراً (محاضرة أسبوعية مكثفة)',
];

export const CoursesManagementScreen: React.FC<CoursesManagementScreenProps> = ({
  courses,
  onAddCourse,
  onUpdateCourse,
  onToggleCourseActive,
}) => {
  const [showAdd, setShowAdd] = useState(false);

  // Add Form State
  const [name, setName] = useState('');
  const [grade, setGrade] = useState(DEFAULT_GRADES[0]);
  const [isCustomGrade, setIsCustomGrade] = useState(false);
  const [customGradeInput, setCustomGradeInput] = useState('');
  const [price, setPrice] = useState<number>(800);
  const [schedule, setSchedule] = useState(SCHEDULE_PRESETS[0]);

  // Edit Modal State
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [editName, setEditName] = useState('');
  const [editGrade, setEditGrade] = useState('');
  const [editIsCustomGrade, setEditIsCustomGrade] = useState(false);
  const [editCustomGradeInput, setEditCustomGradeInput] = useState('');
  const [editPrice, setEditPrice] = useState<number>(0);
  const [editSchedule, setEditSchedule] = useState('');

  // Open Edit Modal
  const handleOpenEdit = (course: Course) => {
    setEditingCourse(course);
    setEditName(course.name);
    setEditPrice(course.price);
    setEditSchedule(course.schedule || SCHEDULE_PRESETS[0]);

    if (DEFAULT_GRADES.includes(course.grade)) {
      setEditGrade(course.grade);
      setEditIsCustomGrade(false);
      setEditCustomGradeInput('');
    } else {
      setEditGrade('custom');
      setEditIsCustomGrade(true);
      setEditCustomGradeInput(course.grade);
    }
  };

  // Submit Add
  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || price <= 0) return;

    const resolvedGrade = isCustomGrade && customGradeInput.trim() ? customGradeInput.trim() : grade;

    onAddCourse({
      name: name.trim(),
      grade: resolvedGrade,
      price: Number(price),
      isActive: true,
      schedule: schedule.trim() || undefined,
    });

    setName('');
    setPrice(800);
    setSchedule(SCHEDULE_PRESETS[0]);
    setIsCustomGrade(false);
    setCustomGradeInput('');
    setShowAdd(false);
  };

  // Submit Edit
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCourse || !editName.trim() || editPrice <= 0) return;

    const resolvedGrade =
      editIsCustomGrade && editCustomGradeInput.trim() ? editCustomGradeInput.trim() : editGrade;

    onUpdateCourse(editingCourse.id, {
      name: editName.trim(),
      grade: resolvedGrade,
      price: Number(editPrice),
      schedule: editSchedule.trim() || undefined,
    });

    setEditingCourse(null);
  };

  return (
    <div
      id="courses-management-screen"
      className="bg-[#0b1320] border border-[#192b42] rounded-2xl p-4 md:p-7 shadow-2xl flex-1 flex flex-col transition-all text-right"
    >
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#16253b]">
        <div>
          <h2 className="text-lg md:text-xl font-extrabold text-white flex items-center gap-2.5">
            <BookOpen className="w-5 h-5 text-blue-400" />
            <span>إدارة وتعديل الكورسات والمراحل الدراسية والمواعيد</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1 font-medium">
            يمكنك إضافة كورس جديد أو تعديل أي كورس، وضبط المرحلة والصف الدراسي وتحديد مواعيد الحصص المعتمدة
          </p>
        </div>

        <button
          onClick={() => setShowAdd(!showAdd)}
          type="button"
          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-xs px-4 py-2.5 rounded-xl font-bold transition-all shadow-md cursor-pointer self-start sm:self-auto"
        >
          {showAdd ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          <span>{showAdd ? 'إلغاء الإضافة' : 'إضافة كورس جديد'}</span>
        </button>
      </div>

      {/* ADD COURSE ACCORDION FORM */}
      {showAdd && (
        <form
          onSubmit={handleAddSubmit}
          className="bg-[#070d17] border-2 border-blue-500/40 rounded-2xl p-4 md:p-5 my-4 flex flex-col gap-4 animate-in fade-in"
        >
          <div className="flex items-center justify-between border-b border-[#182a44] pb-2.5">
            <div className="text-sm font-extrabold text-blue-400 flex items-center gap-2">
              <Plus className="w-4 h-4" />
              <span>إضافة كورس جديد للمنظومة</span>
            </div>
            <span className="text-[11px] text-slate-400">ستظهر هذه البيانات والمواعيد لولي الأمر فور التسجيل</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            {/* Course Name */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-300 font-bold">اسم الكورس أو المقرر *</label>
              <input
                type="text"
                placeholder="مثال: كيمياء العضوية المتقدمة"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="bg-[#0d1726] border border-[#1f3350] rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-blue-500 transition-all"
              />
            </div>

            {/* Grade / Educational Stage with Custom Toggle */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs text-slate-300 font-bold">المرحلة والصف الدراسي *</label>
                <button
                  type="button"
                  onClick={() => setIsCustomGrade(!isCustomGrade)}
                  className="text-[10px] text-blue-400 hover:text-blue-300 underline font-semibold cursor-pointer"
                >
                  {isCustomGrade ? 'اختيار من القائمة' : 'كتابة مرحلة مخصصة'}
                </button>
              </div>

              {isCustomGrade ? (
                <input
                  type="text"
                  placeholder="اكتب المرحلة والصف الدراسي يدوياً..."
                  value={customGradeInput}
                  onChange={(e) => setCustomGradeInput(e.target.value)}
                  required
                  className="bg-[#0d1726] border border-blue-500/60 rounded-xl px-3.5 py-2.5 text-xs text-blue-200 outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                />
              ) : (
                <select
                  value={grade}
                  onChange={(e) => {
                    if (e.target.value === 'custom') {
                      setIsCustomGrade(true);
                    } else {
                      setGrade(e.target.value);
                    }
                  }}
                  className="bg-[#0d1726] border border-[#1f3350] rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-blue-500 transition-all cursor-pointer"
                >
                  {DEFAULT_GRADES.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                  <option value="custom">+ كتابة مرحلة دراسية أخرى...</option>
                </select>
              )}
            </div>

            {/* Price */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-300 font-bold">سعر الاشتراك للكورس (ج.م) *</label>
              <input
                type="number"
                placeholder="800"
                value={price || ''}
                onChange={(e) => setPrice(Number(e.target.value))}
                required
                className="bg-[#0d1726] border border-[#1f3350] rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-blue-500 font-mono transition-all"
              />
            </div>
          </div>

          {/* Schedule Input with Presets */}
          <div className="bg-[#121927] border border-[#1d314f] rounded-xl p-3.5 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-xs text-amber-300 font-bold flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-amber-400" />
                <span>خانة مواعيد الحصص والبث المباشر (تُطبع تلقائياً على الإيصال ورسالة الواتساب):</span>
              </label>
              <span className="text-[10px] text-slate-400">يمكنك الكتابة بحرية أو اختيار نموذج</span>
            </div>

            <input
              type="text"
              placeholder="مثال: الأحد والأربعاء - الساعة 8:00 مساءً (بث مباشر ومسجل)"
              value={schedule}
              onChange={(e) => setSchedule(e.target.value)}
              required
              className="w-full bg-[#080e18] border border-amber-500/40 rounded-xl px-3.5 py-2.5 text-xs text-amber-200 outline-none focus:border-amber-400 font-medium transition-all"
            />

            {/* Preset chips */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              <span className="text-[11px] text-slate-400 self-center ml-1">نماذج جاهزة سريعة:</span>
              {SCHEDULE_PRESETS.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setSchedule(p)}
                  className={`text-[10px] px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                    schedule === p
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 font-bold'
                      : 'bg-[#18263a] text-slate-300 border-[#223755] hover:text-white'
                  }`}
                >
                  {p.split('-')[0]}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setShowAdd(false)}
              className="bg-[#152336] hover:bg-[#1a2d48] text-slate-300 text-xs px-4 py-2 rounded-xl transition-colors cursor-pointer"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-500 text-white text-xs px-5 py-2 rounded-xl font-bold transition-all shadow-md cursor-pointer flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>حفظ وإضافة الكورس</span>
            </button>
          </div>
        </form>
      )}

      {/* COURSES LIST GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
        {courses.map((course) => (
          <div
            key={course.id}
            className="bg-[#080f1a] border border-[#17273f] hover:border-blue-500/40 rounded-2xl p-4 md:p-5 flex flex-col justify-between gap-3.5 shadow-sm transition-all relative group"
          >
            <div>
              {/* Header Badge */}
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-blue-950/70 text-blue-300 border border-blue-700/40 flex items-center gap-1">
                  <GraduationCap className="w-3.5 h-3.5 text-blue-400" />
                  <span>{course.grade}</span>
                </span>
                <span
                  className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${
                    course.isActive
                      ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                      : 'bg-red-500/15 text-red-300 border-red-500/30'
                  }`}
                >
                  {course.isActive ? 'متاح للتسجيل' : 'مغلق مؤقتاً'}
                </span>
              </div>

              {/* Course Title */}
              <h3 className="font-extrabold text-white text-base mt-2.5 leading-snug">{course.name}</h3>

              {/* Course Schedule (Highlight Box) */}
              <div className="bg-[#1b1509] border border-amber-500/30 rounded-xl p-2.5 mt-3 flex items-start gap-2 text-xs text-amber-200">
                <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-amber-300">مواعيد الحصص المعتمدة: </span>
                  <span className="font-medium text-amber-100">{course.schedule || 'الأحد والأربعاء - الساعة 8:00 مساءً'}</span>
                </div>
              </div>
            </div>

            {/* Footer with Price & Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-[#132238]">
              <div className="flex items-baseline gap-1 text-emerald-400 font-black font-mono text-lg">
                <span>{course.price.toLocaleString('ar-EG')}</span>
                <span className="text-xs text-slate-400 font-sans font-normal">ج.م</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 flex items-center gap-1 font-semibold ml-2">
                  <Users className="w-3.5 h-3.5 text-blue-400" />
                  <span>{course.enrolledCount} مشترك</span>
                </span>

                {/* EDIT BUTTON (Allows editing Grade, Schedule, Name, Price) */}
                <button
                  onClick={() => handleOpenEdit(course)}
                  type="button"
                  className="bg-[#12233b] hover:bg-[#183152] border border-blue-500/40 text-blue-300 text-xs px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                  title="تعديل اسم الكورس والمرحلة الدراسية والمواعيد"
                >
                  <Edit3 className="w-3.5 h-3.5 text-blue-400" />
                  <span>تعديل</span>
                </button>

                {/* Toggle Active Button */}
                <button
                  onClick={() => onToggleCourseActive(course.id)}
                  type="button"
                  className={`text-xs px-3 py-1.5 rounded-xl font-semibold border transition-all cursor-pointer ${
                    course.isActive
                      ? 'bg-[#152336] text-slate-300 border-[#1f3654] hover:bg-[#1d3049]'
                      : 'bg-emerald-950/40 text-emerald-300 border-emerald-500/30 hover:bg-emerald-900/40'
                  }`}
                >
                  {course.isActive ? 'تعطيل' : 'تفعيل'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* EDIT COURSE MODAL */}
      {editingCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#0b1320] border border-blue-500/40 rounded-2xl max-w-xl w-full p-5 shadow-2xl flex flex-col gap-4 text-right">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#16253b]">
              <button
                onClick={() => setEditingCourse(null)}
                className="p-1.5 hover:bg-[#152336] text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-blue-400" />
                <h3 className="font-extrabold text-white text-base">
                  تعديل الكورس والمرحلة الدراسية والمواعيد
                </h3>
              </div>
            </div>

            <form onSubmit={handleEditSubmit} className="flex flex-col gap-3.5">
              {/* Course Name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-slate-300 font-bold">اسم الكورس أو المقرر *</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  required
                  className="bg-[#070d17] border border-[#1b2f48] focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none"
                />
              </div>

              {/* Grade / Stage with custom toggle */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs text-slate-300 font-bold">المرحلة والصف الدراسي *</label>
                  <button
                    type="button"
                    onClick={() => setEditIsCustomGrade(!editIsCustomGrade)}
                    className="text-[10px] text-blue-400 hover:text-blue-300 underline font-semibold cursor-pointer"
                  >
                    {editIsCustomGrade ? 'اختيار من القائمة' : 'كتابة مرحلة مخصصة'}
                  </button>
                </div>

                {editIsCustomGrade ? (
                  <input
                    type="text"
                    placeholder="اكتب المرحلة والصف الدراسي الجديد..."
                    value={editCustomGradeInput}
                    onChange={(e) => setEditCustomGradeInput(e.target.value)}
                    required
                    className="bg-[#070d17] border border-blue-500/60 rounded-xl px-3.5 py-2.5 text-xs text-blue-200 outline-none focus:ring-1 focus:ring-blue-500"
                  />
                ) : (
                  <select
                    value={editGrade}
                    onChange={(e) => {
                      if (e.target.value === 'custom') {
                        setEditIsCustomGrade(true);
                      } else {
                        setEditGrade(e.target.value);
                      }
                    }}
                    className="bg-[#070d17] border border-[#1b2f48] focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none cursor-pointer"
                  >
                    {DEFAULT_GRADES.map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                    <option value="custom">+ كتابة مرحلة دراسية أخرى يدوياً...</option>
                  </select>
                )}
              </div>

              {/* Price */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-slate-300 font-bold">سعر الاشتراك (ج.م) *</label>
                <input
                  type="number"
                  value={editPrice || ''}
                  onChange={(e) => setEditPrice(Number(e.target.value))}
                  required
                  className="bg-[#070d17] border border-[#1b2f48] focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono outline-none"
                />
              </div>

              {/* Schedule */}
              <div className="bg-[#171408] border border-amber-500/40 rounded-xl p-3 flex flex-col gap-2">
                <label className="text-xs text-amber-300 font-bold flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-amber-400" />
                  <span>مواعيد الحصص والمحاضرات (ستظهر في إيصال الواتساب للمشتركين):</span>
                </label>
                <input
                  type="text"
                  value={editSchedule}
                  onChange={(e) => setEditSchedule(e.target.value)}
                  placeholder="مثال: الأحد والأربعاء - الساعة 8:00 مساءً"
                  required
                  className="w-full bg-[#090e17] border border-amber-500/40 focus:border-amber-400 rounded-xl px-3.5 py-2 text-xs text-amber-200 outline-none font-medium"
                />

                {/* Preset Chips */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {SCHEDULE_PRESETS.map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setEditSchedule(p)}
                      className={`text-[10px] px-2 py-0.5 rounded-lg border transition-all cursor-pointer ${
                        editSchedule === p
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 font-bold'
                          : 'bg-[#101b2a] text-slate-300 border-[#1c2e47] hover:text-white'
                      }`}
                    >
                      {p.split('-')[0]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2 pt-2 border-t border-[#16253b]">
                <button
                  type="button"
                  onClick={() => setEditingCourse(null)}
                  className="bg-[#152336] hover:bg-[#1a2d48] text-slate-300 text-xs px-4 py-2 rounded-xl transition-colors cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-500 text-white text-xs px-5 py-2 rounded-xl font-bold transition-all shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>حفظ التعديلات</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
