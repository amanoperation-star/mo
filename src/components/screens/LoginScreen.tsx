import React, { useState } from 'react';
import { Lock, User, KeyRound, Eye, EyeOff, LogIn, ShieldCheck, Sparkles, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { StaffMember, CenterSettings } from '../../types';

interface LoginScreenProps {
  staffList: StaffMember[];
  centerSettings: CenterSettings;
  onLogin: (user: StaffMember) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  staffList,
  centerSettings,
  onLogin,
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const trimmedUser = username.trim().toLowerCase();
    const trimmedPass = password.trim();

    if (!trimmedUser || !trimmedPass) {
      setErrorMsg('يرجى إدخال اسم المستخدم وكلمة المرور كامليْن.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      // Find matching staff member
      const matched = staffList.find((member) => {
        const u = (member.username || '').trim().toLowerCase();
        const p = (member.password || '').trim();
        const phone = (member.phone || '').trim();
        
        // Match username OR phone number + password
        return (u === trimmedUser || phone === trimmedUser) && p === trimmedPass;
      });

      if (matched) {
        onLogin(matched);
      } else {
        // Also check default fallback admin if no username is set
        if (trimmedUser === 'admin' && trimmedPass === '123') {
          const fallbackAdmin: StaffMember = {
            id: 'st-admin',
            name: centerSettings.managerName || 'أك. محمود عزت',
            role: 'المدير الإداري والمالي',
            phone: centerSettings.phoneNumber || '01009988776',
            baseSalary: 5000,
            bonus: 0,
            status: 'مدفوع',
            permissions: ['التحكم الكامل', 'البيانات المالية', 'تأكيد الإيصالات', 'إدارة الكورسات'],
            username: 'admin',
            password: '123',
          };
          onLogin(fallbackAdmin);
        } else {
          setErrorMsg('اسم المستخدم أو كلمة المرور غير صحيحة. يرجى المحاولة مرة أخرى.');
          setIsLoading(false);
        }
      }
    }, 400);
  };

  const handleQuickFill = (member: StaffMember) => {
    setUsername(member.username || member.phone || 'admin');
    setPassword(member.password || '123');
    setErrorMsg(null);
  };

  return (
    <div className="min-h-screen w-full bg-[#070d17] text-white flex items-center justify-center p-4 relative overflow-hidden dir-rtl">
      {/* Background Decorative Glow Circles */}
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10 flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-300">
        {/* Header Branding */}
        <div className="text-center flex flex-col items-center gap-3">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 via-blue-500 to-cyan-400 flex items-center justify-center shadow-2xl shadow-blue-600/40 ring-1 ring-blue-400/40">
            <Send className="w-8 h-8 text-white -rotate-45 translate-x-0.5 -translate-y-0.5" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-wide">
              {centerSettings.centerName || 'منظومة مستر أشرف السقا'}
            </h1>
            <p className="text-xs text-slate-400 font-semibold mt-1 flex items-center justify-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>نظام تسجيل الدخول وإدارة الصلاحيات للموظفين</span>
            </p>
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-[#0b1320] border border-[#1b2f48] rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col gap-5 backdrop-blur-md">
          <div className="flex items-center justify-between pb-3 border-b border-[#16253b]">
            <div className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-blue-400" />
              <h2 className="text-base font-extrabold text-white">تسجيل الدخول إلى حسابك</h2>
            </div>
            <span className="text-[11px] font-bold bg-blue-950/80 text-blue-300 border border-blue-800/50 px-2.5 py-0.5 rounded-full">
              حساب موظف
            </span>
          </div>

          {/* Error Message Alert */}
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-950/80 border border-rose-500/50 text-rose-200 text-xs font-bold flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Username Field */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                <span>اسم المستخدم أو رقم الهاتف *</span>
              </label>
              <div className="relative flex items-center">
                <div className="absolute right-3.5 text-slate-400 pointer-events-none">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="مثال: admin أو sara"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-[#070d17] border border-[#1c2e47] focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl pr-10 pl-3.5 py-3 text-xs text-white placeholder-slate-500 outline-none transition-all font-mono"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                <span>كلمة المرور *</span>
              </label>
              <div className="relative flex items-center">
                <div className="absolute right-3.5 text-slate-400 pointer-events-none">
                  <KeyRound className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#070d17] border border-[#1c2e47] focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl pr-10 pl-10 py-3 text-xs text-white placeholder-slate-500 outline-none transition-all font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 text-slate-400 hover:text-slate-200 transition-colors p-1"
                  title={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="mt-2 w-full bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 text-xs sm:text-sm"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>جاري التحقق من البيانات...</span>
                </div>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>تسجيل الدخول إلى المنظومة</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Fill Accounts Box */}
          <div className="pt-4 border-t border-[#16253b] flex flex-col gap-2.5">
            <span className="text-[11px] font-bold text-slate-400 flex items-center justify-between">
              <span>الحسابات التجريبية للتجربة السريعة:</span>
              <span className="text-blue-400 text-[10px]">انقر للتعبئة والتسجيل المباشر</span>
            </span>

            <div className="grid grid-cols-1 gap-2">
              {staffList.map((member) => (
                <button
                  key={member.id}
                  type="button"
                  onClick={() => handleQuickFill(member)}
                  className="p-2.5 rounded-xl bg-[#070d17] hover:bg-[#111e30] border border-[#192b42] hover:border-blue-500/50 flex items-center justify-between text-xs transition-all cursor-pointer text-right group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-blue-600/20 text-blue-400 font-bold flex items-center justify-center text-xs shrink-0 border border-blue-500/30">
                      {member.name.trim().split(' ')[0]?.[0] || 'م'}
                    </div>
                    <div className="truncate">
                      <div className="font-extrabold text-white text-xs group-hover:text-blue-300 transition-colors">
                        {member.name}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        يوزر: <span className="text-amber-400 font-bold">{member.username || 'admin'}</span> | باسورد: <span className="text-emerald-400 font-bold">{member.password || '123'}</span>
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-1 rounded bg-[#132338] text-slate-300 border border-[#1e3452] group-hover:bg-blue-600 group-hover:text-white transition-all shrink-0">
                    دخول
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer info */}
        <p className="text-center text-[11px] text-slate-500 font-semibold">
          {centerSettings.receiptFooterText || 'حقوق الطبع والنشر محفوظة © 2025 سنتر ومنظومة الأستاذ أشرف السقا'}
        </p>
      </div>
    </div>
  );
};
