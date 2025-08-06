'use client';

import { memo, useCallback } from 'react';

interface CategoryFilterProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

const categories = [
  { value: '', label: 'ทั้งหมด', icon: '🍽️', description: 'ดูผลงานทั้งหมด' },
  { value: 'buffet-table', label: 'รูปภาพของโต๊ะอาหาร', icon: '🍽️', description: 'Buffet, Table Setting' },
  { value: 'food-plating', label: 'รูปภาพอาหาร', icon: '🍛', description: 'Food Plating, Food Station' },
  { value: 'event-atmosphere', label: 'รูปภาพบรรยากาศงาน', icon: '✨', description: 'Event Decoration, Lighting' },
  { value: 'special-dishes', label: 'รูปภาพเมนูหรืออาหารพิเศษ', icon: '⭐', description: 'Special Dishes' }
];

/**
 * Mobile select component
 */
interface MobileSelectProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

const MobileSelect = memo<MobileSelectProps>(({ selectedCategory, onCategoryChange }) => {
  const handleChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    onCategoryChange(e.target.value);
  }, [onCategoryChange]);

  return (
    <div className="md:hidden">
      <label htmlFor="category-select" className="sr-only">
        เลือกหมวดหมู่ผลงาน
      </label>
      <select
        id="category-select"
        value={selectedCategory}
        onChange={handleChange}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white shadow-sm transition-colors"
        aria-label="Filter portfolio by category"
      >
        {categories.map((category) => (
          <option key={category.value || 'all'} value={category.value}>
            {category.icon} {category.label}
          </option>
        ))}
      </select>
    </div>
  );
});
MobileSelect.displayName = 'MobileSelect';

/**
 * CategoryFilter component with enhanced accessibility and performance
 */
function CategoryFilter({ selectedCategory, onCategoryChange }: CategoryFilterProps) {
  return (
    <section className="mb-8" aria-labelledby="category-filter-heading">
      <h3 id="category-filter-heading" className="text-lg font-semibold text-gray-900 mb-4">
        หมวดหมู่ผลงาน
      </h3>
      
      {/* Desktop Filter */}
      <div 
        className="hidden md:flex flex-wrap gap-3" 
        role="group" 
        aria-labelledby="category-filter-heading"
        aria-label="Portfolio category filters"
      >
        {categories.map((category) => (
          <button
            key={category.value || 'all'}
            onClick={() => onCategoryChange(category.value)}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all duration-200 transform focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2
              ${selectedCategory === category.value
                ? 'bg-orange-600 text-white shadow-md scale-105 hover:bg-orange-700'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-orange-50 hover:text-orange-600 hover:border-orange-300 hover:scale-105'
              }
            `}
            aria-pressed={selectedCategory === category.value}
            aria-label={`Filter by ${category.label}${selectedCategory === category.value ? ' (currently selected)' : ''}`}
          >
            <span aria-hidden="true">{category.icon}</span>
            <span>{category.label}</span>
          </button>
        ))}
      </div>

      {/* Mobile Filter */}
      <MobileSelect 
        selectedCategory={selectedCategory}
        onCategoryChange={onCategoryChange}
      />
    </section>
  );
}

export default memo(CategoryFilter);