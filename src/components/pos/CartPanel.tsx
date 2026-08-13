import React, { useState } from 'react';
import { usePOS } from '../../context/POSContext';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  UserPlus,
  UserCheck,
  X,
  CreditCard,
  Percent,
  ChevronDown,
} from 'lucide-react';

interface CartPanelProps {
  onOpenCheckout: () => void;
  onOpenAddCustomerModal: () => void;
}

export const CartPanel: React.FC<CartPanelProps> = ({
  onOpenCheckout,
  onOpenAddCustomerModal,
}) => {
  const {
    cart,
    updateCartQuantity,
    updateCartItemDiscount,
    removeFromCart,
    clearCart,
    getCartSubtotal,
    getCartTax,
    getCartGrandTotal,
    customers,
    selectedCustomer,
    setSelectedCustomer,
    settings,
  } = usePOS();

  const [activeDiscountItem, setActiveDiscountItem] = useState<string | null>(null);

  const subtotal = getCartSubtotal();
  const tax = getCartTax();
  const grandTotal = getCartGrandTotal();

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col h-full shadow-xs overflow-hidden max-w-full">
      {/* Cart Header & Customer Selector */}
      <div className="p-3 sm:p-4 border-b border-slate-100 dark:border-slate-800 space-y-3 bg-slate-50/50 dark:bg-slate-900/50">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <ShoppingBag className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0" />
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 truncate">Current Order</h3>
            <span className="px-2 py-0.5 text-[10px] sm:text-xs font-semibold bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 rounded-full shrink-0">
              {cart.reduce((s, i) => s + i.quantity, 0)} items
            </span>
          </div>

          {cart.length > 0 && (
            <button
              onClick={clearCart}
              className="text-[11px] sm:text-xs text-rose-500 hover:text-rose-700 font-medium flex items-center gap-1 hover:bg-rose-50 dark:hover:bg-rose-950/40 px-2 py-1 rounded-lg transition-colors shrink-0"
              title="Clear entire cart (Esc)"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          )}
        </div>

        {/* Customer Attachment Bar */}
        <div className="flex items-center justify-between gap-2 bg-slate-50 dark:bg-slate-800 p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs shadow-sm">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <UserCheck className="w-4 h-4 text-slate-400 shrink-0" />
            <div className="relative flex-1 min-w-0">
              <select
                value={selectedCustomer ? selectedCustomer.id : ''}
                onChange={(e) => {
                  const found = customers.find((c) => c.id === e.target.value);
                  setSelectedCustomer(found || null);
                }}
                className="appearance-none w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-2 pr-8 font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 truncate cursor-pointer shadow-sm"
              >
                <option value="">-- Walk-in / Guest Customer --</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.phone})
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-2.5 flex items-center text-slate-500 dark:text-slate-400">
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                  <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>

          <button
            onClick={onOpenAddCustomerModal}
            className="p-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-indigo-50 dark:hover:bg-indigo-950 hover:text-indigo-600 rounded-lg text-slate-600 dark:text-slate-300 transition-colors shrink-0"
            title="Add New Customer"
          >
            <UserPlus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Cart Line Items List */}
      <div className="flex-1 overflow-y-auto p-4 divide-y divide-slate-100 dark:divide-slate-800 space-y-3">
        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-12 text-center text-slate-400">
            <ShoppingBag className="w-12 h-12 stroke-1 text-slate-300 dark:text-slate-700 mb-2" />
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Your cart is empty</p>
            <p className="text-xs text-slate-400 max-w-xs mt-1">
              Select products on the left or scan barcode to build order.
            </p>
          </div>
        ) : (
          cart.map((item) => {
            const lineTotal = item.product.sellingPrice * (1 - item.discount / 100) * item.quantity;
            return (
              <div key={item.product.id} className="pt-3 first:pt-0 space-y-2">
                <div className="flex items-start gap-3">
                  <img
                    src={item.product.imageUrl}
                    alt={item.product.name}
                    className="w-12 h-12 rounded-xl object-cover bg-slate-100 dark:bg-slate-800 shrink-0"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=300&auto=format&fit=crop&q=80';
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
                      {item.product.name}
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      ${item.product.sellingPrice.toFixed(2)} / {item.product.unit}
                    </p>

                    {item.discount > 0 && (
                      <span className="inline-block mt-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded">
                        {item.discount}% Off applied
                      </span>
                    )}
                  </div>

                  {/* Delete Item */}
                  <button
                    onClick={() => removeFromCart(item.product.id)}
                    className="p-1 text-slate-300 hover:text-rose-500 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Controls & Line Total */}
                <div className="flex items-center justify-between pt-1">
                  {/* Quantity Counter */}
                  <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-800 text-xs">
                    <button
                      onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                      className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-3 font-semibold text-slate-900 dark:text-slate-100">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                      className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Discount Popover Toggle */}
                  <div className="relative">
                    <button
                      onClick={() =>
                        setActiveDiscountItem(activeDiscountItem === item.product.id ? null : item.product.id)
                      }
                      className="text-[11px] font-medium text-slate-500 dark:text-slate-400 hover:text-indigo-600 flex items-center gap-1"
                    >
                      <Percent className="w-3 h-3" />
                      <span>{item.discount > 0 ? `${item.discount}%` : 'Disc'}</span>
                    </button>

                    {activeDiscountItem === item.product.id && (
                      <div className="absolute right-0 bottom-full mb-1 w-44 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg p-2.5 z-20 space-y-2">
                        <span className="text-[10px] font-bold uppercase text-slate-400 block">Item Discount %</span>
                        <div className="flex gap-1">
                          {[0, 5, 10, 15, 20].map((d) => (
                            <button
                              key={d}
                              onClick={() => {
                                updateCartItemDiscount(item.product.id, d);
                                setActiveDiscountItem(null);
                              }}
                              className={`flex-1 py-1 text-xs font-semibold rounded-lg border ${
                                item.discount === d
                                  ? 'bg-indigo-600 text-white border-indigo-600'
                                  : 'bg-slate-50 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-600'
                              }`}
                            >
                              {d}%
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Subtotal line */}
                  <div className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    ${lineTotal.toFixed(2)}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Cart Summary & Checkout Trigger */}
      <div className="p-4 bg-slate-50 dark:bg-slate-900/80 border-t border-slate-200 dark:border-slate-800 space-y-3">
        <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Tax ({settings.taxRate}%):</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">${tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-base font-bold text-slate-900 dark:text-white pt-2 border-t border-slate-200 dark:border-slate-800">
            <span>TOTAL:</span>
            <span className="text-indigo-600 dark:text-indigo-400">${grandTotal.toFixed(2)}</span>
          </div>
        </div>

        <button
          disabled={cart.length === 0}
          onClick={onOpenCheckout}
          className={`w-full py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-all ${
            cart.length === 0
              ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed shadow-none'
              : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/30'
          }`}
        >
          <CreditCard className="w-5 h-5" />
          <span>PROCEED TO PAYMENT</span>
          <kbd className="ml-2 px-1.5 py-0.5 text-[10px] bg-emerald-700 text-emerald-100 rounded">
            F2
          </kbd>
        </button>
      </div>
    </div>
  );
};
