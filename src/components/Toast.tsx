import React from 'react';
import { CheckCircle2 } from 'lucide-react';

interface ToastProps {
  message: string | null;
}

export const Toast: React.FC<ToastProps> = ({ message }) => {
  if (!message) return null;

  return (
    <div
      id="app-toast"
      className="fixed bottom-16 left-1/2 -translate-x-1/2 z-50 pointer-events-none transition-all duration-300 transform translate-y-0"
    >
      <div className="bg-slate-900 text-white px-4 py-2.5 rounded-full shadow-xl flex items-center space-x-2 text-xs font-medium border border-slate-800 backdrop-blur-md">
        <CheckCircle2 className="w-4 h-4 text-[#10b981] shrink-0" />
        <span className="whitespace-nowrap">{message}</span>
      </div>
    </div>
  );
};
