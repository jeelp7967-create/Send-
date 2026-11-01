import React from 'react';
import { Plus } from 'lucide-react';
import { PageTab } from '../types.ts';

interface HeaderProps {
  activeTab: PageTab;
  onNavigate: (tab: PageTab) => void;
  onOpenCreate: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onNavigate, onOpenCreate }) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md">
      <div className="relative max-w-4xl mx-auto h-[66px] px-4 flex items-center justify-between">
        {/* Left: Quick Create Button */}
        <button
          onClick={onOpenCreate}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#E5E5E5] bg-white text-xs font-semibold text-[#171717] hover:bg-[#F5F5F5] active:scale-95 transition-all shadow-xs"
          aria-label="Create new QR post"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5] text-[#FF8C42]" />
          <span className="hidden sm:inline">Create</span>
        </button>

        {/* Center: Brand Wordmark */}
        <button
          onClick={() => onNavigate('home')}
          className="absolute left-1/2 -translate-x-1/2 text-center group cursor-pointer focus:outline-hidden"
          aria-label="Go to SENND Home"
        >
          <h1 className="text-[23px] font-[800] tracking-[3px] text-[#111111] leading-none transition-transform group-hover:scale-102">
            SENND
          </h1>
          <p className="text-[8px] font-bold tracking-[2px] text-[#737373] mt-0.5">
            STICK · SCAN · SHARE
          </p>
        </button>

        {/* Right: Camera Scanner Icon Button */}
        <button
          onClick={() => onNavigate('scan')}
          className="w-10 h-10 rounded-xl grid place-items-center text-[#171717] hover:bg-[#F5F5F5] active:scale-90 transition-all border border-[#E5E5E5]/60"
          aria-label="Open QR Scanner"
          title="Scan QR Code"
        >
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
            <path
              d="M8 3H5a2 2 0 0 0-2 2v3M16 3h3a2 2 0 0 1 2 2v3M3 16v3a2 2 0 0 0 2 2h3M21 16v3a2 2 0 0 1-2 2h-3"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
            <rect
              x="8"
              y="8"
              width="8"
              height="8"
              rx="1.5"
              stroke="currentColor"
              strokeWidth="1.8"
            />
          </svg>
        </button>
      </div>

      {/* Brand Accent Line: Completely Green */}
      <div className="w-full h-[3.5px] flex bg-[#B8F36B]">
        <span className="w-full bg-[#B8F36B]" />
      </div>
    </header>
  );
};
