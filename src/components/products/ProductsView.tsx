import React, { useState } from 'react';
import { usePOS } from '../../context/POSContext';
import { Product } from '../../types';
import { ProductFormModal } from './ProductFormModal';
import { Modal } from '../common/Modal';
import {
  Package,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  AlertTriangle,
  PlusCircle,
  MinusCircle,
  TrendingUp,
  LayoutGrid,
  List,
} from 'lucide-react';

export const ProductsView: React.FC = () => {
  const { products, categories, deleteProduct, adjustStock, searchQuery, setSearchQuery } = usePOS();

  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [onlyLowStock, setOnlyLowStock] = useState<boolean>(false);
  const [viewStyle, setViewStyle] = useState<'table' | 'grid'>('table');

  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);

  // Stock Adjust Modal State
  const [adjustingProduct, setAdjustingProduct] = useState<Product | null>(null);
  const [stockDelta, setStockDelta] = useState<number>(5);

  // Deleting Confirm Modal State
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null);

  // Filter logic
  const filteredProducts = products.filter((p) => {
    if (selectedCategoryId && p.categoryId !== selectedCategoryId) return false;
    if (onlyLowStock && p.stockQuantity > p.minStockLevel) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      return (
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.barcode.toLowerCase().includes(q) ||
        p.categoryName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Calculate Inventory Financial Metrics
  const totalItemsCount = products.length;
  const totalStockUnits = products.reduce((sum, p) => sum + p.stockQuantity, 0);
  const totalInventoryCost = products.reduce((sum, p) => sum + p.purchasePrice * p.stockQuantity, 0);
  const totalRetailValue = products.reduce((sum, p) => sum + p.sellingPrice * p.stockQuantity, 0);
  const lowStockCount = products.filter((p) => p.stockQuantity <= p.minStockLevel).length;

  const handleOpenEdit = (p: Product) => {
    setProductToEdit(p);
    setIsFormOpen(true);
  };

  const handleOpenCreate = () => {
    setProductToEdit(null);
    setIsFormOpen(true);
  };

  const handleConfirmStockAdjust = () => {
    if (adjustingProduct && stockDelta !== 0) {
      adjustStock(adjustingProduct.id, stockDelta);
      setAdjustingProduct(null);
    }
  };

  const handleConfirmDelete = () => {
    if (deletingProductId) {
      deleteProduct(deletingProductId);
      setDeletingProductId(null);
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Inventory Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Products</span>
          <div className="text-xl font-extrabold text-slate-900 dark:text-white mt-0.5">{totalItemsCount} items</div>
          <span className="text-[10px] text-slate-500">{totalStockUnits} total units in stock</span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Inventory Valuation</span>
          <div className="text-xl font-extrabold text-slate-900 dark:text-white mt-0.5">${totalInventoryCost.toFixed(2)}</div>
          <span className="text-[10px] text-slate-500">At cost price</span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Retail Potential</span>
          <div className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5">${totalRetailValue.toFixed(2)}</div>
          <span className="text-[10px] text-slate-500">At selling price</span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Stock Alerts</span>
          <div className="text-xl font-extrabold text-amber-600 dark:text-amber-400 mt-0.5">{lowStockCount} items</div>
          <span className="text-[10px] text-slate-500">At or below min level</span>
        </div>
      </div>

      {/* Action Header & Search Controls */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search product, SKU, barcode..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-slate-100"
            />
          </div>

          {/* Action Buttons & View Mode Toggle */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              <button
                onClick={() => setViewStyle('table')}
                className={`p-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  viewStyle === 'table'
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs'
                    : 'text-slate-400'
                }`}
                title="Table View"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewStyle('grid')}
                className={`p-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  viewStyle === 'grid'
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs'
                    : 'text-slate-400'
                }`}
                title="Grid Cards View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={handleOpenCreate}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Product</span>
            </button>
          </div>
        </div>

        {/* Filter Badges Bar */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          <span className="text-slate-400 font-medium">Category:</span>
          <button
            onClick={() => setSelectedCategoryId(null)}
            className={`px-3 py-1 rounded-xl transition-colors ${
              selectedCategoryId === null
                ? 'bg-indigo-600 text-white font-semibold'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
            }`}
          >
            All
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCategoryId(c.id)}
              className={`px-3 py-1 rounded-xl transition-colors ${
                selectedCategoryId === c.id
                  ? 'bg-indigo-600 text-white font-semibold'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              {c.name}
            </button>
          ))}

          <button
            onClick={() => setOnlyLowStock(!onlyLowStock)}
            className={`ml-auto flex items-center gap-1.5 px-3 py-1 rounded-xl font-semibold border transition-colors ${
              onlyLowStock
                ? 'bg-amber-500 text-amber-950 border-amber-500'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Low Stock Filter</span>
          </button>
        </div>
      </div>

      {/* Main Content Display (Table or Grid) */}
      {filteredProducts.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-3">
          <Package className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto" />
          <h4 className="text-base font-semibold text-slate-800 dark:text-slate-200">No Inventory Items Found</h4>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Try resetting search filters or click "Add Product" to create your first item.
          </p>
        </div>
      ) : viewStyle === 'table' ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-400 font-semibold uppercase">
                <tr>
                  <th className="p-3.5">Product</th>
                  <th className="p-3.5">SKU & Barcode</th>
                  <th className="p-3.5">Category</th>
                  <th className="p-3.5">Cost Price</th>
                  <th className="p-3.5">Selling Price</th>
                  <th className="p-3.5">Stock Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredProducts.map((p) => {
                  const marginPercent = p.sellingPrice > 0 ? (((p.sellingPrice - p.purchasePrice) / p.sellingPrice) * 100).toFixed(0) : '0';
                  const isOutOfStock = p.stockQuantity <= 0;
                  const isLowStock = p.stockQuantity > 0 && p.stockQuantity <= p.minStockLevel;

                  return (
                    <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      {/* Product Thumbnail & Name */}
                      <td className="p-3.5">
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={p.imageUrl}
                            alt={p.name}
                            className="w-10 h-10 rounded-xl object-cover bg-slate-100 dark:bg-slate-800 shrink-0"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&auto=format&fit=crop&q=80';
                            }}
                          />
                          <div className="min-w-0">
                            <h4 className="font-bold text-slate-900 dark:text-white truncate">{p.name}</h4>
                            <p className="text-[10px] text-slate-400 line-clamp-1">{p.description || 'No description'}</p>
                          </div>
                        </div>
                      </td>

                      {/* SKU & Barcode */}
                      <td className="p-3.5 font-mono text-slate-600 dark:text-slate-300">
                        <div className="font-semibold">{p.sku}</div>
                        <div className="text-[10px] text-slate-400">{p.barcode}</div>
                      </td>

                      {/* Category */}
                      <td className="p-3.5">
                        <span className="px-2.5 py-1 text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg">
                          {p.categoryName}
                        </span>
                      </td>

                      {/* Cost */}
                      <td className="p-3.5 font-semibold text-slate-600 dark:text-slate-400">
                        ${p.purchasePrice.toFixed(2)}
                      </td>

                      {/* Selling Price & Margin */}
                      <td className="p-3.5">
                        <div className="font-bold text-slate-900 dark:text-white">${p.sellingPrice.toFixed(2)}</div>
                        <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                          {marginPercent}% margin
                        </div>
                      </td>

                      {/* Stock Level */}
                      <td className="p-3.5">
                        {isOutOfStock ? (
                          <span className="px-2.5 py-1 text-[11px] font-bold bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 rounded-lg">
                            Out of Stock (0)
                          </span>
                        ) : isLowStock ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-400 rounded-lg">
                            <AlertTriangle className="w-3 h-3" />
                            Low Stock ({p.stockQuantity} {p.unit})
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 rounded-lg">
                            In Stock ({p.stockQuantity} {p.unit})
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => {
                              setAdjustingProduct(p);
                              setStockDelta(5);
                            }}
                            className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                            title="Adjust Stock Quantity"
                          >
                            <TrendingUp className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleOpenEdit(p)}
                            className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                            title="Edit Product"
                          >
                            <Edit className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => setDeletingProductId(p.id)}
                            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                            title="Delete Product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Grid View Layout */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredProducts.map((p) => (
            <div
              key={p.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden p-4 flex flex-col justify-between shadow-xs space-y-3"
            >
              <div className="flex items-start gap-3">
                <img
                  src={p.imageUrl}
                  alt={p.name}
                  className="w-14 h-14 rounded-xl object-cover bg-slate-100 dark:bg-slate-800 shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] font-semibold text-slate-400 block uppercase">{p.categoryName}</span>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate">{p.name}</h4>
                  <p className="text-[11px] font-mono text-slate-500">{p.sku}</p>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100 dark:border-slate-800">
                <div>
                  <span className="text-[10px] text-slate-400 block">Price</span>
                  <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                    ${p.sellingPrice.toFixed(2)}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 block">Stock</span>
                  <span
                    className={`font-bold ${
                      p.stockQuantity <= 0
                        ? 'text-rose-600'
                        : p.stockQuantity <= p.minStockLevel
                        ? 'text-amber-600'
                        : 'text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    {p.stockQuantity} {p.unit}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => {
                    setAdjustingProduct(p);
                    setStockDelta(5);
                  }}
                  className="flex-1 py-1.5 text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950 text-slate-700 dark:text-slate-200 hover:text-indigo-600 rounded-xl transition-colors"
                >
                  Restock
                </button>
                <button
                  onClick={() => handleOpenEdit(p)}
                  className="p-1.5 text-slate-500 hover:text-indigo-600 bg-slate-100 dark:bg-slate-800 rounded-xl"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setDeletingProductId(p.id)}
                  className="p-1.5 text-slate-500 hover:text-rose-600 bg-slate-100 dark:bg-slate-800 rounded-xl"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Product Add/Edit Form Modal */}
      <ProductFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        productToEdit={productToEdit}
      />

      {/* Quick Stock Adjustment Modal */}
      <Modal
        isOpen={!!adjustingProduct}
        onClose={() => setAdjustingProduct(null)}
        title="Quick Stock Adjustment"
        subtitle={adjustingProduct ? `Updating inventory for ${adjustingProduct.name}` : ''}
        maxWidth="sm"
      >
        <div className="space-y-4">
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-xs space-y-1">
            <p className="text-slate-500">
              Current Stock: <strong className="text-slate-900 dark:text-white">{adjustingProduct?.stockQuantity} {adjustingProduct?.unit}</strong>
            </p>
            <p className="text-slate-500">
              New Total will be: <strong className="text-indigo-600 dark:text-indigo-400 font-bold">{Math.max(0, (adjustingProduct?.stockQuantity || 0) + stockDelta)} {adjustingProduct?.unit}</strong>
            </p>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Quantity Delta (+ to add, - to reduce)
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setStockDelta((prev) => prev - 1)}
                className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl font-bold"
              >
                <MinusCircle className="w-5 h-5 text-rose-500" />
              </button>
              <input
                type="number"
                value={stockDelta}
                onChange={(e) => setStockDelta(parseInt(e.target.value, 10) || 0)}
                className="w-full text-center py-2 text-base font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
              />
              <button
                type="button"
                onClick={() => setStockDelta((prev) => prev + 1)}
                className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl font-bold"
              >
                <PlusCircle className="w-5 h-5 text-emerald-500" />
              </button>
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              onClick={() => setAdjustingProduct(null)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmStockAdjust}
              className="px-4 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-sm"
            >
              Apply Adjustment
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deletingProductId}
        onClose={() => setDeletingProductId(null)}
        title="Delete Product?"
        subtitle="This action cannot be undone."
        maxWidth="sm"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600 dark:text-slate-300">
            Are you sure you want to permanently remove this item from your retail database?
          </p>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setDeletingProductId(null)}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmDelete}
              className="px-4 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-sm"
            >
              Confirm Delete
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
