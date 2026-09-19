import React from 'react';
import { Activity, Clock, User, ShieldAlert, CheckCircle, Info } from 'lucide-react';
import { AuditLog } from '../../types';

interface AuditLogScreenProps {
  logs: AuditLog[];
  onClearLogs?: () => void;
}

export const AuditLogScreen: React.FC<AuditLogScreenProps> = ({ logs, onClearLogs }) => {
  return (
    <div
      id="audit-log-screen"
      className="bg-[#0b1320] border border-[#192b42] rounded-2xl p-4 md:p-7 shadow-2xl flex-1 flex flex-col transition-all"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#16253b]">
        <div>
          <h2 className="text-lg md:text-xl font-extrabold text-white flex items-center gap-2.5">
            <Activity className="w-5 h-5 text-purple-400" />
            <span>سجل الرقابة والعمليات (Audit Log)</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1 font-medium">
            توثيق دقيق لكل عملية تسجيل، تعديل مالي، وتأكيد إيصال بالوقت والتاريخ والمستخدم
          </p>
        </div>

        {onClearLogs && (
          <button
            onClick={onClearLogs}
            type="button"
            className="text-xs text-slate-400 hover:text-red-400 font-semibold px-3 py-1.5 rounded-lg border border-[#1a2b42]"
          >
            مسح السجل
          </button>
        )}
      </div>

      <div className="flex flex-col gap-2.5 mt-5">
        {logs.map((log) => (
          <div
            key={log.id}
            className="bg-[#080f1a] border border-[#17273f] rounded-xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
          >
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-blue-950/60 border border-blue-800/40 text-blue-400 shrink-0 mt-0.5">
                {log.type === 'success' ? (
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                ) : log.type === 'warning' ? (
                  <ShieldAlert className="w-4 h-4 text-amber-400" />
                ) : (
                  <Info className="w-4 h-4 text-blue-400" />
                )}
              </div>
              <div>
                <div className="font-bold text-white text-sm">{log.action}</div>
                <div className="text-slate-300 mt-0.5">{log.details}</div>
              </div>
            </div>

            <div className="flex items-center gap-4 text-[11px] text-slate-400 font-mono shrink-0 w-full sm:w-auto justify-between sm:justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-[#132238]">
              <span className="flex items-center gap-1 text-slate-300">
                <User className="w-3 h-3 text-slate-400" />
                <span>{log.user}</span>
              </span>
              <span className="flex items-center gap-1 text-slate-400">
                <Clock className="w-3 h-3" />
                <span>{log.timestamp}</span>
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
