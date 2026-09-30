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
      {/* Bell Button */}
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
        title={
          unreadCount > 0
            ? `يوجد ${unreadCount} إشعارات غير مقروءة من فريق العمل`
            : 'الإشعارات والتنبيهات المباشرة للفريق'
        }
        className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer border ${
          unreadCount > 0
            ? 'bg-[#1e1308] border-amber-500/50 hover:border-amber-400 text-amber-300 shadow-md shadow-amber-500/10'
            : 'bg-[#0b1828] border-blue-500/30 hover:border-blue-400 text-blue-300'
        }`}
      >
        <div className="relative">
          <Bell className={`w-4 h-4 ${unreadCount > 0 ? 'text-amber-400 animate-bounce' : 'text-blue-400'}`} />
          {unreadCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-rose-500 text-[9px] font-black text-white shadow-md">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </div>
        <span className="hidden sm:inline font-bold">
          {unreadCount > 0 ? `${unreadCount} تنبيه جديد` : 'الإشعارات'}
        </span>
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
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[#101b2a]'
              }`}
            >
              الأقساط ⚠️
            </button>
          </div>

          {/* Notifications List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-[#132238] p-1">
            {filteredNotifications.length === 0 ? (
              <div className="p-8 text-center flex flex-col items-center justify-center gap-2 text-slate-500">
                <CheckCircle2 className="w-8 h-8 text-slate-600" />
                <p className="text-xs font-bold text-slate-400">لا توجد إشعارات حالياً في القائمة</p>
                <p className="text-[10px] text-slate-500">سيتم إظهار أي نشاط جديد من أعضاء الفريق فور حدوثه</p>
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
                  className={`p-3 rounded-xl transition-all cursor-pointer flex items-start gap-2.5 hover:bg-[#111e30] ${
                    !notif.read ? 'bg-[#0f1b2d]/80 border-r-2 border-r-amber-400' : 'opacity-80'
                  }`}
                >
                  {/* Icon / Type Badge */}
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs mt-0.5 ${
                      notif.type === 'success'
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                        : notif.type === 'installment'
                        ? 'bg-rose-950 text-rose-400 border border-rose-500/30'
                        : notif.type === 'warning'
                        ? 'bg-amber-950 text-amber-400 border border-amber-500/30'
                        : 'bg-blue-950 text-blue-400 border border-blue-500/30'
                    }`}
                  >
                    {notif.type === 'success' && <CheckCircle2 className="w-3.5 h-3.5" />}
                    {notif.type === 'installment' && <AlertTriangle className="w-3.5 h-3.5" />}
                    {notif.type === 'warning' && <AlertTriangle className="w-3.5 h-3.5" />}
                    {notif.type === 'info' && <Info className="w-3.5 h-3.5" />}
                  </div>

                  {/* Body Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <h4 className="text-xs font-extrabold text-white truncate flex items-center gap-1.5">
                        {(!notif.read || notif.status === 'unread') && (
                          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 animate-pulse" title="غير مقروء" />
                        )}
                        <span>{notif.title}</span>
                      </h4>
                      <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1 shrink-0">
                        <Clock className="w-2.5 h-2.5 text-slate-500" />
                        <span>{notif.timestamp}</span>
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-300 font-medium leading-relaxed mt-1 line-clamp-2">
                      {notif.details}
                    </p>

                    <div className="flex items-center justify-between gap-2 mt-2 pt-1 border-t border-[#132238]/60 text-[10px]">
                      <span className="text-amber-400 font-bold flex items-center gap-1">
                        <User className="w-2.5 h-2.5 text-amber-400" />
                        <span>بواسطة: {notif.user}</span>
                      </span>

                      {!notif.read && (
                        <span className="text-amber-400 font-bold bg-amber-950/60 px-1.5 py-0.5 rounded text-[9px] border border-amber-800/40">
                          جديد
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Status */}
          <div className="p-2.5 bg-[#080f1a] border-t border-[#16253b] text-center text-[10px] text-slate-400 font-semibold flex items-center justify-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>بث الإشعارات مفعل ومربوط سحابياً في نفس الثانية</span>
          </div>
        </div>
      )}
    </div>
  );
};
