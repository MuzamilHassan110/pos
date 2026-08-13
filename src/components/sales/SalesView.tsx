import React, { useState } from 'react';
import { usePOS } from '../../context/POSContext';
import { Sale } from '../../types';
import { Modal } from '../common/Modal';
import {
  Receipt,
  Search,
  Printer,
  RotateCcw,
  Eye,
  Filter,
  CheckCircle,
  XCircle,
  Calendar,
  CreditCard,
  Banknote,
} from 'lucide-react';

export const SalesView: React.FC = () => {
  const { sales, refundSale, setActiveReceiptModalSale } = usePOS();

  const [searchQuery, setSearchQuery] = useState('');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const [refundingSaleId, setRefundingSaleId] = useState<string | null>(null);

  const filteredSales = sales.filter((s) => {
    if (paymentFilter !== 'all' && s.paymentMethod !== paymentFilter) return false;
    if (statusFilter !== 'all' && s.status !== statusFilter) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchInv = s.invoiceNumber.toLowerCase().includes(q);
      const matchCust = (s.customerName || '').toLowerCase().includes(q);
      const matchCashier = (s.cashierName || '').toLowerCase().includes(q);
      return matchInv || matchCust || matchCashier;
    }
    return true;
  });

  const handleConfirmRefund = () => {
    if (refundingSaleId) {
      refundSale(refundingSaleId);
      setRefundingSaleId(null);
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Sales & Invoices History</h3>
          <p className="text-xs text-slate-500">Track receipts, payment methods, and process refunds</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Search Box */}
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search invoice #, customer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-slate-100"
            />
          </div>

          {/* Payment Method Filter */}
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="px-3 py-2 text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="all">All Payments</option>
            <option value="cash">Cash Only</option>
            <option value="card">Card Only</option>
            <option value="other">Mobile/Other</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="completed">Completed</option>
            <option value="refunded">Refunded</option>
          </select>
        </div>
      </div>

      {/* Sales Log Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-400 font-semibold uppercase">
              <tr>
                <th className="p-3.5">Invoice #</th>
                <th className="p-3.5">Date & Time</th>
                <th className="p-3.5">Customer</th>
                <th className="p-3.5">Items Purchased</th>
                <th className="p-3.5">Total Amount</th>
                <th className="p-3.5">Payment</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredSales.map((sale) => {
                const totalUnits = sale.items.reduce((sum, item) => sum + item.quantity, 0);
                const isRefunded = sale.status === 'refunded';

                return (
                  <tr key={sale.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    {/* Invoice */}
                    <td className="p-3.5 font-bold text-slate-900 dark:text-white">
                      {sale.invoiceNumber}
                      <span className="block text-[10px] text-slate-400 font-normal">By {sale.cashierName}</span>
                    </td>

                    {/* Date */}
                    <td className="p-3.5 text-slate-600 dark:text-slate-300">
                      {new Date(sale.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>

                    {/* Customer */}
                    <td className="p-3.5 font-medium text-slate-800 dark:text-slate-200">
                      {sale.customerName || 'Walk-in Customer'}
                    </td>

                    {/* Items */}
                    <td className="p-3.5 text-slate-600 dark:text-slate-300">
                      <div className="font-semibold">{totalUnits} units ({sale.items.length} line items)</div>
                      <div className="text-[10px] text-slate-400 truncate max-w-xs">
                        {sale.items.map((i) => i.productName).join(', ')}
                      </div>
                    </td>

                    {/* Total Amount */}
                    <td className="p-3.5 font-extrabold text-indigo-600 dark:text-indigo-400 text-sm">
                      ${sale.grandTotal.toFixed(2)}
                    </td>

                    {/* Payment Method */}
                    <td className="p-3.5">
                      <span className="px-2.5 py-1 text-[10px] font-bold uppercase bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg">
                        {sale.paymentMethod}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="p-3.5">
                      {isRefunded ? (
                        <span className="px-2.5 py-1 text-[10px] font-bold uppercase bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 rounded-lg">
                          Refunded
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 text-[10px] font-bold uppercase bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-400 rounded-lg">
                          Completed
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setActiveReceiptModalSale(sale)}
                          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 rounded-lg transition-colors"
                          title="View & Print Thermal Receipt"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {!isRefunded && (
                          <button
                            onClick={() => setRefundingSaleId(sale.id)}
                            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                            title="Refund & Restock Items"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Refund Confirmation Modal */}
      <Modal
        isOpen={!!refundingSaleId}
        onClose={() => setRefundingSaleId(null)}
        title="Issue Refund & Restock Items?"
        subtitle="This transaction will be marked as refunded"
        maxWidth="sm"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600 dark:text-slate-300">
            Refunding this sale will automatically restore all item quantities back into active store inventory.
          </p>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setRefundingSaleId(null)}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmRefund}
              className="px-4 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-sm"
            >
              Process Refund
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
