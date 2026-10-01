import React, { useState, useRef, useEffect } from 'react';
import { Bell, CheckCheck, Trash2, User, Sparkles, CheckCircle2, AlertTriangle, Info, Clock, ExternalLink } from 'lucide-react';
import { AppNotification, NavigationScreen } from '../types';

interface NotificationBellProps {
  notifications: AppNotification[];
  onMarkAllAsRead: () => void;
  onClearAll: () => void;
  onNotificationClick: (notification: AppNotification) => void;
  onNavigateToScreen?: (screen: NavigationScreen) => void;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({
  notifications,
  onMarkAllAsRead,
  onClearAll,
  onNotificationClick,
  onNavigateToScreen,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'unread' | 'installment'>('all');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredNotifications = notifications.filter((n) => {
    if (activeFilter === 'unread') return !n.read;
    if (activeFilter === 'installment') return n.type === 'installment';
    return true;
  });

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      {/* Bell Button (Icon Only with Cyan Glow Dot, exactly matching reference image) */}
      <button
        id="notification-bell-button"
        type="button"
        onClick={() => {
          const next = !isOpen;
          setIsOpen(next);
          if (next && unreadCount > 0) {
            onMarkAllAsRead();
          }
        }}
        title={unreadCount > 0 ? `يوجد ${unreadCount} تنبيهات غير مقروءة` : 'الإشعارات والتنبيهات المباشرة'}
        className="relative p-2.5 rounded-xl bg-[#0a1220] hover:bg-[#132238] border border-[#16273f] text-slate-300 transition-all cursor-pointer shadow-sm flex items-center justify-center"
      >
        <div className="relative">
          <Bell className="w-4 h-4 text-cyan-400" />
          <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5 items-center justify-center rounded-full bg-cyan-400 shadow-[0_0_6px_#22d3ee]"></span>
        </div>
      </button>

      {/* Notifications Popover Dropdown */}
      {isOpen && (
        <div className="absolute left-0 sm:left-auto right-0 sm:right-0 mt-2 w-80 sm:w-96 bg-[#0b1320] border border-[#1d3250] rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 dir-rtl text-right">
          {/* Header */}
          <div className="p-4 bg-[#080f1a] border-b border-[#16253b] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-white flex items-center gap-1.5">
                  <span>تنبيهات المنظومة اللحظية</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                </h3>
                <p className="text-[10px] text-slate-400">مزامنة فورية لكل ما يحدث في المنظومة مع الفريق</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={onMarkAllAsRead}
                  title="تحديد الكل كـ مقروء"
                  className="p-1.5 rounded-lg bg-[#122033] hover:bg-blue-600 hover:text-white text-blue-300 transition-colors text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">مقروء</span>
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  type="button"
                  onClick={onClearAll}
                  title="مسح كافة الإشعارات"
                  className="p-1.5 rounded-lg bg-[#122033] hover:bg-rose-600 hover:text-white text-rose-300 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="p-2 bg-[#060b14] border-b border-[#142339] flex items-center gap-1.5 text-[11px]">
            <button
              type="button"
              onClick={() => setActiveFilter('all')}
              className={`flex-1 py-1 px-2 rounded-lg font-bold transition-all cursor-pointer text-center ${
                activeFilter === 'all'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[#101b2a]'
              }`}
            >
              الكل ({notifications.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter('unread')}
              className={`flex-1 py-1 px-2 rounded-lg font-bold transition-all cursor-pointer text-center ${
                activeFilter === 'unread'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[#101b2a]'
              }`}
            >
              غير مقروء ({unreadCount})
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter('installment')}
              className={`flex-1 py-1 px-2 rounded-lg font-bold transition-all cursor-pointer text-center ${
                activeFilter === 'installment'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[#101b2a]'
              }`}
            >
              الأقساط ({notifications.filter((n) => n.type === 'installment').length})
            </button>
          </div>

          {/* Notifications List */}
          <div className="max-h-72 overflow-y-auto divide-y divide-[#132238]">
            {filteredNotifications.length === 0 ? (
              <div className="py-10 text-center text-slate-500 text-xs font-bold">
                لا توجد تنبيهات جديدة في القائمة حالياً.
              </div>
            ) : (
              filteredNotifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => {
                    onNotificationClick(notif);
                    if (notif.linkScreen && onNavigateToScreen) {
                      onNavigateToScreen(notif.linkScreen);
                      setIsOpen(false);
                    }
                  }}
                  className={`p-3.5 transition-colors cursor-pointer flex flex-col gap-1 hover:bg-[#111f32] ${
                    !notif.read ? 'bg-[#0f1d30]/60' : 'opacity-85'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-extrabold text-white flex items-center gap-1.5">
                      {!notif.read && <span className="w-2 h-2 rounded-full bg-cyan-400 shrink-0" />}
                      {notif.title}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono shrink-0 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-500" />
                      {notif.timestamp}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed">{notif.details}</p>
                  {notif.linkScreen && (
                    <div className="flex items-center gap-1 text-[10px] text-blue-400 font-bold mt-1">
                      <span>الانتقال للصفحة المستهدفة</span>
                      <ExternalLink className="w-3 h-3" />
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
