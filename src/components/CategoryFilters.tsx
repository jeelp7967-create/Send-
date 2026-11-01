import React from 'react';
import { CategoryType } from '../types.ts';

interface CategoryFiltersProps {
  currentFilter: CategoryType;
  onSelectCategory: (category: CategoryType) => void;
}

const CATEGORIES: { label: string; value: CategoryType }[] = [
  { label: 'All', value: 'All' },
  { label: 'Products', value: 'Product' },
  { label: 'Places', value: 'Place' },
  { label: 'Videos', value: 'Video' },
  { label: 'Audio', value: 'Audio' },
  { label: 'Documents', value: 'Document' },
];

export const CategoryFilters: React.FC<CategoryFiltersProps> = ({
  currentFilter,
  onSelectCategory,
}) => {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 mb-5 no-scrollbar scroll-smooth" role="tablist">
      {CATEGORIES.map((cat) => {
        const isActive = currentFilter === cat.value;
        return (
          <button
            key={cat.value}
            role="tab"
            aria-selected={isActive}
            onClick={() => onSelectCategory(cat.value)}
            className={`shrink-0 px-4 py-2 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
              isActive
                ? 'bg-[#171717] text-white border-[#171717] shadow-xs'
                : 'bg-white text-[#666666] border-[#E5E5E5] hover:border-[#CCCCCC] hover:text-[#171717]'
            }`}
          >
            {cat.label}
          </button>
        );
      })}
    </div>
  );
};
