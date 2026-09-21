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
  Trash2,
  Layers,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
import { Course, Student } from '../../types';
import { formatNumber, formatCurrency } from '../../utils/formatters';

interface CoursesManagementScreenProps {
  courses: Course[];
  grades?: string[];
  students?: Student[];
  onAddCourse: (course: Omit<Course, 'id' | 'enrolledCount'>) => void;
  onUpdateCourse: (id: string, updatedData: Partial<Course>) => void;
  onDeleteCourse: (id: string) => void;
  onToggleCourseActive: (id: string) => void;
  onAddGrade?: (newGrade: string) => void;
  onUpdateGradeName?: (oldGrade: string, newGrade: string) => void;
  onDeleteGrade?: (gradeName: string) => void;
}

const DEFAULT_SCHEDULE_PRESETS = [
  'الأحد والأربعاء - الساعة 8:00 مساءً (بث مباشر ومسجل)',
  'السبت والثلاثاء - الساعة 7:00 مساءً (بث مباشر ومسجل)',
  'الإثنين والخميس - الساعة 8:30 مساءً (بث مباشر ومسجل)',
  'الجمعة - الساعة 2:00 ظهراً (محاضرة أسبوعية مكثفة)',
];

export const CoursesManagementScreen: React.FC<CoursesManagementScreenProps> = ({
  courses,
  grades = [
    'الصف الثالث الثانوي (علمي)',
    'الصف الثالث الثانوي (أدبي)',
    'الصف الثاني الثانوي',
    'الصف الأول الثانوي',
    'المرحلة الإعدادية - الصف الثالث',
    'كورسات التأسيس والمراجعة النهائية',
  ],
  students = [],
  onAddCourse,
  onUpdateCourse,
  onDeleteCourse,
  onToggleCourseActive,
  onAddGrade,
  onUpdateGradeName,
  onDeleteGrade,
}) => {
  // Navigation between Courses Tab and Grades Tab
  const [activeTab, setActiveTab] = useState<'courses' | 'grades'>('courses');

  // Add Course Accordion
  const [showAddCourse, setShowAddCourse] = useState(false);
  const [name, setName] = useState('');
  const [courseGrade, setCourseGrade] = useState(grades[0] || 'الصف الثالث الثانوي (علمي)');
  const [isCustomGrade, setIsCustomGrade] = useState(false);
  const [customGradeInput, setCustomGradeInput] = useState('');
  const [price, setPrice] = useState<number>(800);
  const [schedule, setSchedule] = useState(DEFAULT_SCHEDULE_PRESETS[0]);

  // Edit Course Modal State
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [editName, setEditName] = useState('');
  const [editGrade, setEditGrade] = useState('');
  const [editIsCustomGrade, setEditIsCustomGrade] = useState(false);
  const [editCustomGradeInput, setEditCustomGradeInput] = useState('');
  const [editPrice, setEditPrice] = useState<number>(0);
  const [editSchedule, setEditSchedule] = useState('');

  // Delete Course Confirmation Modal State
  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);

  // Grades Management States
  const [showAddGradeForm, setShowAddGradeForm] = useState(false);
  const [newGradeInput, setNewGradeInput] = useState('');
  const [editingGrade, setEditingGrade] = useState<string | null>(null);
  const [editingGradeNewName, setEditingGradeNewName] = useState('');
  const [gradeToDelete, setGradeToDelete] = useState<string | null>(null);

  // Open Edit Course Modal
  const handleOpenEditCourse = (course: Course) => {
    setEditingCourse(course);
    setEditName(course.name);
    setEditPrice(course.price);
    setEditSchedule(course.schedule || DEFAULT_SCHEDULE_PRESETS[0]);

    if (grades.includes(course.grade)) {
      setEditGrade(course.grade);
      setEditIsCustomGrade(false);
      setEditCustomGradeInput('');
    } else {
      setEditGrade('custom');
      setEditIsCustomGrade(true);
      setEditCustomGradeInput(course.grade);
    }
  };

  // Submit Add Course
  const handleAddCourseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || price <= 0) return;

    const resolvedGrade =
      isCustomGrade && customGradeInput.trim() ? customGradeInput.trim() : courseGrade;

    onAddCourse({
      name: name.trim(),
      grade: resolvedGrade,
      price: Number(price),
      isActive: true,
      schedule: schedule.trim() || undefined,
    });

    // If new custom grade, auto-add to grades list
    if (isCustomGrade && customGradeInput.trim() && onAddGrade && !grades.includes(customGradeInput.trim())) {
      onAddGrade(customGradeInput.trim());
    }

    setName('');
    setPrice(800);
    setSchedule(DEFAULT_SCHEDULE_PRESETS[0]);
    setIsCustomGrade(false);
    setCustomGradeInput('');
    setShowAddCourse(false);
  };

  // Submit Edit Course
  const handleEditCourseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCourse || !editName.trim() || editPrice <= 0) return;

    const resolvedGrade =
      editIsCustomGrade && editCustomGradeInput.trim()
        ? editCustomGradeInput.trim()
        : editGrade;

    onUpdateCourse(editingCourse.id, {
      name: editName.trim(),
      grade: resolvedGrade,
      price: Number(editPrice),
      schedule: editSchedule.trim() || undefined,
    });

    // If edited to a new grade that doesn't exist, optionally save it
    if (editIsCustomGrade && editCustomGradeInput.trim() && onAddGrade && !grades.includes(editCustomGradeInput.trim())) {
      onAddGrade(editCustomGradeInput.trim());
    }

    setEditingCourse(null);
  };

  // Confirm Delete Course
  const handleConfirmDeleteCourse = () => {
    if (courseToDelete) {
      onDeleteCourse(courseToDelete.id);
      setCourseToDelete(null);
    }
  };

  // Submit Add Grade
  const handleAddGradeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newGradeInput.trim();
    if (!trimmed) return;

    if (onAddGrade) {
      onAddGrade(trimmed);
    }
    setNewGradeInput('');
    setShowAddGradeForm(false);
  };

  // Open Edit Grade Modal
  const handleOpenEditGrade = (gradeName: string) => {
    setEditingGrade(gradeName);
    setEditingGradeNewName(gradeName);
  };

  // Submit Edit Grade
  const handleEditGradeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGrade || !editingGradeNewName.trim()) return;

    if (onUpdateGradeName) {
      onUpdateGradeName(editingGrade, editingGradeNewName.trim());
    }
    setEditingGrade(null);
  };

  // Confirm Delete Grade
  const handleConfirmDeleteGrade = () => {
    if (gradeToDelete && onDeleteGrade) {
      onDeleteGrade(gradeToDelete);
      setGradeToDelete(null);
    }
  };

  return (
    <div
      id="courses-management-screen"
      className="bg-[#0b1320] border border-[#192b42] rounded-2xl p-4 md:p-7 shadow-2xl flex-1 flex flex-col transition-all text-right gap-6"
    >
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#16253b]">
        <div>
          <h2 className="text-lg md:text-xl font-extrabold text-white flex items-center gap-2.5">
            <BookOpen className="w-5 h-5 text-blue-400" />
            <span>إدارة وتعديل الكورسات والمراحل والصفوف الدراسية</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1 font-medium">
            أزرار حذف وتعديل سريعة للمراحل والصفوف الدراسية والكورسات مع التحديث التلقائي لكافة المشتركين
          </p>
        </div>

        {/* Top Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveTab(activeTab === 'courses' ? 'grades' : 'courses')}
            type="button"
            className={`flex items-center gap-1.5 text-xs px-3.5 py-2.5 rounded-xl font-bold transition-all border cursor-pointer ${
              activeTab === 'grades'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-emerald-400/40 shadow-md'
                : 'bg-[#122238] hover:bg-[#1a2d48] text-blue-300 border-blue-500/40'
            }`}
            title="الانتقال المباشر لشاشة حذف وتعديل وإضافة المراحل والصفوف الدراسية"
          >
            <Layers className="w-4 h-4 text-emerald-400" />
            <span>{activeTab === 'grades' ? 'عرض الكورسات' : 'إدارة وحذف وتعديل المراحل'} ({grades.length})</span>
          </button>

          {activeTab === 'courses' ? (
            <button
              onClick={() => setShowAddCourse(!showAddCourse)}
              type="button"
              className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-xs px-4 py-2.5 rounded-xl font-bold transition-all shadow-md cursor-pointer"
            >
              {showAddCourse ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              <span>{showAddCourse ? 'إلغاء الإضافة' : 'إضافة كورس جديد'}</span>
            </button>
          ) : (
            <button
              onClick={() => setShowAddGradeForm(!showAddGradeForm)}
              type="button"
              className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs px-4 py-2.5 rounded-xl font-bold transition-all shadow-md cursor-pointer"
            >
              {showAddGradeForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              <span>{showAddGradeForm ? 'إلغاء' : 'إضافة مرحلة / صف دراسي جديد'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Primary Tabs Navigation */}
      <div className="flex items-center gap-2 p-1.5 bg-[#070d18] border border-[#17273f] rounded-xl">
        <button
          type="button"
          onClick={() => setActiveTab('courses')}
          className={`flex-1 flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-lg text-xs md:text-sm font-bold transition-all cursor-pointer ${
            activeTab === 'courses'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-[#111e30]'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>الكورسات والمقررات الدراسية ({formatNumber(courses.length)})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('grades')}
          className={`flex-1 flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-lg text-xs md:text-sm font-bold transition-all cursor-pointer ${
            activeTab === 'grades'
              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-[#111e30]'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>المراحل والصفوف الدراسية ({formatNumber(grades.length)})</span>
        </button>
      </div>

      {/* ======================= TAB 1: COURSES MANAGEMENT ======================= */}
      {activeTab === 'courses' && (
        <div className="space-y-6 animate-fadeIn">
          {/* ADD COURSE ACCORDION FORM */}
          {showAddCourse && (
            <form
              onSubmit={handleAddCourseSubmit}
              className="bg-[#070d17] border-2 border-blue-500/40 rounded-2xl p-4 md:p-5 flex flex-col gap-4 animate-in fade-in"
            >
              <div className="flex items-center justify-between border-b border-[#182a44] pb-2.5">
                <div className="text-sm font-extrabold text-blue-400 flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  <span>إضافة كورس ومقرر جديد للمنظومة</span>
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

                {/* Grade / Stage */}
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
                      value={courseGrade}
                      onChange={(e) => {
                        if (e.target.value === 'custom') {
                          setIsCustomGrade(true);
                        } else {
                          setCourseGrade(e.target.value);
                        }
                      }}
                      className="bg-[#0d1726] border border-[#1f3350] rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-blue-500 transition-all cursor-pointer"
                    >
                      {grades.map((g) => (
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

              {/* Schedule */}
              <div className="bg-[#121927] border border-[#1d314f] rounded-xl p-3.5 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs text-amber-300 font-bold flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-amber-400" />
                    <span>مواعيد الحصص والبث المباشر (تُطبع تلقائياً على الإيصال ورسالة الواتساب):</span>
                  </label>
                  <span className="text-[10px] text-slate-400">يمكنك الاختيار من النماذج أو الكتابة</span>
                </div>

                <input
                  type="text"
                  placeholder="مثال: الأحد والأربعاء - الساعة 8:00 مساءً (بث مباشر ومسجل)"
                  value={schedule}
                  onChange={(e) => setSchedule(e.target.value)}
                  required
                  className="w-full bg-[#080e18] border border-amber-500/40 rounded-xl px-3.5 py-2.5 text-xs text-amber-200 outline-none focus:border-amber-400 font-medium transition-all"
                />

                <div className="flex flex-wrap gap-1.5 pt-1">
                  <span className="text-[11px] text-slate-400 self-center ml-1">نماذج جاهزة:</span>
                  {DEFAULT_SCHEDULE_PRESETS.map((p) => (
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
                  onClick={() => setShowAddCourse(false)}
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {courses.map((course) => {
              const enrolledInCourse = students.filter((s) => s.course === course.name).length || course.enrolledCount;
              return (
                <div
                  key={course.id}
                  className="bg-[#080f1a] border border-[#17273f] hover:border-blue-500/40 rounded-2xl p-4 md:p-5 flex flex-col justify-between gap-3.5 shadow-sm transition-all relative group"
                >
                  <div>
                    {/* Header Badge: Grade with Direct Edit & Delete Stage Buttons & Status */}
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-blue-950/70 text-blue-300 border border-blue-700/40 flex items-center gap-1">
                          <GraduationCap className="w-3.5 h-3.5 text-blue-400" />
                          <span>{course.grade}</span>
                        </span>

                        {/* Direct Button to Edit Stage Name */}
                        <button
                          type="button"
                          onClick={() => handleOpenEditGrade(course.grade)}
                          title={`تعديل اسم مرحلة (${course.grade}) في جميع الكورسات`}
                          className="bg-[#102033] hover:bg-[#193252] border border-blue-500/40 text-blue-300 text-[10px] px-2 py-0.5 rounded-md font-bold flex items-center gap-1 transition-all cursor-pointer"
                        >
                          <Edit3 className="w-3 h-3 text-blue-400" />
                          <span>تعديل المرحلة</span>
                        </button>

                        {/* Direct Button to Delete Stage */}
                        <button
                          type="button"
                          onClick={() => setGradeToDelete(course.grade)}
                          title={`حذف مرحلة (${course.grade}) من المنظومة`}
                          className="bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/40 text-rose-300 text-[10px] px-1.5 py-0.5 rounded-md font-bold flex items-center gap-1 transition-all cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3 text-rose-400" />
                          <span>حذف المرحلة</span>
                        </button>
                      </div>

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

                    {/* Course Schedule */}
                    <div className="bg-[#1b1509] border border-amber-500/30 rounded-xl p-2.5 mt-3 flex items-start gap-2 text-xs text-amber-200">
                      <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-amber-300">مواعيد الحصص المعتمدة: </span>
                        <span className="font-medium text-amber-100">
                          {course.schedule || 'الأحد والأربعاء - الساعة 8:00 مساءً'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Footer with Price & Actions: Edit & Delete */}
                  <div className="flex items-center justify-between pt-3 border-t border-[#132238]">
                    <div className="flex items-baseline gap-1 text-emerald-400 font-black font-mono text-lg" dir="ltr">
                      <span>{course.price.toLocaleString('en-US')}</span>
                      <span className="text-xs text-slate-400 font-sans font-normal">ج.م</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400 flex items-center gap-1 font-semibold ml-1">
                        <Users className="w-3.5 h-3.5 text-blue-400" />
                        <span>{formatNumber(enrolledInCourse)} مشترك</span>
                      </span>

                      {/* EDIT BUTTON (Allows editing Grade, Schedule, Name, Price) */}
                      <button
                        onClick={() => handleOpenEditCourse(course)}
                        type="button"
                        className="bg-[#12233b] hover:bg-[#183152] border border-blue-500/40 text-blue-300 text-xs px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                        title="تعديل اسم الكورس والمرحلة والصف الدراسي والمواعيد"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-blue-400" />
                        <span>تعديل</span>
                      </button>

                      {/* DELETE BUTTON (Requested by user) */}
                      <button
                        onClick={() => setCourseToDelete(course)}
                        type="button"
                        className="bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/40 text-rose-300 text-xs px-2.5 py-1.5 rounded-xl font-bold flex items-center gap-1 transition-all cursor-pointer"
                        title="حذف الكورس والمرحلة من المنظومة"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                        <span>حذف</span>
                      </button>

                      {/* Toggle Active Button */}
                      <button
                        onClick={() => onToggleCourseActive(course.id)}
                        type="button"
                        className={`text-xs px-2.5 py-1.5 rounded-xl font-semibold border transition-all cursor-pointer ${
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
              );
            })}
          </div>
        </div>
      )}

      {/* ======================= TAB 2: GRADES & STAGES MANAGEMENT ======================= */}
      {activeTab === 'grades' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Quick Add Grade Form */}
          {showAddGradeForm && (
            <form
              onSubmit={handleAddGradeSubmit}
              className="bg-[#070d17] border-2 border-emerald-500/40 rounded-2xl p-4 md:p-5 flex flex-col sm:flex-row items-center gap-3 animate-in fade-in"
            >
              <div className="flex-1 w-full flex flex-col gap-1">
                <label className="text-xs text-emerald-300 font-bold flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4 text-emerald-400" />
                  <span>اسم المرحلة أو الصف الدراسي الجديد *</span>
                </label>
                <input
                  type="text"
                  required
                  value={newGradeInput}
                  onChange={(e) => setNewGradeInput(e.target.value)}
                  placeholder="مثال: الصف الأول الثانوي (لغات) أو الصف الثالث الإعدادي"
                  className="bg-[#0d1726] border border-[#1f3350] focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none transition-all w-full"
                />
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto pt-2 sm:pt-4">
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs px-5 py-2.5 rounded-xl font-bold flex items-center gap-1.5 shadow-md cursor-pointer transition-all"
                >
                  <Save className="w-4 h-4" />
                  <span>حفظ وإضافة المرحلة</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddGradeForm(false)}
                  className="bg-[#152336] hover:bg-[#1a2d48] text-slate-300 text-xs px-3.5 py-2.5 rounded-xl font-medium cursor-pointer transition-colors"
                >
                  إلغاء
                </button>
              </div>
            </form>
          )}

          {/* Grades List Table / Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {grades.map((gradeItem, idx) => {
              const matchedCourses = courses.filter((c) => c.grade === gradeItem);
              const matchedStudents = students.filter((s) => s.grade === gradeItem);

              return (
                <div
                  key={gradeItem + idx}
                  className="bg-[#080f1a] border border-[#17273f] hover:border-emerald-500/40 rounded-2xl p-4 flex flex-col justify-between gap-4 transition-all group"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="w-7 h-7 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full font-semibold">
                        مرحلة معتمدة
                      </span>
                    </div>

                    <h3 className="text-white font-extrabold text-sm md:text-base mt-2.5 flex items-center gap-2">
                      <GraduationCap className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>{gradeItem}</span>
                    </h3>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
                      <div className="bg-[#0d1726] border border-[#172b45] p-2 rounded-xl text-center">
                        <span className="text-slate-400 block text-[10px]">الكورسات المرتبطة</span>
                        <span className="font-extrabold text-blue-400 font-mono text-sm" dir="ltr">
                          {formatNumber(matchedCourses.length)} كورس
                        </span>
                      </div>
                      <div className="bg-[#0d1726] border border-[#172b45] p-2 rounded-xl text-center">
                        <span className="text-slate-400 block text-[10px]">الطلاب المسجلين</span>
                        <span className="font-extrabold text-emerald-400 font-mono text-sm" dir="ltr">
                          {formatNumber(matchedStudents.length)} طالب
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions for this Grade: Edit & Delete (Requested by user) */}
                  <div className="flex items-center justify-between pt-3 border-t border-[#132238]">
                    <span className="text-[11px] text-slate-500">إجراءات المرحلة:</span>

                    <div className="flex items-center gap-2">
                      {/* Edit Grade Name Button */}
                      <button
                        type="button"
                        onClick={() => handleOpenEditGrade(gradeItem)}
                        className="bg-[#112239] hover:bg-[#183152] border border-blue-500/40 text-blue-300 text-xs px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                        title="تعديل وتغيير اسم المرحلة والصف الدراسي"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-blue-400" />
                        <span>تعديل المرحلة</span>
                      </button>

                      {/* Delete Grade Button */}
                      <button
                        type="button"
                        onClick={() => setGradeToDelete(gradeItem)}
                        className="bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/40 text-rose-300 text-xs px-2.5 py-1.5 rounded-xl font-bold flex items-center gap-1 transition-all cursor-pointer"
                        title="حذف المرحلة والصف الدراسي من المنظومة"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                        <span>حذف</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ======================= MODAL: EDIT COURSE & STAGE ======================= */}
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
                  تعديل الكورس والمرحلة والصف الدراسي والمواعيد
                </h3>
              </div>
            </div>

            <form onSubmit={handleEditCourseSubmit} className="flex flex-col gap-3.5">
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
                    {grades.map((g) => (
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

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {DEFAULT_SCHEDULE_PRESETS.map((p) => (
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

      {/* ======================= MODAL: CONFIRM DELETE COURSE ======================= */}
      {courseToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#0f172a] border border-rose-500/50 rounded-2xl max-w-md w-full p-5 shadow-2xl flex flex-col gap-4 text-right">
            <div className="flex items-center gap-3 text-rose-400 border-b border-rose-500/20 pb-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5 text-rose-400" />
              </div>
              <div>
                <h3 className="font-extrabold text-white text-sm">تأكيد حذف الكورس والمرحلة الدراسية</h3>
                <p className="text-[11px] text-slate-400">هذا الإجراء سيقوم بحذف الكورس من قائمة الكورسات المتاحة</p>
              </div>
            </div>

            <div className="bg-[#141e30] border border-[#1e2f47] p-3.5 rounded-xl space-y-2 text-xs">
              <div className="text-white font-bold">{courseToDelete.name}</div>
              <div className="text-blue-300 flex items-center gap-1">
                <GraduationCap className="w-3.5 h-3.5" />
                <span>المرحلة: {courseToDelete.grade}</span>
              </div>
              <div className="text-amber-300 flex items-center gap-1 text-[11px]">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>مسجل به حالياً ({courseToDelete.enrolledCount}) مشترك</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#1e293b]">
              <button
                type="button"
                onClick={() => setCourseToDelete(null)}
                className="bg-[#1e293b] hover:bg-[#334155] text-slate-300 text-xs px-4 py-2 rounded-xl transition-colors cursor-pointer"
              >
                تراجع
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteCourse}
                className="bg-rose-600 hover:bg-rose-500 text-white text-xs px-5 py-2 rounded-xl font-bold transition-all shadow-md cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>نعم، حذف الكورس الآن</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================= MODAL: EDIT GRADE / STAGE NAME ======================= */}
      {editingGrade && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#0b1320] border border-blue-500/40 rounded-2xl max-w-md w-full p-5 shadow-2xl flex flex-col gap-4 text-right">
            <div className="flex items-center justify-between pb-3 border-b border-[#16253b]">
              <button
                onClick={() => setEditingGrade(null)}
                className="p-1.5 hover:bg-[#152336] text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-blue-400" />
                <h3 className="font-extrabold text-white text-base">تعديل اسم المرحلة والصف الدراسي</h3>
              </div>
            </div>

            <form onSubmit={handleEditGradeSubmit} className="flex flex-col gap-3.5">
              <div className="p-3 bg-blue-950/40 border border-blue-500/30 rounded-xl text-xs text-blue-300 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <span>
                  عند تعديل اسم المرحلة، سيتم تحديث جميع الكورسات والطلاب المسجلين بهذه المرحلة تلقائياً!
                </span>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-slate-300 font-bold">اسم المرحلة والصف الدراسي الجديد *</label>
                <input
                  type="text"
                  required
                  value={editingGradeNewName}
                  onChange={(e) => setEditingGradeNewName(e.target.value)}
                  placeholder="مثال: الصف الثالث الثانوي (علمي علوم)"
                  className="bg-[#070d17] border border-[#1b2f48] focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#16253b]">
                <button
                  type="button"
                  onClick={() => setEditingGrade(null)}
                  className="bg-[#152336] hover:bg-[#1a2d48] text-slate-300 text-xs px-4 py-2 rounded-xl transition-colors cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-500 text-white text-xs px-5 py-2 rounded-xl font-bold transition-all shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>تحديث وحفظ المرحلة</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================= MODAL: CONFIRM DELETE GRADE ======================= */}
      {gradeToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#0f172a] border border-rose-500/50 rounded-2xl max-w-md w-full p-5 shadow-2xl flex flex-col gap-4 text-right">
            <div className="flex items-center gap-3 text-rose-400 border-b border-rose-500/20 pb-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5 text-rose-400" />
              </div>
              <div>
                <h3 className="font-extrabold text-white text-sm">تأكيد حذف المرحلة والصف الدراسي</h3>
                <p className="text-[11px] text-slate-400">هل تريد بالتأكيد إزالة هذه المرحلة من قائمة المراحل؟</p>
              </div>
            </div>

            <div className="bg-[#141e30] border border-[#1e2f47] p-3.5 rounded-xl space-y-1 text-xs">
              <div className="text-white font-bold flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4 text-emerald-400" />
                <span>{gradeToDelete}</span>
              </div>
              <p className="text-slate-400 text-[11px] mt-1">
                لن يتم حذف الطلاب المشتركين سابقاً، ولكن ستتم إزالة المرحلة من القوائم النشطة.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#1e293b]">
              <button
                type="button"
                onClick={() => setGradeToDelete(null)}
                className="bg-[#1e293b] hover:bg-[#334155] text-slate-300 text-xs px-4 py-2 rounded-xl transition-colors cursor-pointer"
              >
                تراجع
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteGrade}
                className="bg-rose-600 hover:bg-rose-500 text-white text-xs px-5 py-2 rounded-xl font-bold transition-all shadow-md cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>نعم، حذف المرحلة</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
