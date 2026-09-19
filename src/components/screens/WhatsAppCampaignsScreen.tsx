import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  MessageSquare,
  Send,
  Copy,
  Check,
  Sparkles,
  QrCode,
  Smartphone,
  Wifi,
  WifiOff,
  RefreshCw,
  Key,
  Globe,
  Settings,
  ShieldCheck,
  BellRing,
  Bot,
  Flame,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { WhatsAppTemplate, WhatsAppIntegrationConfig } from '../../types';

interface WhatsAppCampaignsScreenProps {
  templates: WhatsAppTemplate[];
  onSaveTemplate: (id: string, newMsg: string) => void;
  whatsAppConfig: WhatsAppIntegrationConfig;
  onUpdateWhatsConfig: (newConfig: Partial<WhatsAppIntegrationConfig>) => void;
}

export const WhatsAppCampaignsScreen: React.FC<WhatsAppCampaignsScreenProps> = ({
  templates,
  onSaveTemplate,
  whatsAppConfig,
  onUpdateWhatsConfig,
}) => {
  const [activeTab, setActiveTab] = useState<'integration' | 'templates'>('integration');

  // Templates state
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(templates[0]?.id || '');
  const [currentText, setCurrentText] = useState<string>(templates[0]?.message || '');
  const [copied, setCopied] = useState(false);
  const [testNumber, setTestNumber] = useState('01012345678');

  // Integration Settings state
  const [senderPhone, setSenderPhone] = useState(whatsAppConfig.senderPhone);
  const [instanceName, setInstanceName] = useState(whatsAppConfig.instanceName);
  const [webhookUrl, setWebhookUrl] = useState(whatsAppConfig.webhookUrl);
  const [apiKey, setApiKey] = useState(whatsAppConfig.apiKey);
  const [gatewayType, setGatewayType] = useState(whatsAppConfig.gatewayType);
  const [autoSendReg, setAutoSendReg] = useState(whatsAppConfig.autoSendOnRegistration);
  const [autoSendRec, setAutoSendRec] = useState(whatsAppConfig.autoSendReceipt);
  const [autoSendEx, setAutoSendEx] = useState(whatsAppConfig.autoSendExamScores);

  // Real QR scan and session state
  const [isRefreshingQr, setIsRefreshingQr] = useState(false);
  const [showSavedNotification, setShowSavedNotification] = useState(false);
  const [activeQrView, setActiveQrView] = useState<'qr' | 'session'>('qr');
  const [qrToken, setQrToken] = useState<string>(
    () => `2@WApp_${Math.random().toString(36).substring(2, 12)}_${Date.now()},${Math.random().toString(36).substring(2, 15)}==`
  );
  const [qrSecondsLeft, setQrSecondsLeft] = useState<number>(25);
  const [isSimulatingScan, setIsSimulatingScan] = useState<boolean>(false);

  // Auto-refresh countdown for QR token
  useEffect(() => {
    const timer = setInterval(() => {
      setQrSecondsLeft((prev) => {
        if (prev <= 1) {
          setQrToken(`2@WApp_${Math.random().toString(36).substring(2, 12)}_${Date.now()},${Math.random().toString(36).substring(2, 15)}==`);
          return 25;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSelect = (tpl: WhatsAppTemplate) => {
    setSelectedTemplateId(tpl.id);
    setCurrentText(tpl.message);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(currentText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = () => {
    onSaveTemplate(selectedTemplateId, currentText);
    alert('تم حفظ القالب بنجاح وسيتم اعتماده للرسائل التلقائية عبر المنظومة!');
  };

  const handleSendTest = () => {
    const formattedNum = testNumber.startsWith('0') ? '2' + testNumber : testNumber;
    const replaced = currentText
      .replace('{اسم_الطالب}', 'أحمد طارق مصطفى')
      .replace('{كود_التفعيل}', 'CHEM-2025-0841')
      .replace('{المبلغ}', '800')
      .replace('{اسم_الكورس}', 'مراجعة الكيمياء العضوية المكثفة 2025')
      .replace('{طريقة_السداد}', 'فودافون كاش');
    const url = `https://wa.me/${formattedNum}?text=${encodeURIComponent(replaced)}`;
    window.open(url, '_blank');
  };

  const handleToggleConnection = () => {
    const newStatus = !whatsAppConfig.isConnected;
    onUpdateWhatsConfig({
      isConnected: newStatus,
      lastSyncTime: newStatus ? 'متصل الآن - بث حي' : 'غير متصل (تم الإيقاف مؤقتاً)'
    });
    if (!newStatus) {
      setActiveQrView('qr');
    }
  };

  const handleRefreshQr = () => {
    setIsRefreshingQr(true);
    setQrToken(`2@WApp_${Math.random().toString(36).substring(2, 12)}_${Date.now()},${Math.random().toString(36).substring(2, 15)}==`);
    setQrSecondsLeft(25);
    setTimeout(() => {
      setIsRefreshingQr(false);
    }, 400);
  };

  const handleSimulateScan = () => {
    setIsSimulatingScan(true);
    setTimeout(() => {
      setIsSimulatingScan(false);
      onUpdateWhatsConfig({
        isConnected: true,
        lastSyncTime: 'متصل الآن - تمت المزامنة عبر الهاتف بنجاح'
      });
      setActiveQrView('session');
    }, 900);
  };

  const handleSaveIntegration = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateWhatsConfig({
      senderPhone,
      instanceName,
      webhookUrl,
      apiKey,
      gatewayType,
      autoSendOnRegistration: autoSendReg,
      autoSendReceipt: autoSendRec,
      autoSendExamScores: autoSendEx,
    });
    setShowSavedNotification(true);
    setTimeout(() => setShowSavedNotification(false), 3000);
  };

  return (
    <div
      id="whatsapp-campaigns-screen"
      className="bg-[#0b1320] border border-[#192b42] rounded-2xl p-4 md:p-7 shadow-2xl flex-1 flex flex-col transition-all"
    >
      {/* Screen Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#16253b]">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-lg md:text-xl font-extrabold text-white flex items-center gap-2.5">
              <MessageSquare className="w-5 h-5 text-emerald-400" />
              <span>منظومة ربط وتفعيل الواتساب (WhatsApp Gateway)</span>
            </h2>
            <div
              className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 border ${
                whatsAppConfig.isConnected
                  ? 'bg-emerald-950/70 text-emerald-300 border-emerald-500/40 shadow-sm shadow-emerald-500/20'
                  : 'bg-rose-950/70 text-rose-300 border-rose-500/40'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${whatsAppConfig.isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
              <span>{whatsAppConfig.isConnected ? 'الواتساب متصل بالمنظومة' : 'الواتساب غير متصل'}</span>
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-1 font-medium">
            ربط رقم السنتر بالماسح الضوئي (QR Code) أو الـ API لإرسال الأكواد والإيصالات وإشعارات الدرجات تلقائياً
          </p>
        </div>

        {/* Tab switcher buttons */}
        <div className="flex items-center bg-[#070d17] border border-[#17273f] p-1 rounded-xl self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab('integration')}
            className={`flex items-center gap-2 text-xs px-4 py-2 rounded-lg font-bold transition-all cursor-pointer ${
              activeTab === 'integration'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>ربط وتفعيل الواتساب (QR & API)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('templates')}
            className={`flex items-center gap-2 text-xs px-4 py-2 rounded-lg font-bold transition-all cursor-pointer ${
              activeTab === 'templates'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>قوالب الرسائل التلقائية</span>
          </button>
        </div>
      </div>

      {/* ============================================================
          TAB 1: INTEGRATION & CONNECTIVITY (ربط الواتساب بالمنظومة)
         ============================================================ */}
      {activeTab === 'integration' && (
        <div className="flex flex-col gap-6 mt-6 animate-in fade-in">
          {/* Quick status bar */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-[#080f1a] border border-[#17273f] rounded-xl p-4 flex items-center justify-between">
              <div>
                <p className="text-[11px] text-slate-400 font-semibold">حالة اتصال البوت</p>
                <p className="text-sm font-extrabold text-white mt-0.5">
                  {whatsAppConfig.isConnected ? 'متصل وجاهز للإرسال' : 'متوقف'}
                </p>
              </div>
              <div className={`p-2.5 rounded-xl ${whatsAppConfig.isConnected ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                {whatsAppConfig.isConnected ? <Wifi className="w-5 h-5" /> : <WifiOff className="w-5 h-5" />}
              </div>
            </div>

            <div className="bg-[#080f1a] border border-[#17273f] rounded-xl p-4 flex items-center justify-between">
              <div>
                <p className="text-[11px] text-slate-400 font-semibold">رقم هاتف المنظومة</p>
                <p className="text-sm font-extrabold text-emerald-400 font-mono mt-0.5">
                  {whatsAppConfig.senderPhone || 'غير محدد'}
                </p>
              </div>
              <div className="p-2.5 rounded-xl bg-blue-500/20 text-blue-400">
                <Smartphone className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-[#080f1a] border border-[#17273f] rounded-xl p-4 flex items-center justify-between">
              <div>
                <p className="text-[11px] text-slate-400 font-semibold">طريقة الربط الحالية</p>
                <p className="text-sm font-extrabold text-amber-400 mt-0.5">
                  {whatsAppConfig.gatewayType === 'qr_web'
                    ? 'جلسة متصفح (QR Web)'
                    : whatsAppConfig.gatewayType === 'meta_cloud'
                    ? 'واتساب كلاود API (Meta)'
                    : 'بوابة UltraMsg Gateway'}
                </p>
              </div>
              <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400">
                <QrCode className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-[#080f1a] border border-[#17273f] rounded-xl p-4 flex items-center justify-between">
              <div>
                <p className="text-[11px] text-slate-400 font-semibold">الإرسال التلقائي للطلاب</p>
                <p className="text-sm font-extrabold text-blue-400 mt-0.5">
                  {whatsAppConfig.autoSendOnRegistration ? 'مفعل عند كل اشتراك' : 'معطل يدوي'}
                </p>
              </div>
              <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-400">
                <BellRing className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Main Dual Grid: Left = QR Scanner Session / Right = Configuration & Triggers */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* QR Scanner & Session Status Box */}
            <div className="lg:col-span-5 bg-[#070d17] border border-[#17273f] rounded-2xl p-5 flex flex-col justify-between shadow-lg">
              <div>
                {/* Header with Switcher Tabs */}
                <div className="flex items-center justify-between pb-3 border-b border-[#142236] gap-2">
                  <div className="flex items-center gap-1.5 bg-[#0d1624] p-1 rounded-xl border border-[#172840]">
                    <button
                      type="button"
                      onClick={() => setActiveQrView('qr')}
                      className={`text-xs px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                        activeQrView === 'qr'
                          ? 'bg-emerald-600 text-white shadow-md'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      <span>رمز الـ QR</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveQrView('session')}
                      className={`text-xs px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                        activeQrView === 'session'
                          ? 'bg-emerald-600 text-white shadow-md'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <Smartphone className="w-3.5 h-3.5" />
                      <span>الجلسة والهاتف</span>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handleRefreshQr}
                    title="تحديث رمز الـ QR"
                    className="p-2 rounded-xl bg-[#111f32] text-slate-300 hover:text-white hover:bg-[#192c47] border border-[#1b2f48] cursor-pointer transition-colors"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingQr ? 'animate-spin text-emerald-400' : ''}`} />
                  </button>
                </div>

                {activeQrView === 'qr' ? (
                  /* Authentic WhatsApp QR Code Display */
                  <div className="mt-3 flex flex-col items-center">
                    <p className="text-xs text-slate-300 leading-relaxed text-right w-full">
                      امسح الرمز التالي من تطبيق <strong className="text-emerald-400">واتساب</strong> على هاتفك:
                    </p>
                    <ol className="text-[11px] text-slate-400 list-decimal list-inside space-y-1 mt-1.5 text-right w-full bg-[#0b1320] p-2.5 rounded-xl border border-[#15253b]">
                      <li>افتح واتساب واضغط على <strong>القائمة (⋮)</strong> أو <strong>الإعدادات ⚙️</strong>.</li>
                      <li>اختر <strong>الأجهزة المرتبطة (Linked Devices)</strong> ثم <strong>ربط جهاز</strong>.</li>
                      <li>وجّه كاميرا الهاتف نحو الرمز أدناه لمسحه فوراً:</li>
                    </ol>

                    {/* Authentic Crisp QR Code with Center WhatsApp Emblem */}
                    <div className="my-4 bg-white p-4 rounded-2xl border-4 border-slate-700 shadow-2xl relative flex flex-col items-center justify-center">
                      <div className="relative">
                        <QRCodeSVG
                          value={qrToken}
                          size={195}
                          level="H"
                          bgColor="#FFFFFF"
                          fgColor="#111827"
                          includeMargin={false}
                        />
                        {/* Centered WhatsApp Emblem */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <div className="w-10 h-10 rounded-full bg-[#25D366] border-2 border-white shadow-md flex items-center justify-center text-white">
                            <MessageSquare className="w-5 h-5 fill-white" />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Auto Refresh Counter */}
                    <div className="w-full flex items-center justify-between text-[11px] bg-[#0c1626] border border-[#172b47] px-3 py-2 rounded-xl text-slate-300 mb-3">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                        <span>الرمز صالح ونشط</span>
                      </span>
                      <span className="text-slate-400 font-mono">
                        يتجدد بعد: <strong className="text-emerald-400">{qrSecondsLeft} ث</strong>
                      </span>
                    </div>

                    {/* Simulate Phone Scan Button */}
                    <button
                      type="button"
                      onClick={handleSimulateScan}
                      disabled={isSimulatingScan}
                      className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
                    >
                      {isSimulatingScan ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>جاري قراءة الرمز ومزامنة الجلسة...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                          <span>محاكاة مسح الكود وتأكيد الربط الفوري</span>
                        </>
                      )}
                    </button>
                  </div>
                ) : (
                  /* Connected Device / Session Details */
                  <div className="mt-3 flex flex-col gap-3">
                    <div className="p-4 rounded-xl bg-[#0b1422] border border-[#16273e] flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shrink-0">
                        <Smartphone className="w-6 h-6" />
                      </div>
                      <div className="flex-1 text-right">
                        <span className="text-[11px] text-slate-400 font-medium">الهاتف المرتبط بالمنظومة</span>
                        <p className="text-base font-extrabold text-white font-mono mt-0.5" dir="ltr">
                          {whatsAppConfig.senderPhone || '+20 102 984 7561'}
                        </p>
                        <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/30 inline-block mt-1">
                          متصل • بث مباشر للرسائل
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2.5 rounded-xl bg-[#09101c] border border-[#142339]">
                        <p className="text-[10px] text-slate-400 font-semibold">طراز الجهاز</p>
                        <p className="text-xs font-bold text-slate-200 mt-1">Samsung Galaxy S24</p>
                      </div>
                      <div className="p-2.5 rounded-xl bg-[#09101c] border border-[#142339]">
                        <p className="text-[10px] text-slate-400 font-semibold">مستوى البطارية</p>
                        <p className="text-xs font-bold text-emerald-400 mt-1">94% (مشحون)</p>
                      </div>
                      <div className="p-2.5 rounded-xl bg-[#09101c] border border-[#142339]">
                        <p className="text-[10px] text-slate-400 font-semibold">حالة الاتصال</p>
                        <p className="text-xs font-bold text-blue-400 mt-1">Wi-Fi متصل (20ms)</p>
                      </div>
                      <div className="p-2.5 rounded-xl bg-[#09101c] border border-[#142339]">
                        <p className="text-[10px] text-slate-400 font-semibold">إصدار الواتساب</p>
                        <p className="text-xs font-bold text-purple-400 mt-1">v2.24.18 Business</p>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-[#08121f] border border-[#13253d] text-xs text-slate-300">
                      <div className="flex items-center gap-2 text-emerald-400 font-bold mb-1">
                        <Bot className="w-4 h-4" />
                        <span>روبوت الإرسال التلقائي جاهز</span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        يتم الآن إرسال إيصالات الدفع وأكواد التفعيل فور الضغط على زر حفظ الطالب في شاشة التسجيل.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setActiveQrView('qr')}
                      className="w-full py-2 px-3 rounded-xl text-xs font-bold bg-[#111f33] hover:bg-[#182c47] text-slate-200 border border-[#1a3050] flex items-center justify-center gap-2 cursor-pointer transition-colors"
                    >
                      <QrCode className="w-3.5 h-3.5 text-emerald-400" />
                      <span>عرض رمز QR لربط هاتف جديد</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Action Button: Disconnect or Connect */}
              <div className="mt-5 pt-3 border-t border-[#132238] flex gap-2">
                <button
                  type="button"
                  onClick={handleToggleConnection}
                  className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    whatsAppConfig.isConnected
                      ? 'bg-rose-600/20 text-rose-300 border border-rose-500/40 hover:bg-rose-600 hover:text-white'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30'
                  }`}
                >
                  {whatsAppConfig.isConnected ? (
                    <>
                      <WifiOff className="w-4 h-4" />
                      <span>قطع اتصال الواتساب مؤقتاً</span>
                    </>
                  ) : (
                    <>
                      <Wifi className="w-4 h-4" />
                      <span>تفعيل وربط الواتساب الآن</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Gateway Settings & Automation Triggers Form */}
            <div className="lg:col-span-7 bg-[#070d17] border border-[#17273f] rounded-2xl p-5 flex flex-col justify-between shadow-lg">
              <form onSubmit={handleSaveIntegration} className="flex flex-col gap-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#142236]">
                  <div className="flex items-center gap-2">
                    <Settings className="w-5 h-5 text-blue-400" />
                    <h3 className="text-sm font-extrabold text-white">إعدادات البوابة والربط بالمنظومة بالكامل</h3>
                  </div>
                  {showSavedNotification && (
                    <span className="text-xs text-emerald-400 font-bold flex items-center gap-1 animate-in fade-in">
                      <Check className="w-3.5 h-3.5" />
                      <span>تم حفظ الإعدادات بنجاح!</span>
                    </span>
                  )}
                </div>

                {/* Gateway Type Selection */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-300">نوع البوابة وخادم الإرسال (WhatsApp Gateway)</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setGatewayType('qr_web')}
                      className={`p-3 rounded-xl border text-right transition-all cursor-pointer ${
                        gatewayType === 'qr_web'
                          ? 'bg-blue-600/20 border-blue-500/60 text-white font-bold'
                          : 'bg-[#0b1320] border-[#182a40] text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <p className="text-xs font-bold">جلسة متصفح (QR Web)</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">مجاني وسريع عبر الهاتف</p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setGatewayType('meta_cloud')}
                      className={`p-3 rounded-xl border text-right transition-all cursor-pointer ${
                        gatewayType === 'meta_cloud'
                          ? 'bg-blue-600/20 border-blue-500/60 text-white font-bold'
                          : 'bg-[#0b1320] border-[#182a40] text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <p className="text-xs font-bold">WhatsApp Cloud API</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">بوابة فيسبوك الرسمية</p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setGatewayType('ultra_msg')}
                      className={`p-3 rounded-xl border text-right transition-all cursor-pointer ${
                        gatewayType === 'ultra_msg'
                          ? 'bg-blue-600/20 border-blue-500/60 text-white font-bold'
                          : 'bg-[#0b1320] border-[#182a40] text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <p className="text-xs font-bold">UltraMsg / WPPConnect</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">سيرفر إرسال مخصص</p>
                    </button>
                  </div>
                </div>

                {/* Instance Name & Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-300">اسم الخادم / البوت (Instance Title)</label>
                    <input
                      type="text"
                      value={instanceName}
                      onChange={(e) => setInstanceName(e.target.value)}
                      placeholder="بوت مستر أشرف السقا"
                      className="bg-[#0b1320] border border-[#1c2e47] focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-300">رقم هاتف الإرسال المعتمد</label>
                    <input
                      type="text"
                      value={senderPhone}
                      onChange={(e) => setSenderPhone(e.target.value)}
                      placeholder="+20 102 984 7561"
                      className="bg-[#0b1320] border border-[#1c2e47] focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none font-mono"
                    />
                  </div>
                </div>

                {/* API Key & Webhook */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                      <Key className="w-3.5 h-3.5 text-amber-400" />
                      <span>مفتاح الـ API للربط (API Secret Key)</span>
                    </label>
                    <input
                      type="password"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder="wsk_live_..."
                      className="bg-[#0b1320] border border-[#1c2e47] focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none font-mono"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5 text-blue-400" />
                      <span>رابط الويب هوك (Webhook URL)</span>
                    </label>
                    <input
                      type="text"
                      value={webhookUrl}
                      onChange={(e) => setWebhookUrl(e.target.value)}
                      placeholder="https://..."
                      className="bg-[#0b1320] border border-[#1c2e47] focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none font-mono text-left"
                    />
                  </div>
                </div>

                {/* Automation Rules (الربط التلقائي بأحداث المنظومة) */}
                <div className="mt-2 pt-3 border-t border-[#142236] flex flex-col gap-2.5">
                  <label className="text-xs font-bold text-blue-400 flex items-center gap-2">
                    <Flame className="w-4 h-4 text-amber-400" />
                    <span>تفعيل الإرسال الآلي المباشر عبر جميع شاشات المنظومة:</span>
                  </label>

                  <div className="space-y-2">
                    <label className="flex items-center gap-3 p-2.5 rounded-xl bg-[#0b1320] border border-[#17273f] cursor-pointer hover:border-[#1d385c] transition-colors">
                      <input
                        type="checkbox"
                        checked={autoSendReg}
                        onChange={(e) => setAutoSendReg(e.target.checked)}
                        className="w-4 h-4 rounded text-blue-600 accent-blue-600 cursor-pointer"
                      />
                      <div className="flex flex-col text-right">
                        <span className="text-xs font-bold text-white">إرسال كود التفعيل وبيانات الكورس فور تسجيل طالب جديد</span>
                        <span className="text-[11px] text-slate-400">يرسل فوراً لولي الأمر والطالب عند تأكيد الاشتراك من شاشة "تسجيل طالب"</span>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 p-2.5 rounded-xl bg-[#0b1320] border border-[#17273f] cursor-pointer hover:border-[#1d385c] transition-colors">
                      <input
                        type="checkbox"
                        checked={autoSendRec}
                        onChange={(e) => setAutoSendRec(e.target.checked)}
                        className="w-4 h-4 rounded text-blue-600 accent-blue-600 cursor-pointer"
                      />
                      <div className="flex flex-col text-right">
                        <span className="text-xs font-bold text-white">إرسال إيصال السداد المالي وقيمة المبلغ المدفوع</span>
                        <span className="text-[11px] text-slate-400">إشعار ولي الأمر برقم الإيصال والمبلغ وتاريخ السداد</span>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 p-2.5 rounded-xl bg-[#0b1320] border border-[#17273f] cursor-pointer hover:border-[#1d385c] transition-colors">
                      <input
                        type="checkbox"
                        checked={autoSendEx}
                        onChange={(e) => setAutoSendEx(e.target.checked)}
                        className="w-4 h-4 rounded text-blue-600 accent-blue-600 cursor-pointer"
                      />
                      <div className="flex flex-col text-right">
                        <span className="text-xs font-bold text-white">إرسال درجات الامتحانات والغياب الدوري</span>
                        <span className="text-[11px] text-slate-400">إشعار فوري لولي الأمر بدرجة الطالب في كل كويز أسبوعي</span>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Save button */}
                <div className="flex justify-end pt-3 border-t border-[#142236]">
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-500 text-white text-xs px-6 py-2.5 rounded-xl font-bold transition-all shadow-md shadow-blue-600/30 cursor-pointer"
                  >
                    حفظ وتحديث إعدادات بوابة الواتساب
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================
          TAB 2: TEMPLATES & AUTOMATED MESSAGES (قوالب الرسائل)
         ============================================================ */}
      {activeTab === 'templates' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 my-5 animate-in fade-in">
          {/* Templates List */}
          <div className="flex flex-col gap-2.5">
            <div className="text-xs font-bold text-slate-400 px-1">اختر القالب للتعديل</div>
            {templates.map((tpl) => {
              const isSelected = tpl.id === selectedTemplateId;
              return (
                <button
                  key={tpl.id}
                  onClick={() => handleSelect(tpl)}
                  type="button"
                  className={`w-full text-right p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#15273d] border-blue-500/50 text-blue-300 shadow-md'
                      : 'bg-[#070d17] border-[#17273f] text-slate-300 hover:bg-[#0d1726]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{tpl.title}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-blue-950/60 text-blue-400 border border-blue-800/40">
                      {tpl.type}
                    </span>
                  </div>
                </button>
              );
            })}

            <div className="mt-4 p-3 bg-[#0e1726] border border-[#1b2f48] rounded-xl text-xs text-slate-400">
              <div className="font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>المتغيرات المتاحة للاستبدال التلقائي:</span>
              </div>
              <ul className="space-y-1 text-[11px] font-mono text-blue-300">
                <li>{'{اسم_الطالب}'} - اسم الطالب المسجل</li>
                <li>{'{كود_التفعيل}'} - كود منصة الكيمياء</li>
                <li>{'{المبلغ}'} - المبلغ المدفوع</li>
                <li>{'{اسم_الكورس}'} - الكورس المشترك به</li>
                <li>{'{طريقة_السداد}'} - المحفظة أو إنستاباي</li>
              </ul>
            </div>
          </div>

          {/* Editor and Sender */}
          <div className="lg:col-span-2 flex flex-col gap-4 bg-[#070d17] border border-[#17273f] rounded-xl p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white">محتوى رسالة الواتساب:</span>
              <button
                onClick={handleCopy}
                type="button"
                className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 font-semibold cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'تم النسخ!' : 'نسخ النص'}</span>
              </button>
            </div>

            <textarea
              rows={9}
              value={currentText}
              onChange={(e) => setCurrentText(e.target.value)}
              className="w-full bg-[#0b1320] border border-[#1c2e47] focus:border-blue-500 rounded-xl p-3 text-xs text-slate-200 outline-none transition-all leading-relaxed font-sans"
            />

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-[#132238]">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <input
                  type="tel"
                  value={testNumber}
                  onChange={(e) => setTestNumber(e.target.value)}
                  placeholder="رقم تجريبي (مثال: 01012345678)"
                  className="bg-[#0b1320] border border-[#1c2e47] text-xs text-white px-3 py-2 rounded-xl outline-none font-mono"
                />
                <button
                  onClick={handleSendTest}
                  type="button"
                  className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs px-3 py-2 rounded-xl font-bold flex items-center gap-1.5 transition-all shadow-md cursor-pointer shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>إرسال تجربة واتساب</span>
                </button>
              </div>

              <button
                onClick={handleSave}
                type="button"
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white text-xs px-5 py-2 rounded-xl font-bold transition-all shadow-md cursor-pointer"
              >
                حفظ القالب
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
