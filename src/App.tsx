/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { NavigationScreen, Student, Course, Expense, StaffMember, WhatsAppTemplate, AuditLog, WhatsAppIntegrationConfig, CenterSettings, SupabaseConfig, AppNotification } from './types';
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
  getStoredNotifications,
  saveStoredNotifications,
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
import { broadcastRealtimeEvent, subscribeToRealtimeEvents, RealtimeSyncPayload } from './utils/realtimeBroadcast';
import { RealtimeNotificationToast } from './components/RealtimeNotificationToast';
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
import { LoginScreen } from './components/screens/LoginScreen';
import { StudentSuccessModal } from './components/modals/StudentSuccessModal';
import { ProductionResetModal, ResetCategories } from './components/modals/ProductionResetModal';
import { ReceiptViewModal } from './components/modals/ReceiptViewModal';
import { DirectWhatsAppModal } from './components/modals/DirectWhatsAppModal';
import { InstallmentSettleModal } from './components/modals/InstallmentSettleModal';
import { getDueInstallments } from './utils/installmentUtils';

import {
  fetchAllCloudData,
  syncStudentToCloud,
  deleteStudentFromCloud,
  deleteAllStudentsFromCloud,
  syncCourseToCloud,
  deleteCourseFromCloud,
  syncExpenseToCloud,
  deleteExpenseFromCloud,
  syncStaffToCloud,
  deleteStaffFromCloud,
  syncLogToCloud,
  syncNotificationToCloud,
  deleteAllNotificationsFromCloud,
  syncCenterSettingsToCloud,
  subscribeToSupabaseRealtime,
  broadcastToCloudTeam,
} from './utils/supabaseClient';

export default function App() {
  // Navigation State - defaults to 'analytics' (Home Dashboard)
  const [currentScreen, setCurrentScreen] = useState<NavigationScreen>('analytics');
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
  const [notifications, setNotifications] = useState<AppNotification[]>(() => getStoredNotifications());
  const [whatsAppConfig, setWhatsAppConfig] = useState<WhatsAppIntegrationConfig>(() => getStoredWhatsConfig());
  const [centerSettings, setCenterSettings] = useState<CenterSettings>(() => getStoredCenterSettings());
  const [supabaseConfig, setSupabaseConfig] = useState<SupabaseConfig>(() => getStoredSupabaseConfig());
  const [grades, setGrades] = useState<string[]>(() => getStoredGrades());

  // Real-time Event Toast State
  const [latestRealtimeEvent, setLatestRealtimeEvent] = useState<RealtimeSyncPayload | null>(null);

  // Auth State
  const [currentUser, setCurrentUser] = useState<StaffMember | null>(() => {
    try {
      const saved = localStorage.getItem('el_saqqa_current_user');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return null;
  });

  const handleLogin = (user: StaffMember) => {
    setCurrentUser(user);
    try {
      localStorage.setItem('el_saqqa_current_user', JSON.stringify(user));
    } catch (e) {}

    // Auto-navigate to their first allowed screen
    const perms = user.permissions || [];
    if (user.username === 'admin' || perms.includes('التحكم الكامل')) {
      setCurrentScreen('analytics');
    } else if (perms.includes('البيانات المالية')) {
      setCurrentScreen('analytics');
    } else if (perms.includes('متابعة الطلاب') || perms.includes('تأكيد الإيصالات')) {
      setCurrentScreen('students-list');
    } else if (perms.includes('إرسال الواتساب')) {
      setCurrentScreen('whatsapp');
    } else if (perms.includes('إدارة الكورسات')) {
      setCurrentScreen('courses');
    } else if (perms.includes('إدارة فريق العمل')) {
      setCurrentScreen('staff');
    } else {
      setCurrentScreen('analytics');
    }

    setStorageNotification(`أهلاً بك يا ${user.name}، تم تسجيل الدخول بنجاح!`);
    setTimeout(() => setStorageNotification(null), 3000);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem('el_saqqa_current_user');
    } catch (e) {}
  };

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
  const [settingsInitialTab, setSettingsInitialTab] = useState<'header' | 'supabase' | 'reset'>('header');
  const [showProductionResetModal, setShowProductionResetModal] = useState(false);

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
    saveStoredNotifications(notifications);
  }, [notifications]);

  // Real-Time Cross-Browser Listener Subscriptions
  useEffect(() => {
    let isMounted = true;

    // 1. Initial Cloud Sync from Supabase Instance
    async function initSupabaseCloud() {
      const cloudData = await fetchAllCloudData();
      if (cloudData && isMounted) {
        if (cloudData.students) setStudents(cloudData.students);
        if (cloudData.courses) setCourses(cloudData.courses);
        if (cloudData.expenses) setExpenses(cloudData.expenses);
        if (cloudData.staff) setStaff(cloudData.staff);
        if (cloudData.logs) setLogs(cloudData.logs);
        if (cloudData.notifications) setNotifications(cloudData.notifications);
        if (cloudData.centerSettings) setCenterSettings(cloudData.centerSettings);
      }
    }

    initSupabaseCloud();

    // Handler for incoming real-time events across all browsers
    const handleIncomingRealtimeAction = (payload: RealtimeSyncPayload) => {
      if (!isMounted) return;

      // Update React state according to action type without page refresh
      if (payload.type === 'STUDENT_ADDED' && payload.data?.student) {
        const newStudent = payload.data.student as Student;
        setStudents((prev) => {
          if (prev.some((s) => s.id === newStudent.id)) return prev;
          const next = [newStudent, ...prev];
          saveStoredStudents(next);
          return next;
        });
      } else if (payload.type === 'STUDENT_DELETED' && payload.data?.studentId) {
        const deletedId = payload.data.studentId;
        setStudents((prev) => {
          const next = prev.filter((s) => s.id !== deletedId);
          saveStoredStudents(next);
          return next;
        });
      } else if (payload.type === 'STUDENTS_CLEARED') {
        setStudents([]);
        saveStoredStudents([]);
      } else if (payload.type === 'NOTIFICATIONS_CLEARED') {
        setNotifications([]);
        saveStoredNotifications([]);
        setLatestRealtimeEvent(payload);
        return;
      } else if (payload.type === 'NOTIFICATIONS_MARKED_READ') {
        setNotifications((prev) => {
          const next = prev.map((n) => ({ ...n, read: true, status: 'read' as const }));
          saveStoredNotifications(next);
          return next;
        });
      } else if (payload.type === 'STUDENT_UPDATED' && payload.data?.student) {
        const updatedStudent = payload.data.student as Student;
        setStudents((prev) => {
          const next = prev.map((s) => (s.id === updatedStudent.id ? updatedStudent : s));
          saveStoredStudents(next);
          return next;
        });
      } else if (payload.type === 'EXPENSE_ADDED' && payload.data?.expense) {
        const newExpense = payload.data.expense as Expense;
        setExpenses((prev) => {
          if (prev.some((e) => e.id === newExpense.id)) return prev;
          const next = [newExpense, ...prev];
          saveStoredExpenses(next);
          return next;
        });
      } else if (payload.type === 'EXPENSE_DELETED' && payload.data?.expenseId) {
        const deletedId = payload.data.expenseId;
        setExpenses((prev) => {
          const next = prev.filter((e) => e.id !== deletedId);
          saveStoredExpenses(next);
          return next;
        });
      } else if (payload.type === 'STUDENTS_UPDATED') {
        if (payload.data?.studentIds && Array.isArray(payload.data.studentIds)) {
          const idsSet = new Set(payload.data.studentIds);
          setStudents((prev) => {
            const next = prev.filter((s) => !idsSet.has(s.id));
            saveStoredStudents(next);
            return next;
          });
        }
        fetchAllCloudData().then((res) => {
          if (res?.students && isMounted) setStudents(res.students);
        });
      }

      // Add to notifications
      if (payload.notification) {
        const newNotif = payload.notification;
        setNotifications((prev) => {
          if (prev.some((n) => n.id === newNotif.id)) return prev;
          return [newNotif, ...prev];
        });
      } else if (payload.actionTitle) {
        const genNotif: AppNotification = {
          id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          title: payload.actionTitle,
          details: payload.actionDetails,
          user: payload.senderUser,
          timestamp: 'الآن',
          type: 'info',
          read: false,
          status: 'unread',
          linkScreen: payload.linkScreen,
        };
        setNotifications((prev) => [genNotif, ...prev]);
      }

      // Trigger the Instant Cloud Toast Alert
      setLatestRealtimeEvent(payload);
    };

    // 2. Subscribe to Supabase WebSocket Realtime Channel
    const unsubSupabase = subscribeToSupabaseRealtime(
      (payload) => {
        handleIncomingRealtimeAction(payload);
      },
      () => {
        if (isMounted) {
          setStudents(getStoredStudents());
          setCourses(getStoredCourses());
          setExpenses(getStoredExpenses());
          setStaff(getStoredStaff());
          setLogs(getStoredLogs());
          setNotifications(getStoredNotifications());
          setCenterSettings(getStoredCenterSettings());
        }
      }
    );

    // 3. Subscribe to Local Broadcast Events (same-browser tabs)
    const unsubscribeBroadcast = subscribeToRealtimeEvents((payload) => {
      handleIncomingRealtimeAction(payload);
    });

    return () => {
      isMounted = false;
      unsubSupabase();
      unsubscribeBroadcast();
    };
  }, []);

  // Helper to trigger and broadcast a real-time event & notification
  const triggerRealtimeAction = useCallback(
    (
      actionTitle: string,
      actionDetails: string,
      type: 'success' | 'info' | 'warning' | 'installment' = 'info',
      linkScreen?: NavigationScreen
    ) => {
      const sender = currentUser?.name || centerSettings.managerName || 'أك. محمود عزت';
      const newNotif: AppNotification = {
        id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        title: actionTitle,
        details: actionDetails,
        user: sender,
        timestamp: 'الآن',
        type,
        read: false,
        status: 'unread',
        linkScreen,
      };

      setNotifications((prev) => {
        const next = [newNotif, ...prev];
        saveStoredNotifications(next);
        return next;
      });

      syncNotificationToCloud(newNotif);

      // Broadcast in real-time to all open browsers/devices across the team
      broadcastToCloudTeam({
        type: 'NOTIFICATION_ADDED',
        senderUser: sender,
        actionTitle,
        actionDetails,
        timestamp: 'الآن',
        notification: newNotif,
        linkScreen,
      });
    },
    [currentUser, centerSettings]
  );

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
    syncCenterSettingsToCloud(newSettings);
    setStorageNotification('تم حفظ وتحديث بيانات المنظومة والترويسة بنجاح في LocalStorage والسحابة');
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

    // Sync to Supabase Cloud directly
    syncStudentToCloud(newStudent);

    // Increment course enrolled count
    setCourses((prev) =>
      prev.map((c) => {
        if (c.name === newStudent.course) {
          const updated = { ...c, enrolledCount: c.enrolledCount + 1 };
          syncCourseToCloud(updated);
          return updated;
        }
        return c;
      })
    );

    // Add Audit Log & Realtime Broadcast
    const currentUserTitle = currentUser?.name || centerSettings.managerName || 'أك. محمود عزت';
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      action: 'تسجيل اشتراك طالب جديد وتأكيد الدفع',
      user: currentUserTitle,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      details: `تم تفعيل كود ${generatedCode} للطالب ${newStudent.name} بمبلغ ${newStudent.amountPaid} ج.م`,
      type: 'success',
    };
    setLogs((prev) => [newLog, ...prev]);
    syncLogToCloud(newLog);

    // Broadcast INSTANTLY to all team members across all browsers!
    triggerRealtimeAction(
      `طالب جديد مسجل الآن [${generatedCode}] 🚀`,
      `الطالب: ${newStudent.name} • الكورس: ${newStudent.course} • المبلغ: ${newStudent.amountPaid} ج.م`,
      'success',
      'students-list'
    );

    broadcastToCloudTeam({
      type: 'STUDENT_ADDED',
      senderUser: currentUserTitle,
      actionTitle: `طالب جديد مسجل الآن [${generatedCode}] 🚀`,
      actionDetails: `الطالب: ${newStudent.name} • الكورس: ${newStudent.course} • المبلغ: ${newStudent.amountPaid} ج.م`,
      timestamp: 'الآن',
      data: { student: newStudent },
      linkScreen: 'students-list',
    });

    // Show Success Modal
    setSuccessStudent(newStudent);
  };

  // Delete Student
  const handleDeleteStudent = (id: string) => {
    const target = students.find((s) => s.id === id);
    if (!target) return;
    if (window.confirm(`هل أنت متأكد من حذف اشتراك الطالب: ${target.name}؟`)) {
      setStudents((prev) => prev.filter((s) => s.id !== id));
      deleteStudentFromCloud(id);
      const currentUserTitle = currentUser?.name || centerSettings.managerName || 'أك. محمود عزت';
      const newLog: AuditLog = {
        id: `log-${Date.now()}`,
        action: 'حذف اشتراك طالب',
        user: currentUserTitle,
        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
        details: `تم إلغاء تفعيل وحذف بيانات الطالب ${target.name}`,
        type: 'warning',
      };
      setLogs((prev) => [newLog, ...prev]);
      syncLogToCloud(newLog);

      broadcastToCloudTeam({
        type: 'STUDENT_DELETED',
        senderUser: currentUserTitle,
        actionTitle: `حذف اشتراك طالب [${target.code || target.name}] ⚠️`,
        actionDetails: `تم إلغاء تفعيل وحذف حساب الطالب (${target.name}) من السجل`,
        timestamp: 'الآن',
        data: { studentId: id },
        linkScreen: 'students-list',
      });

      triggerRealtimeAction(
        `حذف اشتراك طالب [${target.code || target.name}] ⚠️`,
        `تم إلغاء تفعيل وحذف حساب الطالب (${target.name}) من السجل`,
        'warning',
        'students-list'
      );
    }
  };

  // Delete All Students
  const handleDeleteAllStudents = () => {
    const count = students.length;
    setStudents([]);
    deleteAllStudentsFromCloud();
    const currentUserTitle = currentUser?.name || centerSettings.managerName || 'أك. محمود عزت';
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      action: 'مسح جميع بيانات الطلاب دفعة واحدة',
      user: currentUserTitle,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      details: `تم مسح وتفريغ سجل الطلاب بالكامل بواقع (${count}) طالب`,
      type: 'warning',
    };
    setLogs((prev) => [newLog, ...prev]);
    syncLogToCloud(newLog);

    broadcastToCloudTeam({
      type: 'STUDENTS_CLEARED',
      senderUser: currentUserTitle,
      actionTitle: `تفريغ ومسح سجل الطلاب بالكامل ⚠️`,
      actionDetails: `تم مسح وتصفية كافة سجلات الطلاب بواقع (${count}) طالب`,
      timestamp: 'الآن',
      linkScreen: 'students-list',
    });

    triggerRealtimeAction(
      `تفريغ ومسح سجل الطلاب بالكامل ⚠️`,
      `تم مسح وتصفية كافة سجلات الطلاب بواقع (${count}) طالب`,
      'warning',
      'students-list'
    );
  };

  // Delete Multiple Selected Students
  const handleDeleteMultipleStudents = (ids: string[]) => {
    const count = ids.length;
    setStudents((prev) => prev.filter((s) => !ids.includes(s.id)));
    ids.forEach((id) => deleteStudentFromCloud(id));
    const currentUserTitle = currentUser?.name || centerSettings.managerName || 'أك. محمود عزت';
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      action: 'حذف مجموعة طلاب محددين',
      user: currentUserTitle,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      details: `تم حذف (${count}) طلاب محددين من السجل`,
      type: 'warning',
    };
    setLogs((prev) => [newLog, ...prev]);
    syncLogToCloud(newLog);

    broadcastToCloudTeam({
      type: 'STUDENTS_UPDATED',
      senderUser: currentUserTitle,
      actionTitle: `حذف مجموعة طلاب محددين [${count} طالب] ⚠️`,
      actionDetails: `تم حذف (${count}) طلاب محددين من السجل`,
      timestamp: 'الآن',
      data: { studentIds: ids },
      linkScreen: 'students-list',
    });

    triggerRealtimeAction(
      `حذف مجموعة طلاب محددين [${count} طالب] ⚠️`,
      `تم حذف (${count}) طلاب محددين من السجل`,
      'warning',
      'students-list'
    );
  };

  // Update Student (e.g. Settle Installment / Mark as Paid)
  const handleUpdateStudent = (id: string, updatedData: Partial<Student>) => {
    let updatedStudentObj: Student | null = null;
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          updatedStudentObj = { ...s, ...updatedData };
          syncStudentToCloud(updatedStudentObj);
          return updatedStudentObj;
        }
        return s;
      })
    );

    const target = students.find((s) => s.id === id);
    const currentUserTitle = currentUser?.name || centerSettings.managerName || 'أك. محمود عزت';
    const isSettle = updatedData.installmentStatus === 'paid_in_full';

    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      action: isSettle ? 'سداد قسط وتصفية حساب الطالب' : 'تحديث بيانات الطالب',
      user: currentUserTitle,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      details: isSettle
        ? `تم سداد وتسوية قسط الطالب (${target?.name}) وتحديث الحالة إلى (تم دفع القسط) بنجاح`
        : `تم تحديث بيانات الطالب (${target?.name})`,
      type: 'success',
    };
    setLogs((prev) => [newLog, ...prev]);
    syncLogToCloud(newLog);

    if (updatedStudentObj) {
      broadcastToCloudTeam({
        type: 'STUDENT_UPDATED',
        senderUser: currentUserTitle,
        actionTitle: isSettle
          ? `سداد قسط وتصفية حساب [${target?.name}] ✅`
          : `تحديث بيانات واشتراك [${target?.name}] 🔄`,
        actionDetails: isSettle
          ? `تم تسوية قسط الطالب ${target?.name} بمبلغ ${updatedData.amountPaid || target?.amountPaid} ج.م`
          : `تم تعديل بيانات واشتراك الطالب ${target?.name}`,
        timestamp: 'الآن',
        data: { student: updatedStudentObj },
        linkScreen: 'students-list',
      });

      triggerRealtimeAction(
        isSettle
          ? `سداد قسط وتصفية حساب [${target?.name}] ✅`
          : `تحديث بيانات واشتراك [${target?.name}] 🔄`,
        isSettle
          ? `تم تسوية قسط الطالب ${target?.name} بمبلغ ${updatedData.amountPaid || target?.amountPaid} ج.م`
          : `تم تعديل بيانات واشتراك الطالب ${target?.name}`,
        isSettle ? 'success' : 'info',
        'students-list'
      );
    }
  };

  // Add Expense
  const handleAddExpense = (expenseData: Omit<Expense, 'id'>) => {
    const newExpense: Expense = {
      ...expenseData,
      id: `exp-${Date.now()}`,
    };
    setExpenses((prev) => [newExpense, ...prev]);
    syncExpenseToCloud(newExpense);

    const currentUserTitle = currentUser?.name || centerSettings.managerName || 'أك. محمود عزت';
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      action: 'تسجيل بند مصروف جديد',
      user: currentUserTitle,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      details: `تم صرف مبلغ ${newExpense.amount} ج.م لبند (${newExpense.title})`,
      type: 'info',
    };
    setLogs((prev) => [newLog, ...prev]);
    syncLogToCloud(newLog);

    broadcastToCloudTeam({
      type: 'EXPENSE_ADDED',
      senderUser: currentUserTitle,
      actionTitle: `تسجيل مصروف جديد [${newExpense.title}] 💰`,
      actionDetails: `المبلغ: ${newExpense.amount} ج.م • البند: ${newExpense.category}`,
      timestamp: 'الآن',
      data: { expense: newExpense },
      linkScreen: 'expenses',
    });

    triggerRealtimeAction(
      `تسجيل مصروف جديد [${newExpense.title}] 💰`,
      `المبلغ: ${newExpense.amount} ج.م • البند: ${newExpense.category}`,
      'info',
      'expenses'
    );
  };

  // Delete Expense
  const handleDeleteExpense = (id: string) => {
    const target = expenses.find((e) => e.id === id);
    setExpenses((prev) => prev.filter((e) => e.id !== id));
    deleteExpenseFromCloud(id);

    const currentUserTitle = currentUser?.name || centerSettings.managerName || 'أك. محمود عزت';
    broadcastToCloudTeam({
      type: 'EXPENSE_DELETED',
      senderUser: currentUserTitle,
      actionTitle: `حذف بند مصروف [${target?.title || ''}] 🗑️`,
      actionDetails: `تم حذف بند المصروف من السجل المالي`,
      timestamp: 'الآن',
      data: { expenseId: id },
      linkScreen: 'expenses',
    });

    triggerRealtimeAction(
      `حذف بند مصروف [${target?.title || ''}] 🗑️`,
      `تم حذف بند المصروف من السجل المالي`,
      'warning',
      'expenses'
    );
  };

  // Toggle Staff Payment Status
  const handleToggleStaffStatus = (id: string) => {
    setStaff((prev) =>
      prev.map((st) => {
        if (st.id === id) {
          const newStatus: 'مدفوع' | 'معلق' = st.status === 'مدفوع' ? 'معلق' : 'مدفوع';
          const updated: StaffMember = { ...st, status: newStatus };
          syncStaffToCloud(updated);
          triggerRealtimeAction(
            `تغيير حالة سداد مرتب الموظف [${st.name}] 💼`,
            `تم تحديث حالة السداد إلى (${newStatus})`,
            'info',
            'staff'
          );
          return updated;
        }
        return st;
      })
    );
  };

  // Add Staff Member
  const handleAddStaff = (newStaffData: Omit<StaffMember, 'id'>) => {
    const newStaff: StaffMember = {
      ...newStaffData,
      id: `st-${Date.now()}`,
    };
    setStaff((prev) => [...prev, newStaff]);
    syncStaffToCloud(newStaff);

    const currentUserTitle = currentUser?.name || centerSettings.managerName || 'أك. محمود عزت';
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      action: 'إضافة عضو جديد وتعيين الصلاحيات',
      user: currentUserTitle,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      details: `تمت إضافة (${newStaff.name} - ${newStaff.role}) بصلاحيات: ${newStaff.permissions.join(', ')}`,
      type: 'info',
    };
    setLogs((prev) => [newLog, ...prev]);

    triggerRealtimeAction(
      `إضافة موظف جديد: ${newStaff.name}`,
      `تم إنشاء حساب (${newStaff.role}) مع اسم المستخدم (${newStaff.username})`,
      'success',
      'staff'
    );
  };

  // Update Staff Member & Permissions
  const handleUpdateStaff = (id: string, updatedData: Partial<StaffMember>) => {
    setStaff((prev) =>
      prev.map((st) => {
        if (st.id === id) {
          const updated = { ...st, ...updatedData };
          syncStaffToCloud(updated);
          return updated;
        }
        return st;
      })
    );

    const target = staff.find((st) => st.id === id);
    const currentUserTitle = currentUser?.name || centerSettings.managerName || 'أك. محمود عزت';
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      action: 'تحديث بيانات وصلاحيات عضو فريق العمل',
      user: currentUserTitle,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      details: `تم تحديث صلاحيات وحساب (${target?.name || 'عضو'})`,
      type: 'info',
    };
    setLogs((prev) => [newLog, ...prev]);

    triggerRealtimeAction(
      `تحديث صلاحيات موظف: ${target?.name}`,
      `تم تحديث بيانات وحساب الموظف ${target?.name}`,
      'info',
      'staff'
    );
  };

  // Delete Staff Member
  const handleDeleteStaff = (id: string) => {
    const target = staff.find((st) => st.id === id);
    setStaff((prev) => prev.filter((st) => st.id !== id));
    deleteStaffFromCloud(id);

    const currentUserTitle = currentUser?.name || centerSettings.managerName || 'أك. محمود عزت';
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      action: 'حذف عضو من فريق العمل',
      user: currentUserTitle,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      details: `تم حذف (${target?.name || 'عضو'}) من فريق العمل وسحب كافة الصلاحيات`,
      type: 'warning',
    };
    setLogs((prev) => [newLog, ...prev]);

    triggerRealtimeAction(
      `حذف موظف: ${target?.name}`,
      `تم حذف الموظف (${target?.name}) وإلغاء صلاحيات الوصول`,
      'warning',
      'staff'
    );
  };

  // Add Course
  const handleAddCourse = (courseData: Omit<Course, 'id' | 'enrolledCount'>) => {
    const newCourse: Course = {
      ...courseData,
      id: `c-${Date.now()}`,
      enrolledCount: 0,
    };
    setCourses((prev) => [...prev, newCourse]);
    syncCourseToCloud(newCourse);
    triggerRealtimeAction(
      `إضافة كورس ومقرر جديد [${newCourse.name}] 📚`,
      `المرحلة: ${newCourse.grade} • السعر: ${newCourse.price} ج.م`,
      'success',
      'courses'
    );
  };

  // Update Course (Name, Grade, Schedule, Price)
  const handleUpdateCourse = (id: string, updatedData: Partial<Course>) => {
    setCourses((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          const updated = { ...c, ...updatedData };
          syncCourseToCloud(updated);
          return updated;
        }
        return c;
      })
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

    triggerRealtimeAction(
      `تعديل بيانات الكورس [${updatedData.name || target?.name || ''}] 🔄`,
      `تم تحديث بيانات ومواعيد الكورس بنجاح`,
      'info',
      'courses'
    );
  };

  // Toggle Course Active
  const handleToggleCourseActive = (id: string) => {
    setCourses((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          const updated = { ...c, isActive: !c.isActive };
          syncCourseToCloud(updated);
          triggerRealtimeAction(
            `تغيير حالة تفعيل الكورس [${c.name}] 🔄`,
            `تم تبديل حالة التنشيط للكورس إلى (${updated.isActive ? 'مفعل' : 'معطل'})`,
            'info',
            'courses'
          );
          return updated;
        }
        return c;
      })
    );
  };

  // Delete Course Handler
  const handleDeleteCourse = (id: string) => {
    const target = courses.find((c) => c.id === id);
    setCourses((prev) => prev.filter((c) => c.id !== id));
    deleteCourseFromCloud(id);

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

    triggerRealtimeAction(
      `حذف كورس ومقرر دراسي [${target?.name || ''}] ⚠️`,
      `تم حذف الكورس من المنظومة`,
      'warning',
      'courses'
    );
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

    triggerRealtimeAction(
      `إضافة مرحلة وصف دراسي جديد [${trimmed}] 🎓`,
      `تمت إضافة الصف الدراسي الجديد للمنظومة`,
      'success',
      'settings'
    );
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

    triggerRealtimeAction(
      `تعديل وتحديث اسم المرحلة والصف الدراسي 🔄`,
      `تم تعديل المرحلة من (${oldGrade}) إلى (${trimmedNew})`,
      'info',
      'settings'
    );
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

    triggerRealtimeAction(
      `حذف مرحلة وصف دراسي [${gradeToDelete}] ⚠️`,
      `تم حذف الصف الدراسي من المنظومة`,
      'warning',
      'settings'
    );
  };

  // Save WhatsApp Template
  const handleSaveTemplate = (id: string, newMsg: string) => {
    setTemplates((prev) =>
      prev.map((tpl) => (tpl.id === id ? { ...tpl, message: newMsg } : tpl))
    );
  };

  // Execute Selective Production System Reset
  const handleExecuteProductionReset = (categories: ResetCategories) => {
    const wipedItems: string[] = [];

    if (categories.students) {
      setStudents([]);
      deleteAllStudentsFromCloud();
      wipedItems.push('سجل الطلاب والاشتراكات');
      broadcastToCloudTeam({
        type: 'STUDENTS_CLEARED',
        senderUser: currentUser?.name || centerSettings.managerName || 'أك. محمود عزت',
        actionTitle: 'تفريغ ومسح سجل الطلاب بالكامل ⚠️',
        actionDetails: 'تم مسح وتصفير كافة سجلات الطلاب للإنتاج الرسمي',
        timestamp: 'الآن',
        linkScreen: 'students-list',
      });
    }
    if (categories.expenses) {
      setExpenses([]);
      wipedItems.push('سجل المصروفات والمالية');
    }
    if (categories.logs) {
      setLogs([]);
      wipedItems.push('سجل الرقابة (Audit Log)');
    }
    if (categories.notifications) {
      setNotifications([]);
      wipedItems.push('قائمة الإشعارات والتنبيهات');
    }
    if (categories.courses) {
      setCourses([]);
      wipedItems.push('الكورسات والمراحل');
    }
    if (categories.staff) {
      // Retain active logged in user or admin account
      setStaff((prev) => prev.filter((st) => st.username === 'admin' || st.id === currentUser?.id));
      wipedItems.push('حسابات المساعدين التجريبية');
    }

    const summaryText = `تم تصفية وتهيئة البيانات المحددة (${wipedItems.join('، ')}) وتجهيز المنظومة للعمل الميداني والإنتاج الرسمي 🚀.`;
    setStorageNotification(summaryText);
    setTimeout(() => setStorageNotification(null), 5000);

    triggerRealtimeAction(
      '🚀 تهيئة المنظومة والبدء في وضع الإنتاج',
      summaryText,
      'warning'
    );
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

  // Notification Handlers
  const handleMarkAllNotificationsAsRead = () => {
    setNotifications((prev) => {
      const next = prev.map((n) => ({ ...n, read: true, status: 'read' as const }));
      saveStoredNotifications(next);
      return next;
    });
    const currentUserTitle = currentUser?.name || centerSettings.managerName || 'أك. محمود عزت';
    broadcastToCloudTeam({
      type: 'NOTIFICATIONS_MARKED_READ',
      senderUser: currentUserTitle,
      actionTitle: 'تحديد كافة التنبيهات كمقروءة ✅',
      actionDetails: 'تم تعيين جميع الإشعارات كمقروءة',
      timestamp: 'الآن',
    });
  };

  const handleClearNotifications = () => {
    setNotifications([]);
    saveStoredNotifications([]);
    deleteAllNotificationsFromCloud();
    const currentUserTitle = currentUser?.name || centerSettings.managerName || 'أك. محمود عزت';
    broadcastToCloudTeam({
      type: 'NOTIFICATIONS_CLEARED',
      senderUser: currentUserTitle,
      actionTitle: 'مسح وحذف كافة الإشعارات 🗑️',
      actionDetails: 'تم تفريغ قائمة التنبيهات بالكامل',
      timestamp: 'الآن',
    });
  };

  const handleNotificationClick = (notif: AppNotification) => {
    setNotifications((prev) => {
      const next = prev.map((n) => (n.id === notif.id ? { ...n, read: true, status: 'read' as const } : n));
      saveStoredNotifications(next);
      return next;
    });
    const updatedNotif = { ...notif, read: true, status: 'read' as const };
    syncNotificationToCloud(updatedNotif);
  };

  if (!currentUser) {
    return (
      <LoginScreen
        staffList={staff}
        centerSettings={centerSettings}
        onLogin={handleLogin}
      />
    );
  }

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
        currentUser={currentUser}
        onLogout={handleLogout}
        notifications={notifications}
        onMarkAllAsRead={handleMarkAllNotificationsAsRead}
        onClearNotifications={handleClearNotifications}
        onNotificationClick={handleNotificationClick}
        onNavigateToScreen={(screen) => setCurrentScreen(screen)}
        onOpenProductionReset={() => setShowProductionResetModal(true)}
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
          currentUser={currentUser}
          onLogout={handleLogout}
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
              onDeleteAllStudents={handleDeleteAllStudents}
              onDeleteMultipleStudents={handleDeleteMultipleStudents}
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
              onNavigateToRegister={() => setCurrentScreen('new-student')}
              onNavigateToStudentsList={() => {
                setStudentsListInitialFilter('all');
                setCurrentScreen('students-list');
              }}
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
              onResetData={() => setShowProductionResetModal(true)}
              onImportJson={handleImportJson}
              centerSettings={centerSettings}
              onUpdateCenterSettings={handleUpdateCenterSettings}
              supabaseConfig={supabaseConfig}
              onUpdateSupabaseConfig={handleUpdateSupabaseConfig}
              initialTab={settingsInitialTab}
              onOpenProductionReset={() => setShowProductionResetModal(true)}
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

      {/* Production System Reset Modal */}
      {showProductionResetModal && (
        <ProductionResetModal
          onClose={() => setShowProductionResetModal(false)}
          onExecuteReset={handleExecuteProductionReset}
        />
      )}

      {/* Realtime Action Toast Popup */}
      <RealtimeNotificationToast
        latestEvent={latestRealtimeEvent}
        onClose={() => setLatestRealtimeEvent(null)}
        onOpenNotifications={(screen) => {
          if (screen) {
            setCurrentScreen(screen);
          } else {
            setCurrentScreen('students-list');
          }
        }}
      />
    </div>
  );
}
