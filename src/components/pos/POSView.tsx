import React, { useState } from 'react';
import { usePOS } from '../../context/POSContext';
import { ProductSearch } from './ProductSearch';
import { ProductGrid } from './ProductGrid';
import { CartPanel } from './CartPanel';
import { CheckoutModal } from './CheckoutModal';
import { Modal } from '../common/Modal';
import { UserPlus, Check } from 'lucide-react';

export const POSView: React.FC = () => {
  const { addCustomer, setSelectedCustomer } = usePOS();

  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [stockFilter, setStockFilter] = useState<'all' | 'inStock' | 'lowStock'>('all');

  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);

  // New Customer Form state
  const [custName, setCustName] = useState('');
  const [custPhone, setCustPhone] = useState('');
  const [custEmail, setCustEmail] = useState('');

  const handleCreateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!custName.trim()) return;

    const newCust = addCustomer({
      name: custName.trim(),
      phone: custPhone.trim() || 'N/A',
      email: custEmail.trim() || 'N/A',
    });

    setSelectedCustomer(newCust);
    setCustName('');
    setCustPhone('');
    setCustEmail('');
    setIsAddCustomerOpen(false);
  };

  return (
    <div className="h-[calc(100vh-4.5rem)] flex flex-col lg:flex-row gap-4 p-4 overflow-hidden">
      {/* Left Column: Product Search & Product Grid */}
      <div className="flex-1 flex flex-col gap-3 min-w-0 h-full overflow-hidden">
        <ProductSearch
          selectedCategoryId={selectedCategoryId}
          setSelectedCategoryId={setSelectedCategoryId}
          stockFilter={stockFilter}
          setStockFilter={setStockFilter}
        />

        <div className="flex-1 overflow-y-auto pr-1">
          <ProductGrid
            selectedCategoryId={selectedCategoryId}
            stockFilter={stockFilter}
          />
        </div>
      </div>

      {/* Right Column: Register Shopping Cart Panel */}
      <div className="w-full lg:w-96 shrink-0 h-full">
        <CartPanel
          onOpenCheckout={() => setIsCheckoutOpen(true)}
          onOpenAddCustomerModal={() => setIsAddCustomerOpen(true)}
        />
      </div>

      {/* Checkout Payment Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
      />

      {/* Inline Quick Add Customer Modal */}
      <Modal
        isOpen={isAddCustomerOpen}
        onClose={() => setIsAddCustomerOpen(false)}
        title="Add New Customer"
        subtitle="Quick registration at register counter"
        maxWidth="md"
      >
        <form onSubmit={handleCreateCustomer} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Customer Full Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Sarah Jenkins"
              value={custName}
              onChange={(e) => setCustName(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-slate-100"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                placeholder="+1 (555) 000-0000"
                value={custPhone}
                onChange={(e) => setCustPhone(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Email Address
              </label>
              <input
                type="email"
                placeholder="sarah@example.com"
                value={custEmail}
                onChange={(e) => setCustEmail(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAddCustomerOpen(false)}
              className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-sm"
            >
              <Check className="w-4 h-4" />
              <span>Save & Attach</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
