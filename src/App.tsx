/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { NavigationScreen, Student, Course, Expense, StaffMember, WhatsAppTemplate, AuditLog, WhatsAppIntegrationConfig, CenterSettings, SupabaseConfig } from './types';
import {
  getStoredStudents,
  saveStoredStudents,
  getStoredCourses,
  saveStoredCourses,
  getStoredExpenses,
  saveStoredExpenses,
  getStoredStaff,
  saveStoredStaff,
  getStoredTemplates,
  saveStoredTemplates,
  getStoredLogs,
  saveStoredLogs,
  getStoredWhatsConfig,
  saveStoredWhatsConfig,
  getStoredCenterSettings,
  saveStoredCenterSettings,
  defaultCenterSettings,
  getStoredSupabaseConfig,
  saveStoredSupabaseConfig,
  defaultSupabaseConfig,
  getStoredGrades,
  saveStoredGrades,
  defaultGrades,
  exportDatabaseToJson,
  exportStudentsToExcel,
} from './utils/storage';
import { initialStudents, initialCourses, initialExpenses, initialStaff, initialWhatsAppTemplates, initialAuditLogs } from './data/initialData';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { NewStudentScreen } from './components/screens/NewStudentScreen';
import { StudentsListScreen } from './components/screens/StudentsListScreen';
import { ExpensesScreen } from './components/screens/ExpensesScreen';
import { StaffSalariesScreen } from './components/screens/StaffSalariesScreen';
import { AnalyticsScreen } from './components/screens/AnalyticsScreen';
import { WhatsAppCampaignsScreen } from './components/screens/WhatsAppCampaignsScreen';
import { CoursesManagementScreen } from './components/screens/CoursesManagementScreen';
import { StaffPermissionsScreen } from './components/screens/StaffPermissionsScreen';
import { AuditLogScreen } from './components/screens/AuditLogScreen';
import { CloudSettingsScreen } from './components/screens/CloudSettingsScreen';
import { StudentSuccessModal } from './components/modals/StudentSuccessModal';
import { ReceiptViewModal } from './components/modals/ReceiptViewModal';
import { DirectWhatsAppModal } from './components/modals/DirectWhatsAppModal';
import { InstallmentSettleModal } from './components/modals/InstallmentSettleModal';
import { getDueInstallments } from './utils/installmentUtils';

export default function App() {
  // Navigation State - defaults to 'new-student' as in screenshot
  const [currentScreen, setCurrentScreen] = useState<NavigationScreen>('new-student');
  const [studentsListInitialFilter, setStudentsListInitialFilter] = useState<
    'all' | 'full' | 'pending_installment' | 'paid_in_full' | 'due_soon'
  >('all');

  // Persistence States
  const [students, setStudents] = useState<Student[]>(() => getStoredStudents());
  const [courses, setCourses] = useState<Course[]>(() => getStoredCourses());
  const [expenses, setExpenses] = useState<Expense[]>(() => getStoredExpenses());
  const [staff, setStaff] = useState<StaffMember[]>(() => getStoredStaff());
  const [templates, setTemplates] = useState<WhatsAppTemplate[]>(() => getStoredTemplates());
  const [logs, setLogs] = useState<AuditLog[]>(() => getStoredLogs());
  const [whatsAppConfig, setWhatsAppConfig] = useState<WhatsAppIntegrationConfig>(() => getStoredWhatsConfig());
  const [centerSettings, setCenterSettings] = useState<CenterSettings>(() => getStoredCenterSettings());
  const [supabaseConfig, setSupabaseConfig] = useState<SupabaseConfig>(() => getStoredSupabaseConfig());
  const [grades, setGrades] = useState<string[]>(() => getStoredGrades());

  // UI States - initialized from localStorage (defaults to true for dark mode)
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    try {
      const savedTheme = localStorage.getItem('el_saqqa_theme');
      if (savedTheme !== null) {
        return savedTheme === 'dark';
      }
    } catch (e) {
      // ignore
    }
    return true;
  });
  const [successStudent, setSuccessStudent] = useState<Student | null>(null);
  const [viewReceiptUrl, setViewReceiptUrl] = useState<string | null>(null);
  const [whatsAppStudent, setWhatsAppStudent] = useState<Student | null>(null);
  const [whatsAppMessageType, setWhatsAppMessageType] = useState<'registration' | 'installment_reminder'>('registration');
  const [settlingStudentFromSidebar, setSettlingStudentFromSidebar] = useState<Student | null>(null);
  const [storageNotification, setStorageNotification] = useState<string | null>(null);
  const [settingsInitialTab, setSettingsInitialTab] = useState<'header' | 'supabase'>('header');

  // Compute approaching / overdue installments based on registration date
  const dueInstallments = useMemo(() => getDueInstallments(students), [students]);

  // Sync dark/light theme to document and body
  useEffect(() => {
    try {
      localStorage.setItem('el_saqqa_theme', isDarkMode ? 'dark' : 'light');
    } catch (e) {}

    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
      root.classList.remove('light');
      document.body.classList.add('dark');
      document.body.classList.remove('light');
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
      document.body.classList.remove('dark');
      document.body.classList.add('light');
    }
  }, [isDarkMode]);

  // Sync to localStorage
  useEffect(() => {
    saveStoredStudents(students);
  }, [students]);

  useEffect(() => {
    saveStoredCourses(courses);
  }, [courses]);

  useEffect(() => {
    saveStoredExpenses(expenses);
  }, [expenses]);

  useEffect(() => {
    saveStoredStaff(staff);
  }, [staff]);

  useEffect(() => {
    saveStoredTemplates(templates);
  }, [templates]);

  useEffect(() => {
    saveStoredLogs(logs);
  }, [logs]);

  useEffect(() => {
    saveStoredWhatsConfig(whatsAppConfig);
  }, [whatsAppConfig]);

  useEffect(() => {
    saveStoredCenterSettings(centerSettings);
  }, [centerSettings]);

  useEffect(() => {
    saveStoredSupabaseConfig(supabaseConfig);
  }, [supabaseConfig]);

  useEffect(() => {
    saveStoredGrades(grades);
  }, [grades]);

  // Handler to update Supabase Config
  const handleUpdateSupabaseConfig = (newConfig: SupabaseConfig) => {
    setSupabaseConfig(newConfig);
    saveStoredSupabaseConfig(newConfig);
    setStorageNotification('تم حفظ وتحديث إعدادات Supabase بنجاح في LocalStorage');
    setTimeout(() => setStorageNotification(null), 3500);

    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      action: 'تحديث إعدادات السحابة Supabase',
      user: centerSettings.managerName || 'أك. محمود عزت',
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      details: `تم حفظ بيانات Supabase (Project URL: ${newConfig.projectUrl || 'غير محدد'})، وحالة الاتصال: (${newConfig.isConnected ? 'متصل' : 'غير متصل'})`,
      type: 'info',
    };
    setLogs((prev) => [newLog, ...prev]);
  };

  // Handler to update Center Settings
  const handleUpdateCenterSettings = (newSettings: CenterSettings) => {
    setCenterSettings(newSettings);
    saveStoredCenterSettings(newSettings);
    setStorageNotification('تم حفظ وتحديث بيانات المنظومة والترويسة بنجاح في LocalStorage');
    setTimeout(() => setStorageNotification(null), 3500);

    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      action: 'تحديث بيانات وهوية المنظومة والمركز',
      user: newSettings.managerName || 'أك. محمود عزت',
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      details: `تم تحديث اسم المركز إلى (${newSettings.centerName})، هاتف التواصل: (${newSettings.phoneNumber})، والمنصة: (${newSettings.platformUrl})`,
      type: 'info',
    };
    setLogs((prev) => [newLog, ...prev]);
  };

  // Handler to update WhatsApp Gateway Settings
  const handleUpdateWhatsConfig = (newSettings: Partial<WhatsAppIntegrationConfig>) => {
    setWhatsAppConfig((prev) => {
      const updated = { ...prev, ...newSettings };
      return updated;
    });

    const isToggling = 'isConnected' in newSettings;
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      action: isToggling
        ? (newSettings.isConnected ? 'تفعيل اتصال بوابة الواتساب' : 'إيقاف اتصال بوابة الواتساب')
        : 'تحديث إعدادات بوابة وربط الواتساب',
      user: 'أك. محمود عزت',
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      details: isToggling
        ? `تم ${newSettings.isConnected ? 'ربط وتفعيل' : 'فصل'} بوابة الواتساب بنجاح`
        : 'تم حفظ وتحديث إعدادات خادم الواتساب والربط بالمنظومة',
      type: 'info',
    };
    setLogs((prev) => [newLog, ...prev]);
  };

  // Compute Total Revenue
  const totalRevenue = students.reduce((acc, curr) => acc + curr.amountPaid, 0);

  // Register New Student Handler
  const handleRegisterStudent = (
    newStudentData: Omit<Student, 'id' | 'code' | 'createdAt' | 'status'>
  ) => {
    const nextIndex = students.length + 1;
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const generatedCode = `CHEM-2025-${randomSuffix}`;

    const newStudent: Student = {
      ...newStudentData,
      id: `std-${Date.now()}`,
      code: generatedCode,
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      status: 'active',
    };

    const updatedStudents = [newStudent, ...students];
    setStudents(updatedStudents);

    // Increment course enrolled count
    setCourses((prev) =>
      prev.map((c) =>
        c.name === newStudent.course ? { ...c, enrolledCount: c.enrolledCount + 1 } : c
      )
    );

    // Add Audit Log
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      action: 'تسجيل اشتراك طالب جديد وتأكيد الدفع',
      user: 'أك. محمود عزت',
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      details: `تم تفعيل كود ${generatedCode} للطالب ${newStudent.name} بمبلغ ${newStudent.amountPaid} ج.م`,
      type: 'success',
    };
    setLogs((prev) => [newLog, ...prev]);

    // Show Success Modal
    setSuccessStudent(newStudent);
  };

  // Delete Student
  const handleDeleteStudent = (id: string) => {
    const target = students.find((s) => s.id === id);
    if (!target) return;
    if (window.confirm(`هل أنت متأكد من حذف اشتراك الطالب: ${target.name}؟`)) {
      setStudents((prev) => prev.filter((s) => s.id !== id));
      const newLog: AuditLog = {
        id: `log-${Date.now()}`,
        action: 'حذف اشتراك طالب',
        user: 'أك. محمود عزت',
        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
        details: `تم إلغاء تفعيل وحذف بيانات الطالب ${target.name}`,
        type: 'warning',
      };
      setLogs((prev) => [newLog, ...prev]);
    }
  };

  // Update Student (e.g. Settle Installment / Mark as Paid)
  const handleUpdateStudent = (id: string, updatedData: Partial<Student>) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updatedData } : s))
    );

    const target = students.find((s) => s.id === id);
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      action:
        updatedData.installmentStatus === 'paid_in_full'
          ? 'سداد قسط وتصفية حساب الطالب'
          : 'تحديث بيانات الطالب',
      user: 'أك. محمود عزت',
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      details:
        updatedData.installmentStatus === 'paid_in_full'
          ? `تم سداد وتسوية قسط الطالب (${target?.name}) وتحديث الحالة إلى (تم دفع القسط) بنجاح`
          : `تم تحديث بيانات الطالب (${target?.name})`,
      type: 'success',
    };
    setLogs((prev) => [newLog, ...prev]);
  };

  // Add Expense
  const handleAddExpense = (expenseData: Omit<Expense, 'id'>) => {
    const newExpense: Expense = {
      ...expenseData,
      id: `exp-${Date.now()}`,
    };
    setExpenses((prev) => [newExpense, ...prev]);

    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      action: 'تسجيل بند مصروف جديد',
      user: 'أك. محمود عزت',
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      details: `تم صرف مبلغ ${newExpense.amount} ج.م لبند (${newExpense.title})`,
      type: 'info',
    };
    setLogs((prev) => [newLog, ...prev]);
  };

  // Delete Expense
  const handleDeleteExpense = (id: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  };

  // Toggle Staff Payment Status
  const handleToggleStaffStatus = (id: string) => {
    setStaff((prev) =>
      prev.map((st) =>
        st.id === id
          ? { ...st, status: st.status === 'مدفوع' ? 'معلق' : 'مدفوع' }
          : st
      )
    );
  };

  // Add Staff Member
  const handleAddStaff = (newStaffData: Omit<StaffMember, 'id'>) => {
    const newStaff: StaffMember = {
      ...newStaffData,
      id: `st-${Date.now()}`,
    };
    setStaff((prev) => [...prev, newStaff]);

    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      action: 'إضافة عضو جديد وتعيين الصلاحيات',
      user: 'أك. محمود عزت',
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      details: `تمت إضافة (${newStaff.name} - ${newStaff.role}) بصلاحيات: ${newStaff.permissions.join(', ')}`,
      type: 'info',
    };
    setLogs((prev) => [newLog, ...prev]);
  };

  // Update Staff Member & Permissions
  const handleUpdateStaff = (id: string, updatedData: Partial<StaffMember>) => {
    setStaff((prev) =>
      prev.map((st) => (st.id === id ? { ...st, ...updatedData } : st))
    );

    const target = staff.find((st) => st.id === id);
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      action: 'تحديث بيانات وصلاحيات عضو فريق العمل',
      user: 'أك. محمود عزت',
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      details: `تم تحديث صلاحيات (${target?.name || 'عضو'})`,
      type: 'info',
    };
    setLogs((prev) => [newLog, ...prev]);
  };

  // Delete Staff Member
  const handleDeleteStaff = (id: string) => {
    const target = staff.find((st) => st.id === id);
    setStaff((prev) => prev.filter((st) => st.id !== id));

    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      action: 'حذف عضو من فريق العمل',
      user: 'أك. محمود عزت',
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      details: `تم حذف (${target?.name || 'عضو'}) من فريق العمل وسحب كافة الصلاحيات`,
      type: 'warning',
    };
    setLogs((prev) => [newLog, ...prev]);
  };

  // Add Course
  const handleAddCourse = (courseData: Omit<Course, 'id' | 'enrolledCount'>) => {
    const newCourse: Course = {
      ...courseData,
      id: `c-${Date.now()}`,
      enrolledCount: 0,
    };
    setCourses((prev) => [...prev, newCourse]);
  };

  // Update Course (Name, Grade, Schedule, Price)
  const handleUpdateCourse = (id: string, updatedData: Partial<Course>) => {
    setCourses((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updatedData } : c))
    );

    const target = courses.find((c) => c.id === id);
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      action: 'تعديل بيانات الكورس والمواعيد',
      user: 'أك. محمود عزت',
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      details: `تم تعديل كورس (${updatedData.name || target?.name || 'كورس'}) والمرحلة والمواعيد بنجاح`,
      type: 'info',
    };
    setLogs((prev) => [newLog, ...prev]);
  };

  // Toggle Course Active
  const handleToggleCourseActive = (id: string) => {
    setCourses((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isActive: !c.isActive } : c))
    );
  };

  // Delete Course Handler
  const handleDeleteCourse = (id: string) => {
    const target = courses.find((c) => c.id === id);
    setCourses((prev) => prev.filter((c) => c.id !== id));

    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      action: 'حذف كورس ومقرر دراسي',
      user: centerSettings.managerName || 'أك. محمود عزت',
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      details: `تم حذف كورس (${target?.name || 'كورس'}) الخاص بمرحلة (${target?.grade || 'غير محدد'})`,
      type: 'warning',
    };
    setLogs((prev) => [newLog, ...prev]);
    setStorageNotification(`تم حذف كورس (${target?.name || 'الكورس'}) بنجاح`);
    setTimeout(() => setStorageNotification(null), 3000);
  };

  // Add Grade Handler
  const handleAddGrade = (newGrade: string) => {
    const trimmed = newGrade.trim();
    if (!trimmed || grades.includes(trimmed)) return;
    setGrades((prev) => [...prev, trimmed]);

    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      action: 'إضافة مرحلة وصف دراسي جديد',
      user: centerSettings.managerName || 'أك. محمود عزت',
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      details: `تمت إضافة مرحلة دراسية جديدة: (${trimmed})`,
      type: 'info',
    };
    setLogs((prev) => [newLog, ...prev]);
    setStorageNotification(`تمت إضافة المرحلة الدراسية (${trimmed}) بنجاح`);
    setTimeout(() => setStorageNotification(null), 3000);
  };

  // Update Grade Name Handler (Cascades across all courses and students!)
  const handleUpdateGradeName = (oldGrade: string, newGrade: string) => {
    const trimmedNew = newGrade.trim();
    if (!trimmedNew || oldGrade === trimmedNew) return;

    setGrades((prev) => prev.map((g) => (g === oldGrade ? trimmedNew : g)));
    setCourses((prev) =>
      prev.map((c) => (c.grade === oldGrade ? { ...c, grade: trimmedNew } : c))
    );
    setStudents((prev) =>
      prev.map((s) => (s.grade === oldGrade ? { ...s, grade: trimmedNew } : s))
    );

    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      action: 'تعديل وتحديث اسم المرحلة والصف الدراسي',
      user: centerSettings.managerName || 'أك. محمود عزت',
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      details: `تم تعديل المرحلة من (${oldGrade}) إلى (${trimmedNew}) وتحديث الكورسات والطلاب المرتبطين بها تلقائياً`,
      type: 'info',
    };
    setLogs((prev) => [newLog, ...prev]);
    setStorageNotification(`تم تعديل المرحلة إلى (${trimmedNew}) وتحديث الكورسات والطلاب بنجاح`);
    setTimeout(() => setStorageNotification(null), 3500);
  };

  // Delete Grade Handler
  const handleDeleteGrade = (gradeToDelete: string) => {
    setGrades((prev) => prev.filter((g) => g !== gradeToDelete));

    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      action: 'حذف مرحلة وصف دراسي',
      user: centerSettings.managerName || 'أك. محمود عزت',
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      details: `تم حذف المرحلة والصف الدراسي: (${gradeToDelete})`,
      type: 'warning',
    };
    setLogs((prev) => [newLog, ...prev]);
    setStorageNotification(`تم حذف المرحلة الدراسية (${gradeToDelete})`);
    setTimeout(() => setStorageNotification(null), 3000);
  };

  // Save WhatsApp Template
  const handleSaveTemplate = (id: string, newMsg: string) => {
    setTemplates((prev) =>
      prev.map((tpl) => (tpl.id === id ? { ...tpl, message: newMsg } : tpl))
    );
  };

  // Reset Data to Factory Defaults
  const handleResetData = () => {
    setStudents(initialStudents);
    setCourses(initialCourses);
    setExpenses(initialExpenses);
    setStaff(initialStaff);
    setTemplates(initialWhatsAppTemplates);
    setLogs(initialAuditLogs);
    setCenterSettings(defaultCenterSettings);
    setSupabaseConfig(defaultSupabaseConfig);
    setGrades(defaultGrades);
    setStorageNotification('تمت استعادة البيانات الافتراضية بنجاح');
    setTimeout(() => setStorageNotification(null), 3000);
  };

  // Import JSON Backup
  const handleImportJson = (data: any) => {
    if (data.students) setStudents(data.students);
    if (data.courses) setCourses(data.courses);
    if (data.expenses) setExpenses(data.expenses);
    if (data.staff) setStaff(data.staff);
    if (data.templates) setTemplates(data.templates);
    if (data.logs) setLogs(data.logs);
    if (data.centerSettings) setCenterSettings(data.centerSettings);
    if (data.supabaseConfig) setSupabaseConfig((prev) => ({ ...prev, ...data.supabaseConfig }));
    if (data.grades) setGrades(data.grades);
    setStorageNotification('تم استيراد النسخة الاحتياطية بنجاح!');
    setTimeout(() => setStorageNotification(null), 3000);
  };

  return (
    <div
      id="root-system-container"
      className={`min-h-screen flex flex-col transition-colors ${
        isDarkMode ? 'bg-[#070d17] text-[#dde2f1]' : 'bg-[#f1f5f9] text-[#0f172a]'
      }`}
    >
      {/* Top Header */}
      <Header
        isDarkMode={isDarkMode}
        onToggleTheme={() => setIsDarkMode(!isDarkMode)}
        isCloudConnected={supabaseConfig.isConnected}
        cloudStatusText={supabaseConfig.isConnected ? 'السحابة متصلة (Supabase)' : 'السحابة غير متصلة'}
        onOpenCloudSettings={() => {
          setSettingsInitialTab('supabase');
          setCurrentScreen('settings');
        }}
        isWhatsConnected={whatsAppConfig.isConnected}
        centerSettings={centerSettings}
        dueInstallmentsCount={dueInstallments.length}
        onNavigateToDueInstallments={() => {
          setStudentsListInitialFilter('due_soon');
          setCurrentScreen('students-list');
        }}
        onOpenWhatsAppScreen={() => setCurrentScreen('whatsapp')}
        onOpenStorageInfo={() => {
          setStorageNotification(
            `قاعدة البيانات المحلية متزامنة (${students.length} طالب، ${courses.length} كورس، ${expenses.length} مصروف)`
          );
          setTimeout(() => setStorageNotification(null), 3500);
        }}
      />

      {/* Storage Notification Banner */}
      {storageNotification && (
        <div className="bg-emerald-950/80 border-b border-emerald-500/40 text-emerald-300 text-xs font-bold py-2 px-4 text-center animate-in fade-in flex items-center justify-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span>{storageNotification}</span>
        </div>
      )}

      {/* Main Layout Body */}
      <main
        id="main-app-content"
        className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-5 lg:p-6 flex flex-col lg:flex-row gap-5"
      >
        {/* Sidebar (On the Right in RTL) */}
        <Sidebar
          currentScreen={currentScreen}
          onSelectScreen={(screen) => {
            if (screen === 'students-list') {
              setStudentsListInitialFilter('all');
            }
            if (screen === 'settings') {
              setSettingsInitialTab('header');
            }
            setCurrentScreen(screen);
          }}
          studentsCount={students.length}
          totalRevenue={totalRevenue}
          isDarkMode={isDarkMode}
          onToggleTheme={() => setIsDarkMode(!isDarkMode)}
          onExportJson={exportDatabaseToJson}
          onExportExcel={exportStudentsToExcel}
          isWhatsConnected={whatsAppConfig.isConnected}
          dueInstallments={dueInstallments}
          onOpenInstallmentSettle={(student) => setSettlingStudentFromSidebar(student)}
          onOpenWhatsAppReminder={(student) => {
            setWhatsAppMessageType('installment_reminder');
            setWhatsAppStudent(student);
          }}
          onNavigateToDueInstallments={() => {
            setStudentsListInitialFilter('due_soon');
            setCurrentScreen('students-list');
          }}
        />

        {/* Dynamic Center Screen View */}
        <div className="flex-1 flex flex-col min-w-0">
          {currentScreen === 'new-student' && (
            <NewStudentScreen
              courses={courses.filter((c) => c.isActive)}
              grades={grades}
              onRegisterStudent={handleRegisterStudent}
              onQuickViewReceipt={(url) => setViewReceiptUrl(url)}
              isWhatsConnected={whatsAppConfig.isConnected}
              onNavigateToWhatsApp={() => setCurrentScreen('whatsapp')}
            />
          )}

          {currentScreen === 'students-list' && (
            <StudentsListScreen
              students={students}
              courses={courses}
              grades={grades}
              initialPaymentFilter={studentsListInitialFilter}
              onDeleteStudent={handleDeleteStudent}
              onUpdateStudent={handleUpdateStudent}
              onViewReceipt={(url) => setViewReceiptUrl(url)}
              onOpenWhatsAppModal={(student) => {
                setWhatsAppMessageType('registration');
                setWhatsAppStudent(student);
              }}
              onExportExcel={exportStudentsToExcel}
              onUpdateGradeName={handleUpdateGradeName}
              onDeleteGrade={handleDeleteGrade}
            />
          )}

          {currentScreen === 'expenses' && (
            <ExpensesScreen
              expenses={expenses}
              totalRevenue={totalRevenue}
              onAddExpense={handleAddExpense}
              onDeleteExpense={handleDeleteExpense}
            />
          )}

          {currentScreen === 'salaries' && (
            <StaffSalariesScreen
              staff={staff}
              onToggleStatus={handleToggleStaffStatus}
            />
          )}

          {currentScreen === 'analytics' && (
            <AnalyticsScreen
              students={students}
              courses={courses}
              totalRevenue={totalRevenue}
            />
          )}

          {currentScreen === 'whatsapp' && (
            <WhatsAppCampaignsScreen
              templates={templates}
              onSaveTemplate={handleSaveTemplate}
              whatsAppConfig={whatsAppConfig}
              onUpdateWhatsConfig={handleUpdateWhatsConfig}
            />
          )}

          {currentScreen === 'courses' && (
            <CoursesManagementScreen
              courses={courses}
              grades={grades}
              students={students}
              onAddCourse={handleAddCourse}
              onUpdateCourse={handleUpdateCourse}
              onDeleteCourse={handleDeleteCourse}
              onToggleCourseActive={handleToggleCourseActive}
              onAddGrade={handleAddGrade}
              onUpdateGradeName={handleUpdateGradeName}
              onDeleteGrade={handleDeleteGrade}
            />
          )}

          {currentScreen === 'staff' && (
            <StaffPermissionsScreen
              staff={staff}
              onAddStaff={handleAddStaff}
              onUpdateStaff={handleUpdateStaff}
              onDeleteStaff={handleDeleteStaff}
            />
          )}

          {currentScreen === 'audit-log' && (
            <AuditLogScreen
              logs={logs}
              onClearLogs={() => setLogs([])}
            />
          )}

          {currentScreen === 'settings' && (
            <CloudSettingsScreen
              onExportJson={exportDatabaseToJson}
              onResetData={handleResetData}
              onImportJson={handleImportJson}
              centerSettings={centerSettings}
              onUpdateCenterSettings={handleUpdateCenterSettings}
              supabaseConfig={supabaseConfig}
              onUpdateSupabaseConfig={handleUpdateSupabaseConfig}
              initialTab={settingsInitialTab}
              databaseStats={{
                studentsCount: students.length,
                coursesCount: courses.length,
                expensesCount: expenses.length,
                staffCount: staff.length,
              }}
            />
          )}
        </div>
      </main>

      {/* Modals */}
      {successStudent && (
        <StudentSuccessModal
          student={successStudent}
          courses={courses}
          onClose={() => setSuccessStudent(null)}
          onGoToStudentsList={() => {
            setSuccessStudent(null);
            setCurrentScreen('students-list');
          }}
        />
      )}

      {viewReceiptUrl && (
        <ReceiptViewModal
          receiptUrl={viewReceiptUrl}
          onClose={() => setViewReceiptUrl(null)}
        />
      )}

      {whatsAppStudent && (
        <DirectWhatsAppModal
          student={whatsAppStudent}
          courses={courses}
          initialMessageType={whatsAppMessageType}
          onClose={() => {
            setWhatsAppStudent(null);
            setWhatsAppMessageType('registration');
          }}
        />
      )}

      {settlingStudentFromSidebar && (
        <InstallmentSettleModal
          student={settlingStudentFromSidebar}
          onClose={() => setSettlingStudentFromSidebar(null)}
          onSettle={(id, settlementData) => {
            handleUpdateStudent(id, {
              amountPaid: settlementData.newAmountPaid,
              remainingAmount: settlementData.newRemaining,
              installmentStatus: settlementData.newStatus,
              paymentMethod: settlementData.settlementMethod,
            });
            setSettlingStudentFromSidebar(null);
            if (settlementData.sendWhatsAppNotice) {
              const target = students.find((s) => s.id === id);
              if (target) {
                setWhatsAppMessageType('registration');
                setWhatsAppStudent({
                  ...target,
                  amountPaid: settlementData.newAmountPaid,
                  remainingAmount: settlementData.newRemaining,
                  installmentStatus: settlementData.newStatus,
                });
              }
            }
          }}
        />
      )}
    </div>
  );
}
