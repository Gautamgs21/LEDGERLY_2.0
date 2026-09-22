import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';

interface LoadingScreenProps {
  onFinish?: () => void;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ onFinish }) => {
  const [progress, setProgress] = useState<number>(10);
  const [statusText, setStatusText] = useState<string>('Initializing ledger...');

  useEffect(() => {
    const t1 = setTimeout(() => {
      setProgress(45);
      setStatusText('Syncing member balances...');
    }, 400);

    const t2 = setTimeout(() => {
      setProgress(85);
      setStatusText('Loading transactions & splits...');
    }, 900);

    const t3 = setTimeout(() => {
      setProgress(100);
      setStatusText('Ready!');
    }, 1400);

    const t4 = setTimeout(() => {
      if (onFinish) onFinish();
    }, 1750);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [onFinish]);

  return (
    <div
      id="app-loading-screen"
      className="flex-1 min-h-screen flex flex-col justify-between items-center px-6 py-12 bg-gradient-to-b from-[#f8fafc] via-[#f1f4fa] to-[#e8edf6] text-slate-800 select-none"
    >
      {/* Top spacer */}
      <div className="w-full flex justify-between items-center text-[11px] font-semibold text-slate-400 tracking-wider uppercase">
        <span>Ledgerly</span>
        <span>v2.4</span>
      </div>

      {/* Central Mascot & Branding */}
      <div className="flex flex-col items-center text-center my-auto">
        <motion.div
          initial={{ scale: 0.85, opacity: 0, y: 12 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="relative mb-5"
        >
          {/* Subtle glowing halo */}
          <div className="absolute -inset-2 bg-gradient-to-tr from-[#5046e5]/20 to-[#e11d48]/20 rounded-3xl blur-md opacity-70 animate-pulse" />

          {/* Mascot Icon */}
          <div className="relative w-32 h-32 rounded-3xl bg-white p-1.5 shadow-[0_10px_30px_rgba(30,39,70,0.12)] border border-slate-200/80 flex items-center justify-center overflow-hidden">
            <img
              src="/icon.png"
              alt="Ledgerly Mascot Icon"
              referrerPolicy="no-referrer"
              className="w-full h-full object-contain rounded-2xl"
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h1 className="font-['Cinzel',serif] font-black text-3xl text-[#1e2746] tracking-widest uppercase">
            LEDGERLY
          </h1>
          <p className="text-xs font-semibold text-slate-500 mt-1 tracking-wide">
            Daily Group Expense & Chai Ledger
          </p>
          <p className="text-[10px] font-mono text-slate-400 mt-0.5">
            since 2022
          </p>
        </motion.div>
      </div>

      {/* Bottom Loading Bar and Status */}
      <div className="w-full max-w-[260px] flex flex-col items-center">
        <div className="w-full bg-slate-200/80 h-1.5 rounded-full overflow-hidden shadow-inner">
          <motion.div
            className="h-full bg-gradient-to-r from-[#5046e5] to-[#7c3aed] rounded-full"
            initial={{ width: '10%' }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
          />
        </div>

        <div className="flex items-center justify-between w-full mt-2.5 text-[11px] font-medium text-slate-500">
          <span className="truncate">{statusText}</span>
          <span className="font-mono text-[10px] font-bold text-slate-600 pl-2">
            {progress}%
          </span>
        </div>
      </div>
    </div>
  );
};
