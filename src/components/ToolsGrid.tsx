import React from 'react';

export type ActiveTool = 'product' | 'search' | 'location' | 'qr-search' | null;

interface ToolsGridProps {
  activeTool: ActiveTool;
  onSelectTool: (tool: 'product' | 'search' | 'location' | 'qr-search') => void;
}

export const ToolsGrid: React.FC<ToolsGridProps> = ({ activeTool, onSelectTool }) => {
  return (
    <section className="w-full mb-6">
      <div className="grid grid-cols-4 gap-2.5 sm:gap-3.5">
        {/* Tool 1: Product */}
        <button
          onClick={() => onSelectTool('product')}
          className={`aspect-square w-full rounded-2xl border p-2 flex flex-col items-center justify-center gap-1.5 transition-all text-center group cursor-pointer ${
            activeTool === 'product'
              ? 'bg-[#F4FBEA] border-[#B8D99A] text-[#171717] shadow-xs'
              : 'bg-white border-[#E5E5E5] text-[#171717] hover:border-[#D0D0D0] hover:bg-[#FAFAFA]'
          }`}
          aria-label="Filter products"
          title="Product Posts"
        >
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${
            activeTool === 'product' ? 'bg-[#B8F36B]/60 text-[#171717]' : 'bg-[#F4F4F4] text-[#171717] group-hover:bg-[#EAEAEA]'
          }`}>
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <rect x="5" y="5" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" rx="2" />
              <rect x="9" y="9" width="6" height="6" fill="currentColor" rx="1" />
            </svg>
          </div>
          <span className="text-[11px] font-semibold leading-tight line-clamp-1">Product</span>
        </button>

        {/* Tool 2: Search */}
        <button
          onClick={() => onSelectTool('search')}
          className={`aspect-square w-full rounded-2xl border p-2 flex flex-col items-center justify-center gap-1.5 transition-all text-center group cursor-pointer ${
            activeTool === 'search'
              ? 'bg-[#F4FBEA] border-[#B8D99A] text-[#171717] shadow-xs'
              : 'bg-white border-[#E5E5E5] text-[#171717] hover:border-[#D0D0D0] hover:bg-[#FAFAFA]'
          }`}
          aria-label="Search all posts"
          title="Search"
        >
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${
            activeTool === 'search' ? 'bg-[#B8F36B]/60 text-[#171717]' : 'bg-[#F4F4F4] text-[#171717] group-hover:bg-[#EAEAEA]'
          }`}>
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <circle cx="10.5" cy="10.5" r="6" fill="none" stroke="currentColor" strokeWidth="2.4" />
              <path d="M15 15L20 20" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
            </svg>
          </div>
          <span className="text-[11px] font-semibold leading-tight line-clamp-1">Search</span>
        </button>

        {/* Tool 3: Location */}
        <button
          onClick={() => onSelectTool('location')}
          className={`aspect-square w-full rounded-2xl border p-2 flex flex-col items-center justify-center gap-1.5 transition-all text-center group cursor-pointer ${
            activeTool === 'location'
              ? 'bg-[#F4FBEA] border-[#B8D99A] text-[#171717] shadow-xs'
              : 'bg-white border-[#E5E5E5] text-[#171717] hover:border-[#D0D0D0] hover:bg-[#FAFAFA]'
          }`}
          aria-label="Filter by location"
          title="Location Search"
        >
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${
            activeTool === 'location' ? 'bg-[#B8F36B]/60 text-[#171717]' : 'bg-[#F4F4F4] text-[#171717] group-hover:bg-[#EAEAEA]'
          }`}>
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="7" fill="none" stroke="currentColor" strokeWidth="2" />
              <circle cx="12" cy="12" r="2.5" fill="none" stroke="currentColor" strokeWidth="2" />
              <path d="M12 2V6M12 18V22M2 12H6M18 12H22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          <span className="text-[11px] font-semibold leading-tight line-clamp-1">Location</span>
        </button>

        {/* Tool 4: QR Code Search */}
        <button
          onClick={() => onSelectTool('qr-search')}
          className={`aspect-square w-full rounded-2xl border p-2 flex flex-col items-center justify-center gap-1.5 transition-all text-center group cursor-pointer ${
            activeTool === 'qr-search'
              ? 'bg-[#F4FBEA] border-[#B8D99A] text-[#171717] shadow-xs'
              : 'bg-white border-[#E5E5E5] text-[#171717] hover:border-[#D0D0D0] hover:bg-[#FAFAFA]'
          }`}
          aria-label="Search by QR code destination"
          title="QR Code Search"
        >
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${
            activeTool === 'qr-search' ? 'bg-[#B8F36B]/60 text-[#171717]' : 'bg-[#F4F4F4] text-[#171717] group-hover:bg-[#EAEAEA]'
          }`}>
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <rect x="3" y="3" width="7" height="7" fill="none" stroke="currentColor" strokeWidth="2" rx="1" />
              <rect x="14" y="3" width="7" height="7" fill="none" stroke="currentColor" strokeWidth="2" rx="1" />
              <rect x="3" y="14" width="7" height="7" fill="none" stroke="currentColor" strokeWidth="2" rx="1" />
              <path d="M14 14H17V17H14ZM18 18H21V21H18ZM18 14V16M14 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          <span className="text-[11px] font-semibold leading-tight line-clamp-1">QR Search</span>
        </button>
      </div>
    </section>
  );
};
