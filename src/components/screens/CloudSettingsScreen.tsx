import React, { useRef } from 'react';
import { Settings, Cloud, Database, Download, Upload, RotateCcw, CheckCircle2, Shield } from 'lucide-react';

interface CloudSettingsScreenProps {
  onExportJson: () => void;
  onResetData: () => void;
  onImportJson: (jsonData: any) => void;
}

export const CloudSettingsScreen: React.FC<CloudSettingsScreenProps> = ({
  onExportJson,
  onResetData,
  onImportJson,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      className="bg-[#0b1320] border border-[#192b42] rounded-2xl p-4 md:p-7 shadow-2xl flex-1 flex flex-col transition-all"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#16253b]">
        <div>
          <h2 className="text-lg md:text-xl font-extrabold text-white flex items-center gap-2.5">
            <Cloud className="w-5 h-5 text-blue-400" />
            <span>إعدادات السحابة Supabase ومزامنة التخزين المحلي</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1 font-medium">
            حفظ البيانات محلياً مع إمكانية الربط السحابي والنسخ الاحتياطي الفوري
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 my-5">
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
            <div className="p-3 bg-[#0d1726] rounded-lg border border-[#1a2d48] text-xs text-slate-400 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>الحالة: متصل ويعمل بكفاءة 100%</span>
            </div>
          </div>

          <div className="pt-3 border-t border-[#132238] flex items-center gap-2.5">
            <button
              onClick={onExportJson}
              type="button"
              className="bg-blue-600 hover:bg-blue-500 text-white text-xs px-3.5 py-2 rounded-xl font-bold flex items-center gap-1.5 transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>تحميل نسخة JSON شاملة</span>
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              type="button"
              className="bg-[#132238] hover:bg-[#1a2e4c] border border-blue-500/40 text-blue-300 text-xs px-3.5 py-2 rounded-xl font-bold flex items-center gap-1.5 transition-all"
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

        {/* Supabase Cloud Sync Card */}
        <div className="bg-[#080f1a] border border-[#17273f] rounded-xl p-5 flex flex-col justify-between gap-4">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-sm font-bold text-blue-400">
              <Cloud className="w-4 h-4" />
              <span>الربط السحابي Supabase API</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              إمكانية المزامنة اللحظية مع قاعدة بيانات سحابية مركزية تتيح لعدة أجهزة إدارية العمل سوياً بنفس الوقت.
            </p>
            <div className="p-3 bg-[#0d1726] rounded-lg border border-[#1a2d48] text-xs text-slate-400 flex items-center gap-2">
              <Shield className="w-4 h-4 text-blue-400 shrink-0" />
              <span>جاهز للربط الفوري مع Supabase عبر مفاتيح API</span>
            </div>
          </div>

          <div className="pt-3 border-t border-[#132238]">
            <button
              onClick={() => {
                if (window.confirm('هل أنت متأكد من رغبتك في إعادة تعيين البيانات إلى الحالة الافتراضية؟')) {
                  onResetData();
                }
              }}
              type="button"
              className="text-red-400 hover:text-red-300 text-xs font-bold flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>إعادة ضبط المصنع واسترجاع البيانات الأولية</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
