import React from 'react';
import { Home, Plus, History, Settings } from 'lucide-react';
import { TabType } from '../types';

interface BottomNavProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentTab, onSelectTab }) => {
  const tabs: { id: TabType; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'new', label: 'New', icon: Plus },
    { id: 'history', label: 'History', icon: History },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <footer
      id="bottom-navigation-bar"
      data-purpose="bottom-navigation"
      className="bg-white border-t border-slate-200 py-1.5 px-6 flex items-center justify-between fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[420px] z-30 shadow-[0_-2px_10px_rgba(0,0,0,0.03)]"
    >
      {tabs.map((tab) => {
        const IconComponent = tab.icon;
        const isActive = currentTab === tab.id;

        return (
          <button
            key={tab.id}
            id={`nav-item-${tab.id}`}
            type="button"
            onClick={() => onSelectTab(tab.id)}
            style={isActive ? { color: 'var(--color-primary)' } : undefined}
            className={`flex flex-col items-center justify-center space-y-0.5 py-1 flex-1 transition-colors cursor-pointer group focus:outline-none ${
              isActive
                ? 'font-semibold'
                : 'text-slate-400 hover:text-slate-600 font-medium'
            }`}
          >
            {tab.id === 'new' ? (
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] shadow-sm transition-all ${
                  isActive
                    ? 'text-white scale-105'
                    : 'bg-slate-200 text-slate-600 group-hover:bg-slate-300'
                }`}
                style={isActive ? { backgroundColor: 'var(--color-primary)' } : undefined}
              >
                <Plus className="w-3 h-3 stroke-[2.5]" />
              </div>
            ) : (
              <IconComponent
                className={`w-4 h-4 transition-transform ${
                  isActive ? 'stroke-[2.2] scale-110' : 'stroke-[1.8]'
                }`}
              />
            )}
            <span
              className={`text-[10px] leading-none ${
                isActive ? 'font-semibold' : 'font-medium'
              }`}
            >
              {tab.label}
            </span>
          </button>
        );
      })}
    </footer>
  );
};

