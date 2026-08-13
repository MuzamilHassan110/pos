import React, { useState } from 'react';
import { usePOS } from '../../context/POSContext';
import { Customer, Sale } from '../../types';
import { Modal } from '../common/Modal';
import {
  Users,
  Search,
  UserPlus,
  Edit,
  Trash2,
  Receipt,
  Phone,
  Mail,
  ShoppingBag,
  DollarSign,
  Calendar,
  Check,
  Eye,
} from 'lucide-react';

export const CustomersView: React.FC = () => {
  const {
    customers,
    sales,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    setActiveReceiptModalSale,
  } = usePOS();

  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  // Detail / Purchase History Modal State
  const [viewingCustomer, setViewingCustomer] = useState<Customer | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');

  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filteredCustomers = customers.filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      c.name.toLowerCase().includes(q) ||
      c.phone.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q)
    );
  });

  const handleOpenCreate = () => {
    setEditingCustomer(null);
    setName('');
    setPhone('');
    setEmail('');
    setAddress('');
    setNotes('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (c: Customer) => {
    setEditingCustomer(c);
    setName(c.name);
    setPhone(c.phone);
    setEmail(c.email);
    setAddress(c.address || '');
    setNotes(c.notes || '');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingCustomer) {
      updateCustomer(editingCustomer.id, {
        name: name.trim(),
        phone: phone.trim() || 'N/A',
        email: email.trim() || 'N/A',
        address: address.trim(),
        notes: notes.trim(),
      });
    } else {
      addCustomer({
        name: name.trim(),
        phone: phone.trim() || 'N/A',
        email: email.trim() || 'N/A',
        address: address.trim(),
        notes: notes.trim(),
      });
    }

    setIsModalOpen(false);
  };

  const customerSales = viewingCustomer
    ? sales.filter((s) => s.customerId === viewingCustomer.id)
    : [];

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Search & Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Customer Directory</h3>
          <p className="text-xs text-slate-500">Manage customer records and purchase activity</p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, phone, email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-slate-100"
            />
          </div>

          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-sm transition-colors shrink-0"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Customer</span>
          </button>
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-400 font-semibold uppercase">
              <tr>
                <th className="p-3.5">Customer Name</th>
                <th className="p-3.5">Contact Info</th>
                <th className="p-3.5">Total Orders</th>
                <th className="p-3.5">Total Spent</th>
                <th className="p-3.5">Last Visit</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredCustomers.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="p-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-bold flex items-center justify-center text-xs shrink-0">
                        {c.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-white">{c.name}</h4>
                        {c.notes && <p className="text-[10px] text-slate-400 truncate max-w-xs">{c.notes}</p>}
                      </div>
                    </div>
                  </td>

                  <td className="p-3.5 text-slate-600 dark:text-slate-300">
                    <div className="flex items-center gap-1 text-[11px]">
                      <Phone className="w-3 h-3 text-slate-400" />
                      <span>{c.phone}</span>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-0.5">
                      <Mail className="w-3 h-3 text-slate-400" />
                      <span>{c.email}</span>
                    </div>
                  </td>

                  <td className="p-3.5 font-bold text-slate-800 dark:text-slate-200">
                    {c.purchaseCount} orders
                  </td>

                  <td className="p-3.5 font-extrabold text-emerald-600 dark:text-emerald-400">
                    ${c.totalPurchases.toFixed(2)}
                  </td>

                  <td className="p-3.5 text-slate-500">
                    {c.lastPurchaseDate
                      ? new Date(c.lastPurchaseDate).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })
                      : 'Never'}
                  </td>

                  <td className="p-3.5 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => setViewingCustomer(c)}
                        className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 rounded-lg transition-colors"
                        title="View Purchase History"
                      >
                        <Receipt className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleOpenEdit(c)}
                        className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                        title="Edit Customer"
                      >
                        <Edit className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => setDeletingId(c.id)}
                        className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                        title="Delete Customer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Form Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCustomer ? 'Edit Customer' : 'Add New Customer'}
        subtitle="Maintain accurate contact and marketing notes"
        maxWidth="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Full Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Jessica Alba"
              value={name}
              onChange={(e) => setName(e.target.value)}
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
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Email Address
              </label>
              <input
                type="email"
                placeholder="jessica@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Address
            </label>
            <input
              type="text"
              placeholder="Street address, City, State"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-slate-100"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Notes
            </label>
            <textarea
              rows={2}
              placeholder="VIP preferences, special instructions..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-slate-100"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-sm"
            >
              <Check className="w-4 h-4" />
              <span>Save Record</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* View Customer Purchase History Modal */}
      <Modal
        isOpen={!!viewingCustomer}
        onClose={() => setViewingCustomer(null)}
        title={viewingCustomer ? `${viewingCustomer.name}'s History` : ''}
        subtitle="Receipts and lifetime spending analysis"
        maxWidth="lg"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3 bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Total Spent</span>
              <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">
                ${viewingCustomer?.totalPurchases.toFixed(2)}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Total Orders</span>
              <span className="text-base font-bold text-slate-800 dark:text-slate-200">
                {viewingCustomer?.purchaseCount} sales
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Phone</span>
              <span className="text-xs font-mono text-slate-700 dark:text-slate-300">{viewingCustomer?.phone}</span>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase text-slate-400 mb-2">Past Invoices</h4>
            {customerSales.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-6">No sales history logged for this customer yet.</p>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
                {customerSales.map((sale) => (
                  <div key={sale.id} className="p-3 bg-white dark:bg-slate-900 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white">{sale.invoiceNumber}</div>
                      <div className="text-[10px] text-slate-400">
                        {new Date(sale.createdAt).toLocaleString()} • {sale.items.length} items
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-indigo-600 dark:text-indigo-400">${sale.grandTotal.toFixed(2)}</span>
                      <button
                        onClick={() => setActiveReceiptModalSale(sale)}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 rounded-lg"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        title="Delete Customer?"
        subtitle="This action cannot be undone."
        maxWidth="sm"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600 dark:text-slate-300">
            Are you sure you want to delete this customer record? Past transactions will remain in sales logs.
          </p>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setDeletingId(null)}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                if (deletingId) {
                  deleteCustomer(deletingId);
                  setDeletingId(null);
                }
              }}
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
