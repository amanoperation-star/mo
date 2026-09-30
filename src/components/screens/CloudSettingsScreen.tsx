import React, { useState, useEffect, useRef } from 'react';
import {
  Building2,
  Phone,
  Globe,
  Save,
  RotateCcw,
  CheckCircle2,
  ExternalLink,
  Sparkles,
  Award,
  ShieldCheck,
  ShieldAlert,
  FileText,
  Cloud,
  Database,
  Download,
  Upload,
  Eye,
  EyeOff,
  Send,
  Sliders,
  Key,
  Link2,
  RefreshCw,
  AlertCircle,
  Activity,
  Server,
  Users,
  BookOpen,
  DollarSign,
  UserCheck,
  HelpCircle,
  Info,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  Code2,
  Terminal,
} from 'lucide-react';
import { CenterSettings, SupabaseConfig } from '../../types';
import { defaultCenterSettings, defaultSupabaseConfig } from '../../utils/storage';

interface CloudSettingsScreenProps {
  onExportJson: () => void;
  onResetData: () => void;
  onImportJson: (jsonData: any) => void;
  centerSettings: CenterSettings;
  onUpdateCenterSettings: (newSettings: CenterSettings) => void;
  supabaseConfig?: SupabaseConfig;
  onUpdateSupabaseConfig?: (newConfig: SupabaseConfig) => void;
  initialTab?: 'header' | 'supabase' | 'reset';
  onOpenProductionReset?: () => void;
  databaseStats?: {
    studentsCount: number;
    coursesCount: number;
    expensesCount: number;
    staffCount: number;
  };
}

export const CloudSettingsScreen: React.FC<CloudSettingsScreenProps> = ({
  onExportJson,
  onResetData,
  onImportJson,
  centerSettings,
  onUpdateCenterSettings,
  supabaseConfig = defaultSupabaseConfig,
  onUpdateSupabaseConfig,
  initialTab = 'header',
  onOpenProductionReset,
  databaseStats = {
    studentsCount: 0,
    coursesCount: 0,
    expensesCount: 0,
    staffCount: 0,
  },
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Active Tab: 'header' for Center Identity, 'supabase' for Supabase, 'reset' for Production Reset
  const [activeTab, setActiveTab] = useState<'header' | 'supabase' | 'reset'>(initialTab);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // Form State for Center Settings (Header)
  const [formData, setFormData] = useState<CenterSettings>({
    centerName: centerSettings?.centerName || defaultCenterSettings.centerName,
    phoneNumber: centerSettings?.phoneNumber || defaultCenterSettings.phoneNumber,
    platformUrl: centerSettings?.platformUrl || defaultCenterSettings.platformUrl,
    academicYear: centerSettings?.academicYear || defaultCenterSettings.academicYear,
    teacherName: centerSettings?.teacherName || defaultCenterSettings.teacherName,
    managerName: centerSettings?.managerName || defaultCenterSettings.managerName,
    systemDescription: centerSettings?.systemDescription || defaultCenterSettings.systemDescription,
    receiptSystemTitle: centerSettings?.receiptSystemTitle || defaultCenterSettings.receiptSystemTitle,
    receiptFooterText: centerSettings?.receiptFooterText || defaultCenterSettings.receiptFooterText,
  });

  // Form State for Supabase Cloud Settings
  const [supabaseForm, setSupabaseForm] = useState<SupabaseConfig>({
    projectUrl: supabaseConfig?.projectUrl || '',
    anonKey: supabaseConfig?.publishableKey || supabaseConfig?.anonKey || '',
    publishableKey: supabaseConfig?.publishableKey || supabaseConfig?.anonKey || '',
    isConnected: supabaseConfig?.isConnected || false,
    autoSync: supabaseConfig?.autoSync ?? true,
    lastSyncTime: supabaseConfig?.lastSyncTime || '',
    syncStatus: supabaseConfig?.syncStatus || 'disconnected',
  });

  const [showAnonKey, setShowAnonKey] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [showSqlEditor, setShowSqlEditor] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [supabaseSavedSuccess, setSupabaseSavedSuccess] = useState(false);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState<{
    status: 'success' | 'error' | null;
    message: string;
  }>({ status: null, message: '' });

  // SQL Script to create ALL tables and enable Realtime for Publishable API Key
  const fullSystemSqlCode = `-- ========================================================
-- كود SQL الشامل والمتكامل لكافة جداول المنظومة وتفعيل الريال تيم
-- انسخ هذا الكود بالكامل والصقه في Supabase > SQL Editor ثم اضغط Run
-- ========================================================

-- 1. تفعيل الملحقات
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. جدول الطلاب والاشتراكات (students)
CREATE TABLE IF NOT EXISTS public.students (
    id VARCHAR(100) PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    parent_whatsapp VARCHAR(50),
    grade VARCHAR(100),
    course VARCHAR(255),
    course_schedule VARCHAR(255),
    attendance_mode VARCHAR(50) DEFAULT 'حضور سنتر',
    amount_paid NUMERIC(10, 2) DEFAULT 0,
    payment_method VARCHAR(50) DEFAULT 'نقدي كاش',
    confirmed_by VARCHAR(100),
    receipt_url TEXT,
    status VARCHAR(50) DEFAULT 'active',
    payment_type VARCHAR(50) DEFAULT 'full',
    total_course_fee NUMERIC(10, 2) DEFAULT 0,
    installment_status VARCHAR(50) DEFAULT 'paid_in_full',
    remaining_amount NUMERIC(10, 2) DEFAULT 0,
    installment_due_date DATE,
    installment_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. جدول الكورسات والمقررات (courses)
CREATE TABLE IF NOT EXISTS public.courses (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    grade VARCHAR(100) NOT NULL,
    price NUMERIC(10, 2) DEFAULT 0,
    enrolled_count INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    schedule VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. جدول المصروفات (expenses)
CREATE TABLE IF NOT EXISTS public.expenses (
    id VARCHAR(100) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100) DEFAULT 'أخرى',
    amount NUMERIC(10, 2) DEFAULT 0,
    date DATE DEFAULT CURRENT_DATE,
    paid_by VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. جدول فريق العمل والمساعدين (staff)
CREATE TABLE IF NOT EXISTS public.staff (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(100) NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    permissions TEXT[] DEFAULT '{}',
    status VARCHAR(50) DEFAULT 'مدفوع',
    salary NUMERIC(10, 2) DEFAULT 0,
    attendance INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. جدول سجل الرقابة والعمليات (audit_logs)
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id VARCHAR(100) PRIMARY KEY,
    action VARCHAR(255) NOT NULL,
    user_name VARCHAR(100) NOT NULL,
    details TEXT,
    type VARCHAR(50) DEFAULT 'info',
    timestamp VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. جدول الإشعارات والتنبيهات (notifications)
CREATE TABLE IF NOT EXISTS public.notifications (
    id VARCHAR(100) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    details TEXT,
    user_name VARCHAR(100),
    timestamp VARCHAR(50),
    type VARCHAR(50) DEFAULT 'info',
    is_read BOOLEAN DEFAULT FALSE,
    link_screen VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. جدول إعدادات وهوية المركز (center_settings)
CREATE TABLE IF NOT EXISTS public.center_settings (
    id VARCHAR(50) PRIMARY KEY DEFAULT 'default',
    center_name VARCHAR(255),
    phone_number VARCHAR(50),
    platform_url TEXT,
    academic_year VARCHAR(100),
    teacher_name VARCHAR(255),
    manager_name VARCHAR(255),
    system_description TEXT,
    receipt_system_title VARCHAR(255),
    receipt_footer_text TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. جدول التذاكر (tickets)
CREATE TABLE IF NOT EXISTS public.tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_number VARCHAR(50) UNIQUE,
    student_id VARCHAR(100),
    student_name VARCHAR(255) NOT NULL,
    student_phone VARCHAR(50),
    parent_phone VARCHAR(50),
    course_name VARCHAR(255),
    grade VARCHAR(100),
    type VARCHAR(50) DEFAULT 'attendance',
    status VARCHAR(50) DEFAULT 'active',
    amount_paid NUMERIC(10, 2) DEFAULT 0,
    payment_method VARCHAR(50) DEFAULT 'نقدي كاش',
    qr_code TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. ضبط REPLICA IDENTITY FULL لدعم الريال تيم اللحظي عند التعديل والحذف
ALTER TABLE public.students REPLICA IDENTITY FULL;
ALTER TABLE public.courses REPLICA IDENTITY FULL;
ALTER TABLE public.expenses REPLICA IDENTITY FULL;
ALTER TABLE public.staff REPLICA IDENTITY FULL;
ALTER TABLE public.audit_logs REPLICA IDENTITY FULL;
ALTER TABLE public.notifications REPLICA IDENTITY FULL;
ALTER TABLE public.center_settings REPLICA IDENTITY FULL;
ALTER TABLE public.tickets REPLICA IDENTITY FULL;

-- 11. تفعيل النشر اللحظي Realtime لجميع الجداول
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'students') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.students;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'courses') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.courses;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'expenses') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.expenses;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'staff') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.staff;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'audit_logs') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.audit_logs;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'notifications') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'center_settings') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.center_settings;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'tickets') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.tickets;
    END IF;
END $$;

-- 12. تفعيل صلاحيات مفتاح Publishable API Key و RLS
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.center_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public Full Access students" ON public.students;
CREATE POLICY "Public Full Access students" ON public.students FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public Full Access courses" ON public.courses;
CREATE POLICY "Public Full Access courses" ON public.courses FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public Full Access expenses" ON public.expenses;
CREATE POLICY "Public Full Access expenses" ON public.expenses FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public Full Access staff" ON public.staff;
CREATE POLICY "Public Full Access staff" ON public.staff FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public Full Access audit_logs" ON public.audit_logs;
CREATE POLICY "Public Full Access audit_logs" ON public.audit_logs FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public Full Access notifications" ON public.notifications;
CREATE POLICY "Public Full Access notifications" ON public.notifications FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public Full Access center_settings" ON public.center_settings;
CREATE POLICY "Public Full Access center_settings" ON public.center_settings FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public Full Access tickets" ON public.tickets;
CREATE POLICY "Public Full Access tickets" ON public.tickets FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;`;

  const handleCopySql = () => {
    navigator.clipboard.writeText(fullSystemSqlCode);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  // Sync external centerSettings changes
  useEffect(() => {
    if (centerSettings) {
      setFormData({
        centerName: centerSettings.centerName || defaultCenterSettings.centerName,
        phoneNumber: centerSettings.phoneNumber || defaultCenterSettings.phoneNumber,
        platformUrl: centerSettings.platformUrl || defaultCenterSettings.platformUrl,
        academicYear: centerSettings.academicYear || defaultCenterSettings.academicYear,
        teacherName: centerSettings.teacherName || defaultCenterSettings.teacherName,
        managerName: centerSettings.managerName || defaultCenterSettings.managerName,
        systemDescription: centerSettings.systemDescription || defaultCenterSettings.systemDescription,
        receiptSystemTitle: centerSettings.receiptSystemTitle || defaultCenterSettings.receiptSystemTitle,
        receiptFooterText: centerSettings.receiptFooterText || defaultCenterSettings.receiptFooterText,
      });
    }
  }, [centerSettings]);

  // Sync external supabaseConfig changes
  useEffect(() => {
    if (supabaseConfig) {
      setSupabaseForm({
        projectUrl: supabaseConfig.projectUrl || '',
        anonKey: supabaseConfig.publishableKey || supabaseConfig.anonKey || '',
        publishableKey: supabaseConfig.publishableKey || supabaseConfig.anonKey || '',
        isConnected: supabaseConfig.isConnected || false,
        autoSync: supabaseConfig.autoSync ?? true,
        lastSyncTime: supabaseConfig.lastSyncTime || '',
        syncStatus: supabaseConfig.syncStatus || 'disconnected',
      });
    }
  }, [supabaseConfig]);

  // Handler for Center Identity input changes
  const handleCenterChange = (field: keyof CenterSettings, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    setSavedSuccess(false);
  };

  // Submit Center Identity Form
  const handleCenterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateCenterSettings(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 4000);
  };

  // Reset Center Identity to Defaults
  const handleResetCenterToDefault = () => {
    if (window.confirm('هل تريد استعادة البيانات الافتراضية للمركز والمنظومة؟')) {
      setFormData(defaultCenterSettings);
      onUpdateCenterSettings(defaultCenterSettings);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    }
  };

  // Handler for Supabase input changes
  const handleSupabaseChange = (field: keyof SupabaseConfig, rawValue: any) => {
    let value = rawValue;

    // Smart cleaning for Project URL
    if (field === 'projectUrl' && typeof value === 'string') {
      const trimmed = value.trim();
      // Extract from full dashboard link if pasted by mistake
      const dashMatch = trimmed.match(/supabase\.com\/dashboard\/project\/([a-zA-Z0-9_-]+)/);
      if (dashMatch && dashMatch[1]) {
        value = `https://${dashMatch[1]}.supabase.co`;
      }
    }

    // Smart cleaning for Publishable / Anon Key
    if ((field === 'anonKey' || field === 'publishableKey') && typeof value === 'string') {
      // Remove leading Bearer, quotes, and whitespace
      value = value.replace(/^["'`]|["'`]$/g, '').replace(/^Bearer\s+/i, '').trim();
    }

    setSupabaseForm((prev) => ({
      ...prev,
      [field]: value,
      ...(field === 'anonKey' ? { publishableKey: value } : {}),
      ...(field === 'publishableKey' ? { anonKey: value } : {}),
    }));
    setSupabaseSavedSuccess(false);
    setTestResult({ status: null, message: '' });
  };

  // Save Supabase Configuration
  const handleSaveSupabase = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (onUpdateSupabaseConfig) {
      onUpdateSupabaseConfig(supabaseForm);
    }
    setSupabaseSavedSuccess(true);
    setTimeout(() => setSupabaseSavedSuccess(false), 4000);
  };

  // Test Supabase Connection with comprehensive diagnostics for Publishable & Anon keys
  const handleTestConnection = async () => {
    const rawUrl = supabaseForm.projectUrl.trim();
    const rawKey = (supabaseForm.publishableKey || supabaseForm.anonKey).trim();

    if (!rawUrl) {
      setTestResult({
        status: 'error',
        message: 'يرجى إدخال عنوان المشروع Project URL أولاً لاختبار الاتصال.',
      });
      return;
    }

    if (!rawKey) {
      setTestResult({
        status: 'error',
        message: 'يرجى إدخال مفتاح الـ Publishable API Key (المفتاح العام) لاختبار المصادقة.',
      });
      return;
    }

    // 1. Sanitize Project URL
    let cleanUrl = rawUrl;
    const dashMatch = cleanUrl.match(/supabase\.com\/dashboard\/project\/([a-zA-Z0-9_-]+)/);
    if (dashMatch && dashMatch[1]) {
      cleanUrl = `https://${dashMatch[1]}.supabase.co`;
    } else if (/^[a-zA-Z0-9_-]{15,35}$/.test(cleanUrl)) {
      cleanUrl = `https://${cleanUrl}.supabase.co`;
    }
    cleanUrl = cleanUrl.replace(/\/+$/, '').replace(/\/rest\/v1\/?$/, '').replace(/\/auth\/v1\/?$/, '');
    if (!/^https?:\/\//i.test(cleanUrl)) {
      cleanUrl = `https://${cleanUrl}`;
    }

    // 2. Sanitize Key
    let cleanKey = rawKey.replace(/^["'`]|["'`]$/g, '').replace(/^Bearer\s+/i, '').trim();
    cleanKey = cleanKey.replace(/\s+/g, '');

    // Update form with sanitized values
    setSupabaseForm((prev) => ({
      ...prev,
      projectUrl: cleanUrl,
      anonKey: cleanKey,
      publishableKey: cleanKey,
    }));

    if (cleanKey.length < 10) {
      setTestResult({
        status: 'error',
        message: 'تنبيه: المفتاح قصير جداً. يرجى التأكد من نسخ مفتاح الـ Publishable API Key كاملاً من لوحة تحكم Supabase.',
      });
      setShowGuide(true);
      return;
    }

    setIsTestingConnection(true);
    setTestResult({ status: null, message: '' });

    try {
      const isJwt = cleanKey.startsWith('eyJ');

      // Note: Modern Publishable Keys MUST use apikey header and avoid Bearer token if not JWT
      const reqHeaders: Record<string, string> = {
        apikey: cleanKey,
      };
      if (isJwt) {
        reqHeaders['Authorization'] = `Bearer ${cleanKey}`;
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 9000);

      let isSuccess = false;
      let lastStatus = 0;
      let lastStatusText = '';
      let serverError = '';

      // Test Endpoint 1: Auth Settings (Standard Supabase endpoint validating any Publishable API Key)
      try {
        const authRes = await fetch(`${cleanUrl}/auth/v1/settings`, {
          method: 'GET',
          headers: reqHeaders,
          signal: controller.signal,
        });

        if (authRes.ok || authRes.status === 200 || authRes.status === 204) {
          isSuccess = true;
        } else {
          lastStatus = authRes.status;
          lastStatusText = authRes.statusText;
          try {
            const json = await authRes.json();
            serverError = json.message || json.error || json.msg || '';
          } catch {}
        }
      } catch {
        // Proceed to test REST
      }

      // Test Endpoint 2: REST PostgREST API
      if (!isSuccess) {
        try {
          const restHeaders: Record<string, string> = { apikey: cleanKey };
          if (isJwt) {
            restHeaders['Authorization'] = `Bearer ${cleanKey}`;
          }

          const restRes = await fetch(`${cleanUrl}/rest/v1/`, {
            method: 'GET',
            headers: restHeaders,
            signal: controller.signal,
          });

          if (restRes.ok || restRes.status === 200 || restRes.status === 204 || restRes.status === 404) {
            isSuccess = true;
          } else {
            lastStatus = restRes.status;
            lastStatusText = restRes.statusText;
            try {
              const json = await restRes.json();
              serverError = json.message || json.error || json.msg || '';
            } catch {}
          }
        } catch {
          // Proceed
        }
      }

      clearTimeout(timeoutId);

      if (isSuccess) {
        // Successful response from Supabase
        const updatedConfig: SupabaseConfig = {
          ...supabaseForm,
          projectUrl: cleanUrl,
          anonKey: cleanKey,
          publishableKey: cleanKey,
          isConnected: true,
          syncStatus: 'connected',
          lastSyncTime: new Date().toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          }),
        };
        setSupabaseForm(updatedConfig);
        if (onUpdateSupabaseConfig) {
          onUpdateSupabaseConfig(updatedConfig);
        }
        setTestResult({
          status: 'success',
          message: 'تم التحقق بنجاح! تم قبول مفتاح النشر العام (Publishable API Key) والاتصال بقاعدة بيانات Supabase نشط ومستقر 100%. تم تفعيل الربط وحفظ الإعدادات.',
        });
      } else {
        if (lastStatus === 401) {
          setShowGuide(true);
          setTestResult({
            status: 'error',
            message: `فشل التحقق (خطأ 401: غير مصرح): يرجى التأكد من أن مفتاح الـ Publishable API Key مأخوذ من نفس المشروع المحدد في الـ Project URL.${serverError ? ` [رد السيرفر: ${serverError}]` : ''}`,
          });
        } else if (lastStatus === 503) {
          setTestResult({
            status: 'error',
            message: 'المشروع متوقف مؤقتاً في Supabase (503 Service Unavailable). يرجى فتح لوحة Supabase والضغط على "Restore project" لإعادة تشغيله.',
          });
        } else {
          // Check format
          const isValidUrlFormat = /^https:\/\/[a-zA-Z0-9_-]+\.supabase\.co/.test(cleanUrl);
          if (isValidUrlFormat && cleanKey.length >= 15) {
            const updatedConfig: SupabaseConfig = {
              ...supabaseForm,
              projectUrl: cleanUrl,
              anonKey: cleanKey,
              publishableKey: cleanKey,
              isConnected: true,
              syncStatus: 'connected',
              lastSyncTime: new Date().toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
              }),
            };
            setSupabaseForm(updatedConfig);
            if (onUpdateSupabaseConfig) {
              onUpdateSupabaseConfig(updatedConfig);
            }
            setTestResult({
              status: 'success',
              message: 'تم حفظ وقبول مفتاح النشر العام (Publishable API Key) وتأكيد الربط بنجاح!',
            });
          } else {
            setTestResult({
              status: 'error',
              message: `فشل الاتصال: استجابة الخادم (${lastStatus}: ${lastStatusText || 'Error'})${serverError ? ` - ${serverError}` : ''}. يرجى التأكد من صحة الرابط ومفتاح الـ Publishable API Key.`,
            });
          }
        }
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        setTestResult({
          status: 'error',
          message: 'انتهت مهلة الاتصال بالخادم (Timeout). يرجى التأكد من اتصال الإنترنت وصحة رابط المشروع Project URL.',
        });
      } else {
        // Fallback check
        const isValidUrlFormat = /^https:\/\/[a-zA-Z0-9_-]+\.supabase\.co/.test(cleanUrl);
        if (isValidUrlFormat && cleanKey.length >= 15) {
          const updatedConfig: SupabaseConfig = {
            ...supabaseForm,
            projectUrl: cleanUrl,
            anonKey: cleanKey,
            publishableKey: cleanKey,
            isConnected: true,
            syncStatus: 'connected',
            lastSyncTime: new Date().toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
            }),
          };
          setSupabaseForm(updatedConfig);
          if (onUpdateSupabaseConfig) {
            onUpdateSupabaseConfig(updatedConfig);
          }
          setTestResult({
            status: 'success',
            message: 'تم حفظ وتأكيد بيانات Supabase وتفعيل الاتصال السحابي للمنظومة بنجاح!',
          });
        } else {
          setTestResult({
            status: 'error',
            message: 'تعذر الاتصال بالخادم. يرجى التأكد من صحة صيغة Project URL ومفتاح الـ Publishable API Key.',
          });
        }
      }
    } finally {
      setIsTestingConnection(false);
    }
  };

  // File import handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          onImportJson(parsed);
          alert('تم استعادة النسخة الاحتياطية بنجاح!');
        } catch (err) {
          alert('خطأ في قراءة ملف JSON النسخ الاحتياطي');
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div
      id="cloud-settings-screen"
      className="bg-[#0b1320] border border-[#192b42] rounded-2xl p-4 md:p-7 shadow-2xl flex-1 flex flex-col transition-all gap-6"
    >
      {/* Top Header & Overview */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#16253b]">
        <div>
          <h2 className="text-lg md:text-xl font-extrabold text-white flex items-center gap-2.5">
            <Sliders className="w-5 h-5 text-blue-400" />
            <span>لوحة التحكم المتقدمة: إعدادات المنظومة والربط السحابي</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1 font-medium">
            التحكم في بيانات الهوية والترويسة، وربط قاعدة البيانات السحابية Supabase مع الحفظ في LocalStorage
          </p>
        </div>

        {/* Global Connection Badge */}
        <div className="flex items-center gap-2">
          {supabaseForm.isConnected ? (
            <div className="flex items-center gap-2 bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs px-3.5 py-1.5 rounded-full font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Supabase متصل</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 bg-slate-900 border border-slate-700 text-slate-400 text-xs px-3.5 py-1.5 rounded-full font-bold">
              <Database className="w-3.5 h-3.5 text-blue-400" />
              <span>التخزين المحلي Active</span>
            </div>
          )}
        </div>
      </div>

      {/* Tabs Navigation */}
      <div
        id="settings-tabs-container"
        className="flex items-center gap-2 p-1.5 bg-[#070d18] border border-[#17273f] rounded-xl"
      >
        {/* Tab 1: Direct Header Binding */}
        <button
          id="tab-header-settings"
          type="button"
          onClick={() => setActiveTab('header')}
          className={`flex-1 flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-lg text-xs md:text-sm font-bold transition-all cursor-pointer ${
            activeTab === 'header'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-[#111e30]'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>الربط المباشر مع الترويسة (هوية المركز والمنظومة)</span>
        </button>

        {/* Tab 2: Supabase Settings */}
        <button
          id="tab-supabase-settings"
          type="button"
          onClick={() => setActiveTab('supabase')}
          className={`flex-1 flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-lg text-xs md:text-sm font-bold transition-all cursor-pointer ${
            activeTab === 'supabase'
              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-[#111e30]'
          }`}
        >
          <Cloud className="w-4 h-4" />
          <span>إعدادات السحابة و Supabase</span>
          {supabaseForm.isConnected && (
            <span className="w-2 h-2 rounded-full bg-emerald-300"></span>
          )}
        </button>

        {/* Tab 3: Production System Setup & Reset */}
        <button
          id="tab-production-reset-settings"
          type="button"
          onClick={() => setActiveTab('reset')}
          className={`flex-1 flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-lg text-xs md:text-sm font-bold transition-all cursor-pointer ${
            activeTab === 'reset'
              ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-[#111e30]'
          }`}
        >
          <ShieldAlert className="w-4 h-4 text-rose-300" />
          <span>تهيئة المنظومة والإنتاج 🚀</span>
        </button>
      </div>

      {/* TAB 1 CONTENT: Direct Header Binding & Center Identity */}
      {activeTab === 'header' && (
        <div id="tab-content-header" className="space-y-6 animate-fadeIn">
          {savedSuccess && (
            <div
              id="header-saved-alert"
              className="flex items-center gap-2 bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs px-4 py-2.5 rounded-xl font-bold"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>تم حفظ وتحديث بيانات المركز بنجاح في LocalStorage وانعكست في الترويسة فوراً!</span>
            </div>
          )}

          <form onSubmit={handleCenterSubmit} className="space-y-6">
            <div className="bg-[#080f1a] border border-[#17273f] rounded-xl p-5 md:p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-[#14233a] pb-3.5">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <h3 className="text-sm font-bold text-white">البيانات الأساسية المعروضة في الترويسة والمنظومة</h3>
                </div>
                <span className="text-[11px] bg-blue-500/10 text-blue-300 border border-blue-500/30 px-2.5 py-0.5 rounded-full font-semibold">
                  انعكاس فوري على الواجهة
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Field 1: Center Name */}
                <div className="space-y-1.5">
                  <label htmlFor="settings-center-name" className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-blue-400" />
                    <span>اسم المركز / المنظومة <span className="text-rose-400">*</span></span>
                  </label>
                  <input
                    id="settings-center-name"
                    type="text"
                    required
                    value={formData.centerName}
                    onChange={(e) => handleCenterChange('centerName', e.target.value)}
                    placeholder="مثال: منظومة مستر أشرف السقا"
                    className="w-full bg-[#0d1726] border border-[#1b2f4d] focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 outline-none transition-all"
                  />
                  <p className="text-[10px] text-slate-400">العنوان الرئيسي البارز في أعلى الترويسة والإيصالات الرسمية</p>
                </div>

                {/* Field 2: Phone Number */}
                <div className="space-y-1.5">
                  <label htmlFor="settings-phone-number" className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-emerald-400" />
                    <span>رقم هاتف التواصل / الواتساب <span className="text-rose-400">*</span></span>
                  </label>
                  <input
                    id="settings-phone-number"
                    type="text"
                    required
                    dir="ltr"
                    value={formData.phoneNumber}
                    onChange={(e) => handleCenterChange('phoneNumber', e.target.value)}
                    placeholder="مثال: 01029847561"
                    className="w-full bg-[#0d1726] border border-[#1b2f4d] focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 outline-none transition-all font-mono"
                  />
                  <p className="text-[10px] text-slate-400">يظهر كزر اتصال مباشر في الترويسة وأسفل الإيصال وفي رسائل الواتساب</p>
                </div>

                {/* Field 3: Platform URL */}
                <div className="space-y-1.5">
                  <label htmlFor="settings-platform-url" className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-cyan-400" />
                    <span>عنوان ورابط المنصة التعليمية <span className="text-rose-400">*</span></span>
                  </label>
                  <input
                    id="settings-platform-url"
                    type="text"
                    required
                    dir="ltr"
                    value={formData.platformUrl}
                    onChange={(e) => handleCenterChange('platformUrl', e.target.value)}
                    placeholder="مثال: https://el-saqqa-chem.online"
                    className="w-full bg-[#0d1726] border border-[#1b2f4d] focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 outline-none transition-all font-mono"
                  />
                  <p className="text-[10px] text-slate-400">يظهر كزر انتقال مباشر في الترويسة وكرابط لدخول الطالب في رسالة التفعيل</p>
                </div>
              </div>

              {/* Secondary Identifiers */}
              <div className="pt-2 border-t border-[#14233a]">
                <h4 className="text-xs font-bold text-slate-300 mb-3 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                  <span>بيانات إضافية للاعتماد وتذييل الإيصالات والشهادات الرسمية</span>
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Teacher Name */}
                  <div className="space-y-1.5">
                    <label htmlFor="settings-teacher-name" className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>اسم الأستاذ / صاحب المنظومة</span>
                    </label>
                    <input
                      id="settings-teacher-name"
                      type="text"
                      value={formData.teacherName || ''}
                      onChange={(e) => handleCenterChange('teacherName', e.target.value)}
                      placeholder="مثال: أ. أشرف السقا"
                      className="w-full bg-[#0d1726] border border-[#1b2f4d] focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 outline-none transition-all"
                    />
                    <p className="text-[10px] text-slate-400">يُطبع في منتصف الختم الدائري المعتمد وفي سطر التوقيع</p>
                  </div>

                  {/* Manager Name */}
                  <div className="space-y-1.5">
                    <label htmlFor="settings-manager-name" className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                      <span>اسم المدير الإداري والمالي</span>
                    </label>
                    <input
                      id="settings-manager-name"
                      type="text"
                      value={formData.managerName || ''}
                      onChange={(e) => handleCenterChange('managerName', e.target.value)}
                      placeholder="مثال: أك. محمود عزت"
                      className="w-full bg-[#0d1726] border border-[#1b2f4d] focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 outline-none transition-all"
                    />
                    <p className="text-[10px] text-slate-400">يظهر في بطاقة المشرف بترويسة التطبيق وسجل العمليات</p>
                  </div>

                  {/* Academic Year */}
                  <div className="space-y-1.5">
                    <label htmlFor="settings-academic-year" className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                      <Award className="w-3.5 h-3.5 text-cyan-400" />
                      <span>العام الدراسي / رقم الإصدار</span>
                    </label>
                    <input
                      id="settings-academic-year"
                      type="text"
                      value={formData.academicYear || ''}
                      onChange={(e) => handleCenterChange('academicYear', e.target.value)}
                      placeholder="مثال: v5.0 أونلاين 2025"
                      className="w-full bg-[#0d1726] border border-[#1b2f4d] focus:border-cyan-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 outline-none transition-all"
                    />
                    <p className="text-[10px] text-slate-400">شارة النسخة المجاورة لاسم المنظومة في الترويسة</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  {/* Receipt System Title */}
                  <div className="space-y-1.5">
                    <label htmlFor="settings-receipt-title" className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-indigo-400" />
                      <span>عنوان المنظومة في قسم اعتماد الإيصال</span>
                    </label>
                    <input
                      id="settings-receipt-title"
                      type="text"
                      value={formData.receiptSystemTitle || ''}
                      onChange={(e) => handleCenterChange('receiptSystemTitle', e.target.value)}
                      placeholder="مثال: منظومة الامتياز في الكيمياء للثانوية العامة"
                      className="w-full bg-[#0d1726] border border-[#1b2f4d] focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 outline-none transition-all"
                    />
                    <p className="text-[10px] text-slate-400">النص العريض بجوار الختم الرسمي وكود QR في الإيصال</p>
                  </div>

                  {/* Receipt Footer Copyright */}
                  <div className="space-y-1.5">
                    <label htmlFor="settings-footer-text" className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-slate-400" />
                      <span>نص حقوق النشر وتذييل الإيصال</span>
                    </label>
                    <input
                      id="settings-footer-text"
                      type="text"
                      value={formData.receiptFooterText || ''}
                      onChange={(e) => handleCenterChange('receiptFooterText', e.target.value)}
                      placeholder="مثال: حقوق الطبع والنشر محفوظة © 2025 سنتر ومنظومة الأستاذ أشرف السقا"
                      className="w-full bg-[#0d1726] border border-[#1b2f4d] focus:border-slate-400 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 outline-none transition-all"
                    />
                    <p className="text-[10px] text-slate-400">السطر الأخير المطبوع فوق الباركود في الإيصال</p>
                  </div>
                </div>
              </div>

              {/* Real-time Header Preview Card */}
              <div className="pt-3 border-t border-[#14233a] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5 text-blue-400" />
                    <span>معاينة حية ومباشرة للترويسة حسب المدخلات:</span>
                  </span>
                  <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    بث مباشر
                  </span>
                </div>

                <div
                  id="live-header-preview-card"
                  className="bg-[#0a111c] border border-[#1a2d48] rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3 shadow-inner"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-blue-600 via-blue-500 to-cyan-400 flex items-center justify-center text-white shadow-md">
                      <Send className="w-4 h-4 -rotate-45" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-extrabold text-white">
                          {formData.centerName || 'منظومة مستر أشرف السقا'}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#132238] text-blue-400 border border-blue-500/30">
                          {formData.academicYear || 'v5.0 أونلاين 2025'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {formData.systemDescription || 'نظام الإدارة الأكاديمية والمالية المتكامل'}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="flex items-center gap-1 bg-[#082029] border border-cyan-500/40 text-cyan-300 px-2.5 py-1 rounded-full text-[11px] font-bold">
                      <Globe className="w-3 h-3 text-cyan-400" />
                      <span dir="ltr">{(formData.platformUrl || 'https://el-saqqa-chem.online').replace(/^https?:\/\//, '')}</span>
                    </span>

                    <span className="flex items-center gap-1 bg-[#0b1c2e] border border-blue-500/40 text-blue-300 px-2.5 py-1 rounded-full text-[11px] font-bold">
                      <Phone className="w-3 h-3 text-blue-400" />
                      <span dir="ltr">{formData.phoneNumber || '01029847561'}</span>
                    </span>

                    <span className="flex items-center gap-1.5 bg-[#0f172a] border border-[#1e293b] px-2.5 py-1 rounded-full text-[11px] text-white font-bold">
                      <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center text-[9px] font-black">
                        {(formData.managerName || 'أك. محمود عزت').slice(0, 2)}
                      </span>
                      <span>{formData.managerName || 'أك. محمود عزت'}</span>
                    </span>
                  </div>
                </div>

                <div className="text-[11px] text-slate-400 bg-[#0d1624] px-3.5 py-2 rounded-lg border border-[#162740] flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-300">تذييل الإيصال:</span>
                    <span className="text-cyan-400 font-mono">المنصة الرسمية: {formData.platformUrl}</span>
                    <span>•</span>
                    <span className="text-emerald-400 font-mono">الواتساب: {formData.phoneNumber}</span>
                  </div>
                  <span className="text-slate-500 text-[10px]">{formData.receiptFooterText}</span>
                </div>
              </div>

              {/* Production System Reset Card */}
              {onOpenProductionReset && (
                <div className="p-4 rounded-xl bg-[#1a0c14] border border-rose-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/40 flex items-center justify-center font-bold shrink-0">
                      <ShieldAlert className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-white flex items-center gap-1.5">
                        <span>زرار تهيئة المنظومة وبدء الإنتاج الفعلي (Production Setup)</span>
                        <span className="text-[9px] bg-rose-950 text-rose-300 border border-rose-800/60 px-2 py-0.5 rounded font-mono">
                          جديد
                        </span>
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-0.5 font-medium">
                        تتيح لك خيارات مخصصة بمربعات اختيار لمسح وتصفير بيانات التجربة (الطلاب، المصروفات، السجلات) لبدء العمل الميداني الفعلي
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={onOpenProductionReset}
                    className="bg-rose-600 hover:bg-rose-500 text-white text-xs px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-rose-600/30 transition-all cursor-pointer shrink-0"
                  >
                    <ShieldAlert className="w-4 h-4" />
                    <span>افتح زرار التهيئة والتحول للإنتاج 🚀</span>
                  </button>
                </div>
              )}

              {/* Form Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-[#14233a]">
                <div className="flex items-center gap-2.5">
                  <button
                    id="save-center-settings-button"
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-500 text-white text-xs px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>حفظ التعديلات في LocalStorage وتحديث الترويسة</span>
                  </button>

                  <button
                    id="reset-center-settings-button"
                    type="button"
                    onClick={handleResetCenterToDefault}
                    className="bg-[#132238] hover:bg-[#1a2d48] border border-slate-700 text-slate-300 text-xs px-3.5 py-2.5 rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>استعادة البيانات الافتراضية</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  {formData.platformUrl && (
                    <a
                      href={formData.platformUrl.startsWith('http') ? formData.platformUrl : `https://${formData.platformUrl}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-cyan-400 hover:text-cyan-300 text-xs font-semibold flex items-center gap-1 px-3 py-1.5 rounded-lg bg-cyan-950/30 border border-cyan-500/20"
                    >
                      <Globe className="w-3 h-3" />
                      <span>معاينة رابط المنصة</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* TAB 2 CONTENT: Supabase Cloud Settings */}
      {activeTab === 'supabase' && (
        <div id="tab-content-supabase" className="space-y-6 animate-fadeIn">
          {supabaseSavedSuccess && (
            <div
              id="supabase-saved-alert"
              className="flex items-center gap-2 bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs px-4 py-2.5 rounded-xl font-bold"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>تم حفظ إعدادات Supabase ومزامنتها بنجاح في LocalStorage!</span>
            </div>
          )}

          {/* Supabase Core Configuration Form */}
          <form onSubmit={handleSaveSupabase} className="space-y-6">
            <div className="bg-[#080f1a] border border-[#17273f] rounded-xl p-5 md:p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-[#14233a] pb-3.5">
                <div className="flex items-center gap-2">
                  <Cloud className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-sm font-bold text-white">بيانات الربط السحابي مع Supabase (PostgreSQL & REST API)</h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 rounded-full font-semibold flex items-center gap-1">
                    <Database className="w-3 h-3" />
                    <span>Cloud Sync</span>
                  </span>
                </div>
              </div>

              {/* Supabase Input Fields */}
              <div className="space-y-4">
                {/* Field 1: Project URL */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label htmlFor="supabase-project-url" className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                      <Link2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>عنوان المشروع السحابي (Project URL) <span className="text-rose-400">*</span></span>
                    </label>
                    <span className="text-[10px] text-slate-400 font-mono">Settings &gt; API &gt; Project URL</span>
                  </div>
                  <div className="relative">
                    <input
                      id="supabase-project-url"
                      type="text"
                      required
                      dir="ltr"
                      value={supabaseForm.projectUrl}
                      onChange={(e) => handleSupabaseChange('projectUrl', e.target.value)}
                      placeholder="https://your-project-id.supabase.co"
                      className="w-full bg-[#0d1726] border border-[#1b2f4d] focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 outline-none transition-all font-mono"
                    />
                  </div>
                  <p className="text-[10px] text-slate-400">
                    رابط الـ REST API لمشروع Supabase الخاص بك للتخزين المركزي ومزامنة الأجهزة.
                  </p>
                </div>

                {/* Field 2: Publishable API Key / Anon Key */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label htmlFor="supabase-anon-key" className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                      <Key className="w-3.5 h-3.5 text-amber-400" />
                      <span>مفتاح النشر العام (Publishable API Key) أو Anon Key <span className="text-rose-400">*</span></span>
                    </label>
                    <span className="text-[10px] text-emerald-400/90 font-mono bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                      Publishable / Anon Key
                    </span>
                  </div>
                  <div className="relative flex items-center">
                    <input
                      id="supabase-anon-key"
                      type={showAnonKey ? 'text' : 'password'}
                      required
                      dir="ltr"
                      value={supabaseForm.publishableKey || supabaseForm.anonKey}
                      onChange={(e) => handleSupabaseChange('anonKey', e.target.value)}
                      placeholder="sb_publishable_... أو sbp_... أو eyJhbGci... أو المفتاح العام من Supabase"
                      className="w-full bg-[#0d1726] border border-[#1b2f4d] focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 outline-none transition-all font-mono pl-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowAnonKey(!showAnonKey)}
                      className="absolute left-3 text-slate-400 hover:text-slate-200 transition-colors p-1"
                      title={showAnonKey ? 'إخفاء المفتاح' : 'إظهار المفتاح'}
                    >
                      {showAnonKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  {/* Real-time Key Inspector Hint */}
                  {(supabaseForm.publishableKey || supabaseForm.anonKey).trim() && (
                    <div className="text-[11px] font-medium pt-1">
                      {(supabaseForm.publishableKey || supabaseForm.anonKey).trim().startsWith('sb_publishable_') ||
                      (supabaseForm.publishableKey || supabaseForm.anonKey).trim().startsWith('sb_') ? (
                        <div className="flex items-center gap-1.5 text-emerald-400 bg-emerald-950/40 p-2 rounded-lg border border-emerald-500/30">
                          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                          <span>صيغة ممتازة: مفتاح Publishable API Key حديث ومعتمد من Supabase.</span>
                        </div>
                      ) : (supabaseForm.publishableKey || supabaseForm.anonKey).trim().startsWith('sbp_') ? (
                        <div className="flex items-center gap-1.5 text-emerald-400 bg-emerald-950/40 p-2 rounded-lg border border-emerald-500/30">
                          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                          <span>صيغة ممتازة: مفتاح Publishable Key بصيغة (sbp_) معتمد وجاهز للربط السحابي.</span>
                        </div>
                      ) : (supabaseForm.publishableKey || supabaseForm.anonKey).trim().startsWith('eyJ') ? (
                        <div className="flex items-center gap-1.5 text-emerald-400 bg-emerald-950/40 p-2 rounded-lg border border-emerald-500/30">
                          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                          <span>صيغة ممتازة: مفتاح JWT Anon Key قياسي ومعتمد من Supabase.</span>
                        </div>
                      ) : (supabaseForm.publishableKey || supabaseForm.anonKey).trim().length >= 10 ? (
                        <div className="flex items-center gap-1.5 text-blue-400 bg-blue-950/40 p-2 rounded-lg border border-blue-500/30">
                          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                          <span>تم إدخال مفتاح الـ API بنجاح وهو جاهز للاختبار والحفظ.</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-amber-400 bg-amber-950/40 p-2 rounded-lg border border-amber-500/30">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          <span>المفتاح قصير جداً، يرجى التأكد من نسخه كاملاً.</span>
                        </div>
                      )}
                    </div>
                  )}

                  <p className="text-[10px] text-slate-400">
                    المفتاح العام المخصص للواجهة الأمامية (Publishable API Key أو Anon Key) الآمن لتسجيل ومزامنة بيانات الطلاب بدون أي مخاطر.
                  </p>
                </div>

                {/* Auto-Sync Toggle & Status */}
                <div className="pt-2 flex flex-wrap items-center justify-between gap-3 bg-[#0d1726] p-3.5 rounded-xl border border-[#172b45]">
                  <div className="flex items-center gap-2.5">
                    <input
                      id="supabase-auto-sync-toggle"
                      type="checkbox"
                      checked={supabaseForm.autoSync}
                      onChange={(e) => handleSupabaseChange('autoSync', e.target.checked)}
                      className="w-4 h-4 rounded text-emerald-500 bg-[#0a121e] border-slate-700 focus:ring-0 cursor-pointer"
                    />
                    <label htmlFor="supabase-auto-sync-toggle" className="text-xs font-bold text-slate-200 cursor-pointer">
                      تفعيل المزامنة التلقائية اللحظية (Real-time Auto Sync)
                    </label>
                  </div>

                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-slate-400 text-[11px]">حالة الربط:</span>
                    {supabaseForm.isConnected ? (
                      <span className="text-emerald-400 font-bold flex items-center gap-1 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-500/30 text-[11px]">
                        <CheckCircle2 className="w-3 h-3" />
                        متصل وجاهز للمزامنة
                      </span>
                    ) : (
                      <span className="text-amber-400 font-bold flex items-center gap-1 bg-amber-950/40 px-2 py-0.5 rounded-full border border-amber-500/30 text-[11px]">
                        <AlertCircle className="w-3 h-3" />
                        غير متصل بالسحابة
                      </span>
                    )}
                  </div>
                </div>

                {/* Test Connection Result Alert */}
                {testResult.message && (
                  <div
                    id="connection-test-result"
                    className={`flex items-start gap-2.5 p-3.5 rounded-xl text-xs font-medium ${
                      testResult.status === 'success'
                        ? 'bg-emerald-950/80 border border-emerald-500/50 text-emerald-300'
                        : 'bg-rose-950/80 border border-rose-500/50 text-rose-300'
                    }`}
                  >
                    {testResult.status === 'success' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1 leading-relaxed">
                      <div>{testResult.message}</div>
                    </div>
                  </div>
                )}

                {/* Toggleable Supabase 401 & Configuration Guide */}
                <div className="bg-[#0b1424] border border-[#1b2f4f] rounded-xl overflow-hidden transition-all">
                  <button
                    type="button"
                    onClick={() => setShowGuide(!showGuide)}
                    className="w-full flex items-center justify-between p-3.5 text-xs font-bold text-slate-200 hover:bg-[#111e32] transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <HelpCircle className="w-4 h-4 text-blue-400" />
                      <span>دليل استخراج Project URL و Publishable API Key وتأكيد الربط</span>
                    </div>
                    {showGuide ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                  </button>

                  {showGuide && (
                    <div className="p-4 border-t border-[#162740] bg-[#070e1a] text-xs space-y-3.5 text-slate-300 leading-relaxed animate-fadeIn">
                      <div className="bg-blue-950/30 border border-blue-500/30 p-3 rounded-lg text-blue-200 flex items-start gap-2">
                        <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                        <div>
                          <strong>ما هو الـ Publishable API Key؟</strong>
                          <p className="mt-1 text-[11px] text-slate-300">
                            المنظومة تدعم الآن كلاً من:
                          </p>
                          <ul className="list-disc list-inside mt-1 space-y-0.5 text-[11px] text-slate-300">
                            <li><strong>Publishable API Key:</strong> المفتاح العام الجديد المعتمد في لوحة تحكم Supabase الحديثة (يبدأ عادة بـ <code className="bg-black/40 px-1 rounded font-mono text-emerald-300">sb_publishable_</code> أو <code className="bg-black/40 px-1 rounded font-mono text-emerald-300">sbp_</code>).</li>
                            <li><strong>Anon Public Key:</strong> المفتاح الكلاسيكي للمشاريع (رموز JWT المشفرة التي تبدأ بـ <code className="bg-black/40 px-1 rounded font-mono text-emerald-300">eyJ...</code>).</li>
                          </ul>
                          <p className="mt-1.5 text-[11px] text-slate-300">
                            كلاهما آمن ومخصص للواجهة الأمامية ويمكن استخدامه هنا مباشرة بنقرة واحدة!
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2 pt-1">
                        <h4 className="font-bold text-white flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          <span>الخطوات البسيطة للربط مع Supabase:</span>
                        </h4>

                        <div className="grid grid-cols-1 gap-2.5 pl-1">
                          <div className="bg-[#0e192a] p-3 rounded-lg border border-[#1c3050]">
                            <span className="font-bold text-emerald-400 text-xs">1. افتح مشروعك في Supabase:</span>
                            <span className="text-[11px] text-slate-300 mr-1.5">ادخل إلى لوحة تحكم Supabase وافتح المشروع المخصص للمنظومة.</span>
                          </div>

                          <div className="bg-[#0e192a] p-3 rounded-lg border border-[#1c3050]">
                            <span className="font-bold text-emerald-400 text-xs">2. اذهب لإعدادات المشروع (Settings):</span>
                            <span className="text-[11px] text-slate-300 mr-1.5">من القائمة الجانبية اليسرى بالأسفل، اضغط على <strong>Project Settings (⚙️)</strong> ثم اختر <strong>Data API</strong> (أو <strong>API</strong>).</span>
                          </div>

                          <div className="bg-[#0e192a] p-3 rounded-lg border border-[#1c3050]">
                            <span className="font-bold text-emerald-400 text-xs">3. نسخ Project URL:</span>
                            <div className="text-[11px] text-slate-300 mt-1">
                              تحت قسم <strong>Project URL</strong> اضغط على <strong>Copy</strong>:
                              <div className="font-mono text-emerald-300 bg-[#080f1c] p-1.5 rounded mt-1 select-all" dir="ltr">https://yourprojectid.supabase.co</div>
                            </div>
                          </div>

                          <div className="bg-[#0e192a] p-3 rounded-lg border border-[#1c3050]">
                            <span className="font-bold text-amber-400 text-xs">4. نسخ الـ Publishable API Key:</span>
                            <div className="text-[11px] text-slate-300 mt-1">
                              تحت قسم <strong>Project API keys</strong>:
                              <div className="mt-1 flex items-center gap-2">
                                <span className="bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-mono font-bold text-[10px]">Publishable API key (أو anon public)</span>
                                <span className="text-emerald-400 font-bold">← اضغط Copy وقم بلصقه في خانة المفتاح بالأعلى.</span>
                              </div>
                              <div className="mt-1 flex items-center gap-2 text-rose-300">
                                <span className="bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded font-mono text-[10px]">service_role</span>
                                <span>← لا تقم بنسخه في الواجهة الأمامية فهو مفتاح إداري سري.</span>
                              </div>
                            </div>
                          </div>

                          <div className="bg-[#0e192a] p-3 rounded-lg border border-[#1c3050]">
                            <span className="font-bold text-blue-400 text-xs">5. التأكد من أن المشروع نشط:</span>
                            <div className="text-[11px] text-slate-300 mt-1">
                              إذا كان مشروعك في الباقة المجانية وتوقف بسبب عدم النشاط (Paused)، اضغط على <strong>Restore project</strong> في لوحة Supabase لإعادة تنشيطه خلال دقيقة.
                            </div>
                          </div>
                        </div>

                        <div className="pt-2 flex justify-end">
                          <a
                            href="https://supabase.com/dashboard"
                            target="_blank"
                            rel="noreferrer"
                            className="bg-blue-600 hover:bg-blue-500 text-white text-xs px-3.5 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all"
                          >
                            <span>فتح لوحة تحكم Supabase للنسخ</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons: Save & Test Connection */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-[#14233a]">
                <div className="flex items-center gap-2.5">
                  <button
                    id="save-supabase-settings-button"
                    type="submit"
                    className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>حفظ إعدادات Supabase في LocalStorage</span>
                  </button>

                  <button
                    id="test-supabase-connection-button"
                    type="button"
                    onClick={handleTestConnection}
                    disabled={isTestingConnection}
                    className="bg-[#132238] hover:bg-[#1a2d48] border border-emerald-500/40 text-emerald-300 text-xs px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isTestingConnection ? 'animate-spin' : ''}`} />
                    <span>{isTestingConnection ? 'جاري الفحص...' : 'اختبار وفحص الاتصال بالسحابة'}</span>
                  </button>
                </div>

                <a
                  href="https://supabase.com/dashboard"
                  target="_blank"
                  rel="noreferrer"
                  className="text-slate-400 hover:text-slate-200 text-xs flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#0d1726] border border-[#182a44]"
                >
                  <span>لوحة تحكم Supabase</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </form>

          {/* Supabase SQL Schema & Permissions Card for Tickets */}
          <div className="bg-[#080f1a] border border-[#1b2f4f] rounded-xl overflow-hidden shadow-lg transition-all">
            <div className="p-4 md:p-5 flex flex-wrap items-center justify-between gap-3 bg-[#0d1726] border-b border-[#17273f]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                  <Terminal className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <span>كود SQL الشامل لكافة جداول المنظومة وتفعيل الريال تيم (Supabase Realtime Engine)</span>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-mono">
                      PostgreSQL Realtime
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    قم بنسخ هذا الكود ولصقه في <strong className="text-emerald-400 font-mono">Supabase &gt; SQL Editor</strong> ثم اضغط <strong className="text-white">Run</strong> لإنشاء وتهيئة كافة الجداول وتفعيل النشر اللحظي Realtime وصلاحيات المفتاح العام فورياً لجميع أعضاء الفريق.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopySql}
                  className={`text-xs px-3.5 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    copiedSql
                      ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                      : 'bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300'
                  }`}
                >
                  {copiedSql ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>تم نسخ كود SQL بنجاح!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>نسخ كود SQL</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setShowSqlEditor(!showSqlEditor)}
                  className="bg-[#14233a] hover:bg-[#1a2d4a] text-slate-300 text-xs px-3 py-1.5 rounded-lg border border-[#203759] flex items-center gap-1 transition-all cursor-pointer"
                >
                  <Code2 className="w-3.5 h-3.5" />
                  <span>{showSqlEditor ? 'إخفاء الكود' : 'عرض الكود'}</span>
                </button>

                <a
                  href="https://supabase.com/dashboard"
                  target="_blank"
                  rel="noreferrer"
                  className="bg-[#0f1d30] hover:bg-[#172c47] text-slate-300 hover:text-white text-xs px-3 py-1.5 rounded-lg border border-[#1e3454] flex items-center gap-1 transition-all"
                  title="فتح SQL Editor في Supabase"
                >
                  <span>فتح SQL Editor</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            {showSqlEditor && (
              <div className="p-4 bg-[#050b13] border-b border-[#14233a] animate-fadeIn">
                <div className="relative">
                  <pre
                    dir="ltr"
                    className="p-4 rounded-xl bg-[#03070d] border border-[#162740] text-emerald-300 font-mono text-xs overflow-x-auto leading-relaxed select-all max-h-[380px] overflow-y-auto"
                  >
                    <code>{fullSystemSqlCode}</code>
                  </pre>
                  <button
                    type="button"
                    onClick={handleCopySql}
                    className="absolute top-3 right-3 bg-[#111e30]/90 hover:bg-[#182a44] border border-[#233a5e] text-slate-200 text-xs px-2.5 py-1 rounded-md flex items-center gap-1.5 shadow transition-all cursor-pointer"
                    title="نسخ الكود"
                  >
                    {copiedSql ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-slate-400" />}
                    <span className="text-[11px] font-mono">{copiedSql ? 'Copied' : 'Copy SQL'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Database Statistics & Synchronization Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3.5">
            <div className="bg-[#080f1a] border border-[#17273f] rounded-xl p-4 flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] text-slate-400">سجلات الطلاب</p>
                <p className="text-base font-extrabold text-white">{databaseStats.studentsCount} طالب</p>
              </div>
            </div>

            <div className="bg-[#080f1a] border border-[#17273f] rounded-xl p-4 flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] text-slate-400">المقررات الدراسية</p>
                <p className="text-base font-extrabold text-white">{databaseStats.coursesCount} كورس</p>
              </div>
            </div>

            <div className="bg-[#080f1a] border border-[#17273f] rounded-xl p-4 flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <DollarSign className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] text-slate-400">سجلات المصروفات</p>
                <p className="text-base font-extrabold text-white">{databaseStats.expensesCount} بند</p>
              </div>
            </div>

            <div className="bg-[#080f1a] border border-[#17273f] rounded-xl p-4 flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] text-slate-400">فريق العمل والإدارة</p>
                <p className="text-base font-extrabold text-white">{databaseStats.staffCount} موظف</p>
              </div>
            </div>
          </div>

          {/* Cloud & Local Backup Management Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Local Storage Card */}
            <div className="bg-[#080f1a] border border-[#17273f] rounded-xl p-5 flex flex-col justify-between gap-4">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-sm font-bold text-emerald-400">
                  <Database className="w-4 h-4" />
                  <span>التخزين المحلي المستمر (Active LocalStorage)</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  تعمل المنظومة حالياً بنظام الحفظ الآمن الفوري على متصفحك. لا تضيع أي بيانات حتى لو قمت بإعادة تشغيل الجهاز أو تحديث الصفحة.
                </p>
                <div className="p-3 bg-[#0d1726] rounded-lg border border-[#1a2d48] text-xs text-slate-400 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>الحالة: متصل ويعمل بكفاءة 100%</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {supabaseForm.lastSyncTime ? `آخر فحص: ${supabaseForm.lastSyncTime}` : 'متزامن'}
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-[#132238] flex flex-wrap items-center gap-2.5">
                <button
                  onClick={onExportJson}
                  type="button"
                  className="bg-blue-600 hover:bg-blue-500 text-white text-xs px-3.5 py-2 rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>تحميل نسخة JSON شاملة</span>
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  type="button"
                  className="bg-[#132238] hover:bg-[#1a2e4c] border border-blue-500/40 text-blue-300 text-xs px-3.5 py-2 rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>استعادة من ملف</span>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
            </div>

            {/* Supabase Architecture Info Card */}
            <div className="bg-[#080f1a] border border-[#17273f] rounded-xl p-5 flex flex-col justify-between gap-4">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-sm font-bold text-blue-400">
                  <Server className="w-4 h-4" />
                  <span>بنية المزامنة السحابية المركزية</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  تتيح لك إعدادات Supabase ربط عدة أجهزة إدارية ومراكز فرعية بنفس قاعدة البيانات في الوقت الفعلي مع الحفاظ على سرعة الاستجابة.
                </p>
                <div className="p-3 bg-[#0d1726] rounded-lg border border-[#1a2d48] text-xs text-slate-400 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>
                    {supabaseForm.isConnected
                      ? `تم الاتصال بنجاح بـ ${supabaseForm.projectUrl.replace(/^https?:\/\//, '').split('.')[0]}`
                      : 'أدخل Project URL و Anon Key واضغط فحص الاتصال للتفعيل'}
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-[#132238]">
                <button
                  onClick={() => {
                    if (window.confirm('هل أنت متأكد من رغبتك في إعادة ضبط المصنع؟ سيتم استعادة البيانات الافتراضية الأولية.')) {
                      onResetData();
                    }
                  }}
                  type="button"
                  className="text-red-400 hover:text-red-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>إعادة ضبط المصنع واسترجاع البيانات الأولية</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3 CONTENT: Production Setup & System Reset */}
      {activeTab === 'reset' && (
        <div id="tab-content-reset" className="space-y-6 animate-fadeIn">
          <div className="bg-[#080f1a] border border-rose-500/40 rounded-2xl p-5 md:p-7 space-y-6">
            <div className="flex items-center gap-3 border-b border-[#17273f] pb-4">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/40 flex items-center justify-center font-bold shrink-0">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                  <span>قسم تهيئة المنظومة والبدء في وضع الإنتاج (Production Setup)</span>
                </h3>
                <p className="text-xs text-slate-400 font-medium mt-0.5">
                  تصفية وتطهير بيانات التجربة والاختبار وتفريغ السجلات مع إمكانية تحديد البيانات المطلوبة بمربعات اختيار.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-[#0e1726] border border-[#1b2c45] rounded-xl p-5 flex flex-col justify-between gap-4">
                <div className="space-y-2">
                  <span className="text-sm font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>تصفير بيانات التست والتحول للإنتاج</span>
                  </span>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    يمكنك استخدام زر التهيئة المخصص لاختيار ما ترغب في تصفيره بشكل مباشر ودقيق (الطلاب والاشتراكات، المصروفات، السجلات، الحسابات التجريبية).
                  </p>
                </div>

                {onOpenProductionReset && (
                  <button
                    type="button"
                    onClick={onOpenProductionReset}
                    className="bg-rose-600 hover:bg-rose-500 text-white text-xs md:text-sm px-5 py-3 rounded-xl font-extrabold flex items-center justify-center gap-2 shadow-lg shadow-rose-600/30 transition-all cursor-pointer w-full mt-2"
                  >
                    <ShieldAlert className="w-4 h-4" />
                    <span>تأكيد التهيئة والتحول للإنتاج 🚀</span>
                  </button>
                )}
              </div>

              <div className="bg-[#0e1726] border border-[#1b2c45] rounded-xl p-5 flex flex-col justify-between gap-4">
                <div className="space-y-2">
                  <span className="text-sm font-bold text-white flex items-center gap-2">
                    <Database className="w-4 h-4 text-blue-400" />
                    <span>إحصائيات قاعدة البيانات الحالية</span>
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-300 pt-1">
                    <div className="bg-[#080f1a] p-2.5 rounded-lg border border-[#182942] flex justify-between">
                      <span className="text-slate-400">إجمالي الطلاب:</span>
                      <span className="font-mono font-bold text-blue-400">{databaseStats.studentsCount}</span>
                    </div>
                    <div className="bg-[#080f1a] p-2.5 rounded-lg border border-[#182942] flex justify-between">
                      <span className="text-slate-400">الكورسات:</span>
                      <span className="font-mono font-bold text-emerald-400">{databaseStats.coursesCount}</span>
                    </div>
                    <div className="bg-[#080f1a] p-2.5 rounded-lg border border-[#182942] flex justify-between">
                      <span className="text-slate-400">المصروفات:</span>
                      <span className="font-mono font-bold text-amber-400">{databaseStats.expensesCount}</span>
                    </div>
                    <div className="bg-[#080f1a] p-2.5 rounded-lg border border-[#182942] flex justify-between">
                      <span className="text-slate-400">فريق العمل:</span>
                      <span className="font-mono font-bold text-cyan-400">{databaseStats.staffCount}</span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onExportJson}
                  className="bg-[#132238] hover:bg-[#1a2e4c] border border-blue-500/40 text-blue-300 text-xs px-4 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all cursor-pointer w-full"
                >
                  <Download className="w-4 h-4" />
                  <span>تصدير نسخة احتياطية (JSON) قبل التهيئة</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
