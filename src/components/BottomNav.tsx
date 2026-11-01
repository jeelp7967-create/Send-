import React from 'react';
import { PageTab } from '../types.ts';

interface BottomNavProps {
  activeTab: PageTab;
  onSelectTab: (tab: PageTab) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onSelectTab }) => {
  const navItems: { tab: PageTab; label: string; icon: React.ReactNode }[] = [
    {
      tab: 'home',
      label: 'Home',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      ),
    },
    {
      tab: 'scan',
      label: 'Scan',
      icon: (
        <div className="relative">
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <rect x="3" y="3" width="7" height="7" rx="1.5" />
            <rect x="14" y="3" width="7" height="7" rx="1.5" />
            <rect x="3" y="14" width="7" height="7" rx="1.5" />
            <path d="M14 14h3v3h-3zM18 18h3v3h-3zM18 14v2M14 19v2" />
          </svg>
          {activeTab === 'scan' && (
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#B8F36B]" />
          )}
        </div>
      ),
    },
    {
      tab: 'trending',
      label: 'Trending',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
          <polyline points="16 7 22 7 22 13" />
        </svg>
      ),
    },
    {
      tab: 'product',
      label: 'Product',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
          <rect x="4" y="4" width="16" height="16" rx="3" />
          <rect x="9" y="9" width="6" height="6" fill="currentColor" rx="1" />
        </svg>
      ),
    },
    {
      tab: 'account',
      label: 'Account',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      ),
    },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-[#E5E5E5] px-2 pt-1 pb-[calc(8px+env(safe-area-inset-bottom,0px))]"
      aria-label="Main Navigation"
    >
      <div className="max-w-md mx-auto grid grid-cols-5 items-center">
        {navItems.map((item) => {
          const isActive = activeTab === item.tab;
          return (
            <button
              key={item.tab}
              onClick={() => onSelectTab(item.tab)}
              className={`flex flex-col items-center justify-center py-1.5 transition-all cursor-pointer ${
                isActive
                  ? 'text-[#171717] font-bold scale-105'
                  : 'text-[#777777] font-medium hover:text-[#171717]'
              }`}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
            >
              <div
                className={`p-1 rounded-xl transition-colors ${
                  isActive ? 'bg-[#F4FBEA] text-[#171717]' : 'text-current'
                }`}
              >
                {item.icon}
              </div>
              <span className="text-[10px] tracking-tight mt-0.5 leading-none">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
