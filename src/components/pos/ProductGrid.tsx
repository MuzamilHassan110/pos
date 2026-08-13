import React from 'react';
import { usePOS } from '../../context/POSContext';
import { Product } from '../../types';
import { Plus, AlertTriangle, PackageX, ShoppingBag } from 'lucide-react';

interface ProductGridProps {
  selectedCategoryId: string | null;
  stockFilter: 'all' | 'inStock' | 'lowStock';
}

export const ProductGrid: React.FC<ProductGridProps> = ({ selectedCategoryId, stockFilter }) => {
  const { products, searchQuery, addToCart, cart } = usePOS();

  const filteredProducts = products.filter((p) => {
    // Category match
    if (selectedCategoryId && p.categoryId !== selectedCategoryId) return false;

    // Stock filter match
    if (stockFilter === 'inStock' && p.stockQuantity <= 0) return false;
    if (stockFilter === 'lowStock' && p.stockQuantity > p.minStockLevel) return false;

    // Search Query match
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = p.name.toLowerCase().includes(q);
      const matchSku = p.sku.toLowerCase().includes(q);
      const matchBarcode = p.barcode.toLowerCase().includes(q);
      const matchCategory = p.categoryName.toLowerCase().includes(q);
      return matchName || matchSku || matchBarcode || matchCategory;
    }

    return true;
  });

  if (filteredProducts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-center space-y-3">
        <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center">
          <PackageX className="w-6 h-6" />
        </div>
        <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200">No Products Found</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs">
          Try searching for a different keyword, SKU, or clear your category filter.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
      {filteredProducts.map((product) => {
        const isOutOfStock = product.stockQuantity <= 0;
        const isLowStock = product.stockQuantity > 0 && product.stockQuantity <= product.minStockLevel;

        const cartItem = cart.find((i) => i.product.id === product.id);
        const inCartQuantity = cartItem ? cartItem.quantity : 0;

        return (
          <div
            key={product.id}
            onClick={() => !isOutOfStock && addToCart(product)}
            className={`group relative bg-white dark:bg-slate-900 border rounded-2xl overflow-hidden flex flex-col justify-between transition-all duration-200 ${
              isOutOfStock
                ? 'opacity-60 border-slate-200 dark:border-slate-800 cursor-not-allowed'
                : 'border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500 hover:shadow-lg cursor-pointer'
            }`}
          >
            {/* Image & Stock Badge Container */}
            <div className="relative aspect-4/3 w-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                onError={(e) => {
                  // Fallback image on broken URL
                  (e.target as HTMLImageElement).src =
                    'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=300&auto=format&fit=crop&q=80';
                }}
              />

              {/* In-Cart Badge */}
              {inCartQuantity > 0 && (
                <div className="absolute top-2 left-2 bg-indigo-600 text-white text-[11px] font-bold px-2 py-0.5 rounded-lg shadow-sm flex items-center gap-1">
                  <ShoppingBag className="w-3 h-3" />
                  <span>{inCartQuantity} in cart</span>
                </div>
              )}

              {/* Stock Status Badge */}
              <div className="absolute top-2 right-2">
                {isOutOfStock ? (
                  <span className="bg-rose-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-lg shadow-sm">
                    Out of Stock
                  </span>
                ) : isLowStock ? (
                  <span className="bg-amber-500 text-amber-950 text-[10px] font-bold px-2 py-0.5 rounded-lg shadow-sm flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    {product.stockQuantity} left
                  </span>
                ) : (
                  <span className="bg-slate-900/80 text-slate-200 text-[10px] font-medium px-2 py-0.5 rounded-lg backdrop-blur-xs">
                    {product.stockQuantity} {product.unit}
                  </span>
                )}
              </div>
            </div>

            {/* Content Details */}
            <div className="p-3 flex-1 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 block uppercase tracking-wider">
                  {product.categoryName}
                </span>
                <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-100 line-clamp-2 leading-tight mt-0.5 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {product.name}
                </h4>
              </div>

              {/* Price & Quick Add Button */}
              <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">
                    ${product.sellingPrice.toFixed(2)}
                  </span>
                  <span className="text-[10px] text-slate-400 block leading-none">/ {product.unit}</span>
                </div>

                <button
                  type="button"
                  disabled={isOutOfStock}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!isOutOfStock) addToCart(product);
                  }}
                  className={`w-7 h-7 rounded-xl flex items-center justify-center transition-all ${
                    isOutOfStock
                      ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      : 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 dark:hover:text-white shadow-xs'
                  }`}
                  title="Add to order"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
