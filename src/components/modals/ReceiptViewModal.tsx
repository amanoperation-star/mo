import React from 'react';
import { X, Download, ExternalLink } from 'lucide-react';

interface ReceiptViewModalProps {
  receiptUrl: string | null;
  onClose: () => void;
}

export const ReceiptViewModal: React.FC<ReceiptViewModalProps> = ({ receiptUrl, onClose }) => {
  if (!receiptUrl) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div className="bg-[#0b1320] border border-[#1b2f48] rounded-2xl max-w-2xl w-full p-5 shadow-2xl flex flex-col gap-4 text-right">
        <div className="flex items-center justify-between pb-3 border-b border-[#16253b]">
          <button
            onClick={onClose}
            className="p-1 hover:bg-[#152336] text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="text-sm font-bold text-white">معاينة صورة إيصال التحويل المرفق</div>
        </div>

        <div className="max-h-[70vh] overflow-auto flex items-center justify-center bg-[#070d17] rounded-xl border border-[#16253b] p-2">
          <img
            src={receiptUrl}
            alt="صورة إيصال التحويل"
            className="max-h-[60vh] object-contain rounded-lg shadow-md"
            referrerPolicy="no-referrer"
          />
        </div>

        <div className="flex justify-between items-center pt-2">
          <span className="text-xs text-slate-400">إيصال موثق ومربوط ببيانات الطالب</span>
          <a
            href={receiptUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#122033] hover:bg-[#1a2d48] border border-[#1f3654] text-blue-300 text-xs py-1.5 px-3 rounded-lg flex items-center gap-1.5 font-semibold transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>فتح في نافذة جديدة</span>
          </a>
        </div>
      </div>
    </div>
  );
};
