import React from 'react';
import { TeacupIcon } from './Botanicals';

interface ToastProps {
  message: string | null;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, onClose }) => {
  if (!message) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-[#FFFCF8] text-[#44352F] px-4 py-3 rounded-xl border border-[#D8A0A5] shadow-lg animate-bounce-subtle">
      <div className="p-1.5 rounded-full bg-[#F7DDE1] text-[#B98289]">
        <TeacupIcon className="w-4 h-4" />
      </div>
      <p className="text-sm font-body">{message}</p>
      <button
        onClick={onClose}
        className="ml-2 text-xs text-[#B98289] hover:underline cursor-pointer"
      >
        Dismiss
      </button>
    </div>
  );
};
