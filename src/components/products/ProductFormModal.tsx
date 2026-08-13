import React, { useState, useEffect } from 'react';
import { usePOS } from '../../context/POSContext';
import { Modal } from '../common/Modal';
import { Product } from '../../types';
import { Check, Package, Sparkles } from 'lucide-react';

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  productToEdit?: Product | null;
}

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  isOpen,
  onClose,
  productToEdit,
}) => {
  const { categories, addProduct, updateProduct } = usePOS();

  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [barcode, setBarcode] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('0.00');
  const [sellingPrice, setSellingPrice] = useState('0.00');
  const [stockQuantity, setStockQuantity] = useState('10');
  const [minStockLevel, setMinStockLevel] = useState('5');
  const [imageUrl, setImageUrl] = useState('');
  const [unit, setUnit] = useState('pcs');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (productToEdit) {
      setName(productToEdit.name);
      setSku(productToEdit.sku);
      setBarcode(productToEdit.barcode);
      setCategoryId(productToEdit.categoryId);
      setPurchasePrice(productToEdit.purchasePrice.toString());
      setSellingPrice(productToEdit.sellingPrice.toString());
      setStockQuantity(productToEdit.stockQuantity.toString());
      setMinStockLevel(productToEdit.minStockLevel.toString());
      setImageUrl(productToEdit.imageUrl);
      setUnit(productToEdit.unit || 'pcs');
      setDescription(productToEdit.description || '');
    } else {
      // Defaults for new product
      const randomSku = 'SKU-' + Math.floor(1000 + Math.random() * 9000);
      const randomBarcode = '890' + Math.floor(1000000 + Math.random() * 9000000);
      setName('');
      setSku(randomSku);
      setBarcode(randomBarcode);
      setCategoryId(categories[0]?.id || '');
      setPurchasePrice('5.00');
      setSellingPrice('12.99');
      setStockQuantity('20');
      setMinStockLevel('5');
      setImageUrl('https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&auto=format&fit=crop&q=80');
      setUnit('pcs');
      setDescription('');
    }
  }, [productToEdit, isOpen, categories]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const productData = {
      name: name.trim(),
      sku: sku.trim() || 'SKU-' + Date.now(),
      barcode: barcode.trim() || '89000' + Date.now(),
      categoryId: categoryId || categories[0]?.id || 'cat-1',
      categoryName: categories.find((c) => c.id === categoryId)?.name || 'General',
      purchasePrice: parseFloat(purchasePrice) || 0,
      sellingPrice: parseFloat(sellingPrice) || 0,
      stockQuantity: parseInt(stockQuantity, 10) || 0,
      minStockLevel: parseInt(minStockLevel, 10) || 0,
      imageUrl: imageUrl.trim() || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&auto=format&fit=crop&q=80',
      unit: unit.trim() || 'pcs',
      description: description.trim(),
    };

    if (productToEdit) {
      updateProduct(productToEdit.id, productData);
    } else {
      addProduct(productData);
    }

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={productToEdit ? 'Edit Product' : 'Add New Product'}
      subtitle="Fill in item details, pricing, and initial stock level"
      maxWidth="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name & Category */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Product Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Premium Cotton Shirt"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-slate-100"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Category *
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-slate-100"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* SKU, Barcode, Unit */}
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">SKU</label>
            <input
              type="text"
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              className="w-full px-3.5 py-2 text-sm font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-slate-100"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Barcode</label>
            <input
              type="text"
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
              className="w-full px-3.5 py-2 text-sm font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-slate-100"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Unit</label>
            <select
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-slate-100"
            >
              <option value="pcs">pcs</option>
              <option value="bottle">bottle</option>
              <option value="pack">pack</option>
              <option value="box">box</option>
              <option value="kg">kg</option>
              <option value="bar">bar</option>
              <option value="tube">tube</option>
            </select>
          </div>
        </div>

        {/* Pricing: Purchase & Selling Price */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700">
          <div>
            <label className="text-[11px] font-bold uppercase text-slate-500 block mb-1">Cost Price ($)</label>
            <input
              type="number"
              step="0.01"
              value={purchasePrice}
              onChange={(e) => setPurchasePrice(e.target.value)}
              className="w-full px-3 py-1.5 text-sm font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-slate-100"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold uppercase text-indigo-600 dark:text-indigo-400 block mb-1">
              Selling Price ($) *
            </label>
            <input
              type="number"
              step="0.01"
              required
              value={sellingPrice}
              onChange={(e) => setSellingPrice(e.target.value)}
              className="w-full px-3 py-1.5 text-sm font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-slate-100"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold uppercase text-slate-500 block mb-1">Initial Stock</label>
            <input
              type="number"
              min="0"
              value={stockQuantity}
              onChange={(e) => setStockQuantity(e.target.value)}
              className="w-full px-3 py-1.5 text-sm font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-slate-100"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold uppercase text-amber-600 dark:text-amber-400 block mb-1">
              Min Alert Stock
            </label>
            <input
              type="number"
              min="0"
              value={minStockLevel}
              onChange={(e) => setMinStockLevel(e.target.value)}
              className="w-full px-3 py-1.5 text-sm font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-slate-100"
            />
          </div>
        </div>

        {/* Image URL */}
        <div>
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
            Product Image URL
          </label>
          <input
            type="url"
            placeholder="https://images.unsplash.com/..."
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-slate-100"
          />
        </div>

        {/* Description */}
        <div>
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Description</label>
          <textarea
            rows={2}
            placeholder="Item specifications or details..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-slate-100"
          />
        </div>

        {/* Actions */}
        <div className="pt-2 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex items-center gap-2 px-5 py-2 text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-sm"
          >
            <Check className="w-4 h-4" />
            <span>{productToEdit ? 'Save Changes' : 'Create Product'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
