import React, { useEffect, useRef } from 'react';
import { usePOS } from '../../context/POSContext';
import { Search, Barcode, Filter, X } from 'lucide-react';

interface ProductSearchProps {
  selectedCategoryId: string | null;
  setSelectedCategoryId: (id: string | null) => void;
  stockFilter: 'all' | 'inStock' | 'lowStock';
  setStockFilter: (filter: 'all' | 'inStock' | 'lowStock') => void;
}

export const ProductSearch: React.FC<ProductSearchProps> = ({
  selectedCategoryId,
  setSelectedCategoryId,
  stockFilter,
  setStockFilter,
}) => {
  const { searchQuery, setSearchQuery, categories, products, addToCart, showToast } = usePOS();
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus search input when user presses '/'
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const targetTag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      if (e.key === '/' && targetTag !== 'input' && targetTag !== 'textarea') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Simulate Barcode Scanner input submission (if user scans barcode or presses Enter)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      const query = searchQuery.trim().toLowerCase();
      // Look for exact barcode match or exact SKU match
      const matched = products.find(
        (p) => p.barcode.toLowerCase() === query || p.sku.toLowerCase() === query
      );
      if (matched) {
        addToCart(matched);
        setSearchQuery('');
      } else {
        showToast('warning', 'Product Not Found', `No item matching barcode/SKU "${searchQuery}"`);
      }
    }
  };

  return (
    <div className="space-y-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
      {/* Search Input & Barcode Simulator */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search by name, SKU or scan barcode (Press Enter or '/')"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full pl-10 pr-10 py-2.5 text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-slate-900 dark:text-slate-100 placeholder-slate-400"
          />
          {searchQuery ? (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[11px] font-mono text-slate-400 bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded">
              <Barcode className="w-3.5 h-3.5" />
              <span>/</span>
            </div>
          )}
        </div>

        {/* Stock Filter Selector */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl shrink-0">
          <button
            onClick={() => setStockFilter('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              stockFilter === 'all'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setStockFilter('inStock')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              stockFilter === 'inStock'
                ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
            }`}
          >
            In Stock
          </button>
          <button
            onClick={() => setStockFilter('lowStock')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              stockFilter === 'lowStock'
                ? 'bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-400 shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
            }`}
          >
            Low Stock
          </button>
        </div>
      </div>

      {/* Category Pills horizontal scroll */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs">
        <button
          onClick={() => setSelectedCategoryId(null)}
          className={`px-3.5 py-1.5 rounded-xl font-medium shrink-0 transition-all ${
            selectedCategoryId === null
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          All Categories
        </button>

        {categories.map((cat) => {
          const isSelected = selectedCategoryId === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategoryId(cat.id)}
              className={`px-3.5 py-1.5 rounded-xl font-medium shrink-0 transition-all ${
                isSelected
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {cat.name}
            </button>
          );
        })}
      </div>
    </div>
  );
};
