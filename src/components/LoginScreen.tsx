import React, { useState } from 'react';
import { Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { Member } from '../types';

interface LoginScreenProps {
  members: Member[];
  onLogin: (member: Member) => void;
  onToast: (msg: string) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  members,
  onLogin,
  onToast,
}) => {
  // Default selected member
  const [selectedMemberId, setSelectedMemberId] = useState<string>(
    members[0]?.id || ''
  );
  const [pin, setPin] = useState<string>('123456');
  const [showPin, setShowPin] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const selectedMember = members.find((m) => m.id === selectedMemberId) || members[0];

  const handleSelectMember = (id: string) => {
    setSelectedMemberId(id);
    setErrorMsg(null);
    const m = members.find((mem) => mem.id === id);
    if (m && m.pin) {
      setPin(m.pin || '123456');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMember) {
      setErrorMsg('Please select a user');
      return;
    }

    const trimmedPin = pin.trim();
    const isDefault = trimmedPin === '123456';
    const isMemberPin = selectedMember.pin && trimmedPin === selectedMember.pin;

    if (!isDefault && !isMemberPin) {
      setErrorMsg('Incorrect PIN. Please try again.');
      return;
    }

    setErrorMsg(null);
    onLogin(selectedMember);
    onToast(`Welcome back, ${selectedMember.name}`);
  };

  return (
    <div className="flex-1 flex flex-col justify-center p-5 py-8 bg-gradient-to-b from-white via-[#f7f9fd] to-[#eef2f8]">
      {/* Brand Header */}
      <div className="text-center pb-5">
        <div className="inline-block relative mb-2">
          <div className="w-24 h-24 rounded-3xl bg-white p-1 shadow-[0_8px_25px_rgba(30,39,70,0.10)] border border-slate-200/80 flex items-center justify-center overflow-hidden mx-auto">
            <img
              src="/icon.png"
              alt="Ledgerly Mascot Icon"
              referrerPolicy="no-referrer"
              className="w-full h-full object-contain rounded-2xl"
            />
          </div>
        </div>
        <h1 className="font-['Cinzel',serif] font-bold text-2xl text-[#1e2746] tracking-wider uppercase">
          LEDGERLY
        </h1>
        <p className="text-xs text-slate-500 mt-0.5 font-medium">
          Group Expense & Daily Activity Ledger
        </p>
      </div>

      {/* Main Login Card */}
      <div className="bg-white rounded-2xl p-6 shadow-[0_4px_24px_rgba(0,0,0,0.06)] border border-slate-200/80">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-5">
          <div>
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider font-headline">
              User Sign In
            </h2>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Enter your credentials to continue
            </p>
          </div>
          <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
            <Lock className="w-4 h-4 text-[#5046e5]" />
          </div>
        </div>

        {errorMsg && (
          <div className="mb-4 p-2.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center space-x-2 text-rose-700 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 text-[#e11d48]" />
            <span className="font-medium">{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Select UserName */}
          <div>
            <label
              htmlFor="login-member-select"
              className="block text-xs font-bold text-slate-700 mb-1.5"
            >
              Select UserName:
            </label>
            <div className="relative">
              <select
                id="login-member-select"
                value={selectedMemberId}
                onChange={(e) => handleSelectMember(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-[#5046e5] rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 appearance-none focus:outline-none focus:ring-2 focus:ring-[#5046e5]/20 transition-all cursor-pointer shadow-xs"
              >
                {members.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name}
                  </option>
                ))}
              </select>
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs">
                ▼
              </div>
            </div>
          </div>

          {/* User Pin */}
          <div>
            <label
              htmlFor="login-pin-input"
              className="block text-xs font-bold text-slate-700 mb-1.5"
            >
              User Pin
            </label>
            <div className="relative">
              <input
                id="login-pin-input"
                type={showPin ? 'text' : 'password'}
                inputMode="numeric"
                maxLength={6}
                value={pin}
                onChange={(e) => {
                  setPin(e.target.value);
                  setErrorMsg(null);
                }}
                placeholder="Enter PIN"
                className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-[#5046e5] rounded-xl pl-3.5 pr-10 py-2.5 text-xs font-mono font-bold tracking-widest text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#5046e5]/20 transition-all shadow-xs"
              />
              <button
                type="button"
                id="btn-toggle-pin-visibility"
                onClick={() => setShowPin(!showPin)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                title={showPin ? 'Hide PIN' : 'Show PIN'}
              >
                {showPin ? (
                  <EyeOff className="w-4 h-4 text-slate-500" />
                ) : (
                  <Eye className="w-4 h-4 text-slate-500" />
                )}
              </button>
            </div>
          </div>

          {/* SIGN IN Button */}
          <div className="pt-2">
            <button
              id="login-submit-btn"
              type="submit"
              style={{ backgroundColor: 'var(--color-primary)' }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-primary-hover)')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-primary)')}
              className="w-full active:scale-[0.99] text-white py-2.5 px-4 rounded-xl font-bold text-xs shadow-md transition-all flex items-center justify-center space-x-1.5 cursor-pointer tracking-wider uppercase"
            >
              <span>SIGN IN</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
