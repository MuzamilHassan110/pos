import React, { useState, useEffect } from 'react';
import { usePOS } from '../../context/POSContext';
import { Modal } from '../common/Modal';
import { PaymentMethod } from '../../types';
import { Banknote, CreditCard, Wallet, DollarSign, Check, Tag } from 'lucide-react';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose }) => {
  const {
    getCartSubtotal,
    getCartTax,
    getCartGrandTotal,
    processCheckout,
    selectedCustomer,
    cart,
  } = usePOS();

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [overallDiscount, setOverallDiscount] = useState<string>('0');
  const [amountPaid, setAmountPaid] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  const discountNum = parseFloat(overallDiscount) || 0;
  const grandTotal = getCartGrandTotal(discountNum);
  const tenderedNum = parseFloat(amountPaid) || 0;
  const changeDue = Math.max(0, tenderedNum - grandTotal);

  // Default tendered amount to grand total or nearest round number when modal opens
  useEffect(() => {
    if (isOpen) {
      setAmountPaid(grandTotal.toFixed(2));
      setOverallDiscount('0');
      setNotes('');
    }
  }, [isOpen, grandTotal]);

  if (!isOpen) return null;

  const handleQuickTender = (val: number) => {
    setAmountPaid(val.toFixed(2));
  };

  const handleComplete = (e: React.FormEvent) => {
    e.preventDefault();
    if (paymentMethod === 'cash' && tenderedNum < grandTotal) {
      return;
    }
    const finalTendered = paymentMethod === 'cash' ? tenderedNum : grandTotal;
    const sale = processCheckout(paymentMethod, finalTendered, discountNum, notes);
    if (sale) {
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Complete Payment"
      subtitle={`Processing order for ${cart.reduce((s, i) => s + i.quantity, 0)} items`}
      maxWidth="lg"
    >
      <form onSubmit={handleComplete} className="space-y-5">
        {/* Total Summary Header Card */}
        <div className="p-4 bg-gradient-to-br from-indigo-900 to-slate-900 text-white rounded-2xl shadow-lg flex items-center justify-between">
          <div>
            <span className="text-xs text-indigo-200 uppercase font-bold tracking-wider block">Grand Total Due</span>
            <div className="text-3xl font-extrabold tracking-tight mt-0.5">${grandTotal.toFixed(2)}</div>
            {selectedCustomer && (
              <p className="text-xs text-indigo-200 mt-1">Customer: {selectedCustomer.name}</p>
            )}
          </div>

          {/* Overall Discount Input */}
          <div className="text-right">
            <label className="text-[11px] text-indigo-200 block font-medium mb-1 flex items-center justify-end gap-1">
              <Tag className="w-3 h-3" />
              <span>Order Discount ($)</span>
            </label>
            <input
              type="number"
              min="0"
              max={getCartSubtotal()}
              step="0.5"
              value={overallDiscount}
              onChange={(e) => setOverallDiscount(e.target.value)}
              className="w-24 text-right px-2.5 py-1 text-sm bg-indigo-950/80 border border-indigo-700/80 rounded-xl text-white font-bold focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>
        </div>

        {/* Payment Method Selector */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400">Select Payment Method</label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => {
                setPaymentMethod('cash');
                setAmountPaid(grandTotal.toFixed(2));
              }}
              className={`p-3.5 rounded-xl border flex flex-col items-center gap-1.5 font-semibold text-xs transition-all ${
                paymentMethod === 'cash'
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-indigo-300'
              }`}
            >
              <Banknote className="w-5 h-5" />
              <span>Cash</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setPaymentMethod('card');
                setAmountPaid(grandTotal.toFixed(2));
              }}
              className={`p-3.5 rounded-xl border flex flex-col items-center gap-1.5 font-semibold text-xs transition-all ${
                paymentMethod === 'card'
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-indigo-300'
              }`}
            >
              <CreditCard className="w-5 h-5" />
              <span>Credit/Debit Card</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setPaymentMethod('other');
                setAmountPaid(grandTotal.toFixed(2));
              }}
              className={`p-3.5 rounded-xl border flex flex-col items-center gap-1.5 font-semibold text-xs transition-all ${
                paymentMethod === 'other'
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-indigo-300'
              }`}
            >
              <Wallet className="w-5 h-5" />
              <span>Mobile / Other</span>
            </button>
          </div>
        </div>

        {/* Payment Details Section */}
        {paymentMethod === 'cash' ? (
          <div className="space-y-3 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
            {/* Quick Tender Preset Buttons */}
            <div>
              <span className="text-[11px] font-bold text-slate-500 uppercase block mb-1.5">Quick Tender Presets</span>
              <div className="flex flex-wrap gap-2">
                {[grandTotal, 10, 20, 50, 100].map((amt, idx) => {
                  if (idx > 0 && amt < grandTotal) return null; // Don't show less than grand total
                  return (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => handleQuickTender(amt)}
                      className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition-all ${
                        tenderedNum === amt
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-indigo-400'
                      }`}
                    >
                      {idx === 0 ? `Exact ($${amt.toFixed(2)})` : `$${amt}`}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Cash Tender Input & Change Calculation */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Cash Tendered ($)
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="number"
                    step="0.01"
                    min={grandTotal}
                    value={amountPaid}
                    onChange={(e) => setAmountPaid(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-base font-bold bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Change Due ($)
                </label>
                <div className="px-3 py-2 text-base font-bold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 rounded-xl">
                  ${changeDue.toFixed(2)}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 text-center space-y-2">
            <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto">
              <CreditCard className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Ready for Card Terminal
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
              Swipe, tap, or insert customer card on the POS terminal for ${grandTotal.toFixed(2)}.
            </p>
          </div>
        )}

        {/* Optional Order Notes */}
        <div>
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
            Optional Notes / Reference
          </label>
          <input
            type="text"
            placeholder="e.g., Auth code, gift receipt, special requests..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-slate-100"
          />
        </div>

        {/* Form Actions */}
        <div className="pt-2 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={paymentMethod === 'cash' && tenderedNum < grandTotal}
            className={`flex items-center gap-2 px-6 py-2.5 font-bold text-sm text-white rounded-xl shadow-md transition-all ${
              paymentMethod === 'cash' && tenderedNum < grandTotal
                ? 'bg-slate-400 cursor-not-allowed shadow-none'
                : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/30'
            }`}
          >
            <Check className="w-4 h-4" />
            <span>FINALIZE SALE & PRINT RECEIPT</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
