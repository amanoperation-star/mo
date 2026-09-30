import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { RealtimeSyncPayload } from '../utils/realtimeBroadcast';
import { NavigationScreen } from '../types';

interface RealtimeNotificationToastProps {
  latestEvent: RealtimeSyncPayload | null;
  onClose: () => void;
  onOpenNotifications: (screen?: NavigationScreen) => void;
}

function playNotificationChime() {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(659.25, now); // E5
    gain1.gain.setValueAtTime(0.12, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.35);

    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880, now + 0.12); // A5
    gain2.gain.setValueAtTime(0.14, now + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.12);
    osc2.stop(now + 0.55);
  } catch (e) {
    // Ignore autoplay limits
  }
}

export const RealtimeNotificationToast: React.FC<RealtimeNotificationToastProps> = ({
  latestEvent,
  onClose,
  onOpenNotifications,
}) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (latestEvent) {
      setVisible(true);
      playNotificationChime();

      const timer = setTimeout(() => {
        setVisible(false);
        onClose();
      }, 9000); // Display for 9 seconds
      return () => clearTimeout(timer);
    } else {
      setVisible(false);
    }
  }, [latestEvent, onClose]);

  if (!visible || !latestEvent) return null;

  const handleActionClick = () => {
    setVisible(false);
    onClose();
    if (latestEvent.linkScreen) {
      onOpenNotifications(latestEvent.linkScreen);
    } else {
      onOpenNotifications('students-list');
    }
  };

  const handleDismiss = () => {
    setVisible(false);
    onClose();
  };

  return (
    <div
      id="cloud-realtime-alert-toast"
      className="fixed bottom-6 left-6 z-[9999] w-[90vw] sm:w-[420px] bg-[#06111a] border-2 border-[#10b981] rounded-2xl p-4 shadow-2xl shadow-emerald-950/70 text-white animate-in slide-in-from-bottom-5 duration-300 backdrop-blur-xl dir-rtl"
    >
      {/* Top Header */}
      <div className="flex items-center justify-between pb-2 border-b border-[#122838]">
        {/* Right side: Pulsing Green Dot + Title */}
        <div className="flex items-center gap-2">
          <span className="relative flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-400 shadow-[0_0_12px_#34d399]" />
          </span>
          <h3 className="text-sm font-black text-white tracking-wide">
            تنبيه سحابي فوري 🌐
          </h3>
        </div>

        {/* Left side: Close Button */}
        <button
          onClick={handleDismiss}
          type="button"
          className="p-1 text-slate-400 hover:text-white hover:bg-[#142332] rounded-lg transition-colors cursor-pointer"
          title="إغلاق التنبيه"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Main Content Body */}
      <div className="py-2.5 flex flex-col gap-1 text-right">
        {/* Headline with Rocket Icon */}
        <h4 className="text-sm sm:text-base font-black text-[#10b981] leading-snug">
          {latestEvent.actionTitle}
        </h4>

        {/* Detail text */}
        <p className="text-xs text-slate-200 font-semibold leading-relaxed">
          {latestEvent.actionDetails}
        </p>

        {/* User attribution */}
        <p className="text-xs text-slate-400 font-medium">
          بواسطة: {latestEvent.senderUser || 'أك. محمود عزت'}
        </p>
      </div>

      {/* Bottom Actions Row */}
      <div className="pt-2 flex items-center justify-between gap-3">
        {/* Dismiss Button on the Left */}
        <button
          onClick={handleDismiss}
          type="button"
          className="bg-[#152332] hover:bg-[#1e3247] text-slate-300 hover:text-white font-bold text-xs py-2 px-4 rounded-xl transition-all cursor-pointer shrink-0"
        >
          تجاهل
        </button>

        {/* Primary Green Action Button on the Right */}
        <button
          onClick={handleActionClick}
          type="button"
          className="flex-1 bg-[#059669] hover:bg-[#10b981] active:bg-[#047857] text-white font-black text-xs sm:text-sm py-2 px-4 rounded-xl shadow-lg shadow-emerald-950/50 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
        >
          <span>فتح وعرض السجل الآن 👁️</span>
        </button>
      </div>
    </div>
  );
};
