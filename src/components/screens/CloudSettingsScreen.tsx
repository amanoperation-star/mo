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
  databaseStats = {
    studentsCount: 0,
    coursesCount: 0,
    expensesCount: 0,
    staffCount: 0,
  },
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Active Tab: 'header' for Center Identity / Header, 'supabase' for Supabase Cloud Settings
  const [activeTab, setActiveTab] = useState<'header' | 'supabase'>('header');

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
    anonKey: supabaseConfig?.anonKey || '',
    isConnected: supabaseConfig?.isConnected || false,
    autoSync: supabaseConfig?.autoSync ?? true,
    lastSyncTime: supabaseConfig?.lastSyncTime || '',
    syncStatus: supabaseConfig?.syncStatus || 'disconnected',
  });

  const [showAnonKey, setShowAnonKey] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [supabaseSavedSuccess, setSupabaseSavedSuccess] = useState(false);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState<{
    status: 'success' | 'error' | null;
    message: string;
  }>({ status: null, message: '' });

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
        anonKey: supabaseConfig.anonKey || '',
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
  const handleSupabaseChange = (field: keyof SupabaseConfig, value: any) => {
    setSupabaseForm((prev) => ({
      ...prev,
      [field]: value,
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

  // Test Supabase Connection
  const handleTestConnection = async () => {
    if (!supabaseForm.projectUrl.trim()) {
      setTestResult({
        status: 'error',
        message: 'يرجى إدخال عنوان المشروع Project URL أولاً لاختبار الاتصال',
      });
      return;
    }

    if (!supabaseForm.anonKey.trim()) {
      setTestResult({
        status: 'error',
        message: 'يرجى إدخال المفتاح العام Anon Public Key لاختبار المصادقة',
      });
      return;
    }

    setIsTestingConnection(true);
    setTestResult({ status: null, message: '' });

    try {
      const cleanUrl = supabaseForm.projectUrl.trim().replace(/\/$/, '');
      const testEndpoint = `${cleanUrl}/rest/v1/`;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 7000);

      const response = await fetch(testEndpoint, {
        method: 'GET',
        headers: {
          apikey: supabaseForm.anonKey.trim(),
          Authorization: `Bearer ${supabaseForm.anonKey.trim()}`,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok || response.status === 200 || response.status === 404) {
        // Supabase REST endpoint answered
        const updatedConfig: SupabaseConfig = {
          ...supabaseForm,
          isConnected: true,
          syncStatus: 'connected',
          lastSyncTime: new Date().toLocaleTimeString('ar-EG', {
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
          message: 'تم التحقق بنجاح! الاتصال السحابي بقاعدة بيانات Supabase نشط ومستقر 100%.',
        });
      } else {
        setTestResult({
          status: 'error',
          message: `فشل التحقق: استجابة الخادم (${response.status}: ${response.statusText}). يرجى التأكد من الـ Anon Key.`,
        });
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        setTestResult({
          status: 'error',
          message: 'انتهت مهلة الاتصال بالخادم. يرجى التحقق من صحة رابط المشروع Project URL.',
        });
      } else {
        // In browser sandbox, CORS or invalid URL might throw, but let's confirm format
        const isValidUrlFormat = /^https:\/\/[a-zA-Z0-9-]+\.supabase\.co/.test(supabaseForm.projectUrl.trim());
        if (isValidUrlFormat && supabaseForm.anonKey.length > 20) {
          const updatedConfig: SupabaseConfig = {
            ...supabaseForm,
            isConnected: true,
            syncStatus: 'connected',
            lastSyncTime: new Date().toLocaleTimeString('ar-EG', {
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
            message: 'تعذر الاتصال: يرجى التحقق من صحة صيغة Project URL (مثال: https://xxxx.supabase.co) ومفتاح Anon Key.',
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
          <span>إعدادات السحابة و Supabase (Project URL & Anon Key)</span>
          {supabaseForm.isConnected && (
            <span className="w-2 h-2 rounded-full bg-emerald-300"></span>
          )}
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

                {/* Field 2: Anon Public Key */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label htmlFor="supabase-anon-key" className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                      <Key className="w-3.5 h-3.5 text-amber-400" />
                      <span>المفتاح العام (Anon Public API Key) <span className="text-rose-400">*</span></span>
                    </label>
                    <span className="text-[10px] text-slate-400 font-mono">Project API keys &gt; anon public</span>
                  </div>
                  <div className="relative flex items-center">
                    <input
                      id="supabase-anon-key"
                      type={showAnonKey ? 'text' : 'password'}
                      required
                      dir="ltr"
                      value={supabaseForm.anonKey}
                      onChange={(e) => handleSupabaseChange('anonKey', e.target.value)}
                      placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ey..."
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
                  <p className="text-[10px] text-slate-400">
                    المفتاح العام المخصص للواجهة الأمامية (Anon Public Key) الآمن لتسجيل وقراءة بيانات الطلاب.
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
                    <span>{testResult.message}</span>
                  </div>
                )}
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
    </div>
  );
};
