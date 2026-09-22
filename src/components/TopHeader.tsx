import React, { useState } from 'react';
import { Coffee, RotateCcw, LogOut, Shield, ChevronDown, User, Check, X } from 'lucide-react';
import { Member } from '../types';

interface TopHeaderProps {
  currentUser?: Member | null;
  onLogout?: () => void;
  onRefresh: () => void;
  isRefreshing?: boolean;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  currentUser,
  onLogout,
  onRefresh,
  isRefreshing = false,
}) => {
  const [spin, setSpin] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleRefreshClick = () => {
    setSpin(true);
    onRefresh();
    setTimeout(() => setSpin(false), 700);
  };

  const getRoleBadgeStyle = (role?: string) => {
    switch (role) {
      case 'Admin':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'Banker':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'User':
      default:
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
  };

  return (
    <header
      className="bg-white/95 backdrop-blur-md px-3.5 py-2.5 flex items-center justify-between shadow-[0_1px_3px_rgba(0,0,0,0.03)] border-b border-slate-200/80 sticky top-0 z-30"
      data-purpose="app-header"
    >
      {/* Brand */}
      <div className="flex items-center space-x-2">
        <div className="w-7 h-7 rounded-lg bg-white overflow-hidden shadow-2xs border border-slate-200/60 flex items-center justify-center p-0.5">
          <img
            src="/icon.png"
            alt="Ledgerly"
            referrerPolicy="no-referrer"
            className="w-full h-full object-contain rounded"
          />
        </div>
        <div>
          <h1 className="font-['Cinzel',serif] font-bold text-base text-[#1e2746] tracking-wider leading-none uppercase">
            LEDGERLY
          </h1>
        </div>
      </div>

      {/* Right controls: User Profile Badge + Sync */}
      <div className="flex items-center space-x-2">
        {currentUser && (
          <div className="relative">
            <button
              type="button"
              id="header-user-badge-btn"
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-full pl-1 pr-2 py-0.5 transition-all cursor-pointer shadow-2xs active:scale-95"
              title="Click to view session privileges"
            >
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0 shadow-2xs"
                style={{ backgroundColor: currentUser.color || '#5046e5' }}
              >
                {currentUser.avatarLetter}
              </div>
              <span className="text-[11px] font-bold text-slate-800 max-w-[65px] truncate">
                {currentUser.name}
              </span>
              <span
                className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded-full border ${getRoleBadgeStyle(
                  currentUser.role
                )}`}
              >
                {currentUser.role}
              </span>
            </button>

            {/* User Session Dropdown */}
            {showUserMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowUserMenu(false)}
                />
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl p-3 shadow-xl border border-slate-200 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="flex items-center space-x-2.5 pb-2.5 border-b border-slate-100">
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-xs"
                      style={{ backgroundColor: currentUser.color || '#5046e5' }}
                    >
                      {currentUser.avatarLetter}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-slate-800 truncate">
                        {currentUser.fullName || currentUser.name}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono truncate">
                        {currentUser.upi || `${currentUser.name.toLowerCase()}@okhdfcbank`}
                      </div>
                    </div>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded border shrink-0 ${getRoleBadgeStyle(
                        currentUser.role
                      )}`}
                    >
                      {currentUser.role}
                    </span>
                  </div>

                  {/* Privileges Summary */}
                  <div className="py-2 text-[10.5px] text-slate-600 space-y-1">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Role Privileges
                    </div>
                    {currentUser.role === 'Admin' && (
                      <div className="space-y-1 text-slate-700">
                        <div className="flex items-center space-x-1 text-indigo-700 font-bold">
                          <Shield className="w-3 h-3 text-[#5046e5]" />
                          <span>Full Administrator Privileges</span>
                        </div>
                        <p className="text-[10px] text-slate-500 leading-tight">
                          Can add, edit & delete all transactions, change group UPI VPA/ID, manage members, and reset all application data.
                        </p>
                      </div>
                    )}
                    {currentUser.role === 'Banker' && (
                      <div className="space-y-1 text-slate-700">
                        <div className="flex items-center space-x-1 text-blue-700 font-bold">
                          <Shield className="w-3 h-3 text-blue-600" />
                          <span>Banker Privileges</span>
                        </div>
                        <p className="text-[10px] text-slate-500 leading-tight">
                          Can add/edit/delete any transaction, change group UPI VPA/ID, add and remove members. Cannot reset system data.
                        </p>
                      </div>
                    )}
                    {currentUser.role === 'User' && (
                      <div className="space-y-1 text-slate-700">
                        <div className="flex items-center space-x-1 text-emerald-700 font-bold">
                          <Shield className="w-3 h-3 text-emerald-600" />
                          <span>User Privileges</span>
                        </div>
                        <p className="text-[10px] text-slate-500 leading-tight">
                          Can add transactions, edit/delete only own transactions, edit own settings/UPI. Delete self only if due &gt; 0.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Switch User / Logout Button */}
                  {onLogout && (
                    <div className="pt-2 border-t border-slate-100">
                      <button
                        type="button"
                        id="btn-logout-session"
                        onClick={() => {
                          setShowUserMenu(false);
                          onLogout();
                        }}
                        className="w-full flex items-center justify-center space-x-1.5 py-1.5 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-[#e11d48] text-xs font-semibold transition-colors cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Switch Account / Sign Out</span>
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        <button
          id="refresh-sync-btn"
          type="button"
          aria-label="Refresh Data"
          onClick={handleRefreshClick}
          className="text-slate-600 hover:text-slate-900 active:scale-95 transition-transform p-1.5 rounded-lg hover:bg-slate-100 flex items-center justify-center cursor-pointer"
          title="Sync & Refresh"
        >
          <RotateCcw
            id="refresh-icon"
            className={`w-4 h-4 text-slate-600 transition-transform duration-700 ${
              spin || isRefreshing ? 'rotate-360 text-[#5046e5]' : ''
            }`}
          />
        </button>
      </div>
    </header>
  );
};


