import React, { useEffect, useState } from 'react';
import { Bell, Sparkles, User, X, CheckCircle2, AlertTriangle, ArrowLeft } from 'lucide-react';
import { RealtimeSyncPayload } from '../utils/realtimeBroadcast';

interface RealtimeNotificationToastProps {
  latestEvent: RealtimeSyncPayload | null;
  onClose: () => void;
  onOpenNotifications: () => void;
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
      const timer = setTimeout(() => {
        setVisible(false);
      }, 7000); // Auto hide after 7 seconds
      return () => clearTimeout(timer);
    } else {
      setVisible(false);
    }
  }, [latestEvent]);

  if (!visible || !latestEvent) return null;

  return (
    <div className="fixed bottom-5 left-5 z-50 max-w-sm sm:max-w-md w-full bg-[#0a1424] border-2 border-amber-500/60 rounded-2xl p-4 shadow-2xl text-white animate-in slide-in-from-bottom-5 duration-300 backdrop-blur-lg dir-rtl">
      {/* Top bar */}
      <div className="flex items-center justify-between pb-2 border-b border-[#182942]">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center animate-bounce">
            <Bell className="w-4 h-4" />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-black text-amber-300">إشعار مباشر من الفريق</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </div>
        </div>

        <button
          onClick={() => setVisible(false)}
          type="button"
          className="p-1 hover:bg-[#142338] text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Content */}
      <div className="mt-2.5 flex flex-col gap-1.5">
        <h4 className="text-xs sm:text-sm font-extrabold text-white flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>{latestEvent.actionTitle}</span>
        </h4>

        <p className="text-xs text-slate-300 font-medium leading-snug">
          {latestEvent.actionDetails}
        </p>

        <div className="mt-2 pt-2 border-t border-[#182942] flex items-center justify-between text-[11px]">
          <span className="text-amber-400 font-bold flex items-center gap-1">
            <User className="w-3 h-3 text-amber-400" />
            <span>بواسطة: {latestEvent.senderUser}</span>
          </span>

          <button
            onClick={() => {
              onOpenNotifications();
              setVisible(false);
            }}
            type="button"
            className="text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1 underline cursor-pointer"
          >
            <span>عرض التنبيهات</span>
            <ArrowLeft className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};
