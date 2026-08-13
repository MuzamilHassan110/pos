import React, { useState } from 'react';
import { usePOS } from '../../context/POSContext';
import { Expense } from '../../types';
import { Modal } from '../common/Modal';
import {
  Wallet,
  Plus,
  Search,
  Edit,
  Trash2,
  DollarSign,
  Calendar,
  Tag,
  Check,
} from 'lucide-react';

export const ExpensesView: React.FC = () => {
  const { expenses, addExpense, updateExpense, deleteExpense, cashierName } = usePOS();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<Expense['category']>('utilities');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  const [deletingId, setDeletingId] = useState<string | null>(null);

  const expenseCategories: { key: Expense['category']; label: string }[] = [
    { key: 'rent', label: 'Rent & Lease' },
    { key: 'utilities', label: 'Utilities & Internet' },
    { key: 'salaries', label: 'Salaries & Wages' },
    { key: 'inventory', label: 'Stock Procurement' },
    { key: 'marketing', label: 'Marketing & Ads' },
    { key: 'maintenance', label: 'Maintenance & Repairs' },
    { key: 'other', label: 'Miscellaneous' },
  ];

  const filteredExpenses = expenses.filter((e) => {
    if (selectedCategory !== 'all' && e.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      return e.title.toLowerCase().includes(q) || (e.notes || '').toLowerCase().includes(q);
    }
    return true;
  });

  const totalExpenseAmount = expenses.reduce((sum, e) => sum + e.amount, 0);

  const handleOpenCreate = () => {
    setEditingExpense(null);
    setTitle('');
    setAmount('');
    setCategory('utilities');
    setDate(new Date().toISOString().split('T')[0]);
    setNotes('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (exp: Expense) => {
    setEditingExpense(exp);
    setTitle(exp.title);
    setAmount(exp.amount.toString());
    setCategory(exp.category);
    setDate(exp.date);
    setNotes(exp.notes || '');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (!title.trim() || isNaN(parsedAmount) || parsedAmount <= 0) return;

    if (editingExpense) {
      updateExpense(editingExpense.id, {
        title: title.trim(),
        amount: parsedAmount,
        category,
        date,
        notes: notes.trim(),
      });
    } else {
      addExpense({
        title: title.trim(),
        amount: parsedAmount,
        category,
        date,
        notes: notes.trim(),
        createdBy: cashierName,
      });
    }

    setIsModalOpen(false);
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header Metric Card & Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs">
        <div>
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Store Expenses</span>
          <div className="text-2xl font-extrabold text-rose-600 dark:text-rose-400 mt-0.5">${totalExpenseAmount.toFixed(2)}</div>
          <p className="text-xs text-slate-500 mt-1">Logged operational expenses and supplier bills</p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search expense description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-slate-100"
            />
          </div>

          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-sm transition-colors shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Log Expense</span>
          </button>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-3 py-1.5 rounded-xl transition-colors shrink-0 ${
            selectedCategory === 'all'
              ? 'bg-indigo-600 text-white font-semibold'
              : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'
          }`}
        >
          All Categories
        </button>
        {expenseCategories.map((cat) => (
          <button
            key={cat.key}
            onClick={() => setSelectedCategory(cat.key)}
            className={`px-3 py-1.5 rounded-xl transition-colors shrink-0 ${
              selectedCategory === cat.key
                ? 'bg-indigo-600 text-white font-semibold'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Expenses Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-400 font-semibold uppercase">
              <tr>
                <th className="p-3.5">Expense Title</th>
                <th className="p-3.5">Category</th>
                <th className="p-3.5">Date</th>
                <th className="p-3.5">Logged By</th>
                <th className="p-3.5">Amount</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredExpenses.map((exp) => (
                <tr key={exp.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="p-3.5">
                    <div className="font-bold text-slate-900 dark:text-white">{exp.title}</div>
                    {exp.notes && <p className="text-[10px] text-slate-400 line-clamp-1">{exp.notes}</p>}
                  </td>

                  <td className="p-3.5">
                    <span className="px-2.5 py-1 text-[10px] font-bold uppercase bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg">
                      {exp.category}
                    </span>
                  </td>

                  <td className="p-3.5 text-slate-600 dark:text-slate-300">
                    {new Date(exp.date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </td>

                  <td className="p-3.5 text-slate-500">{exp.createdBy}</td>

                  <td className="p-3.5 font-extrabold text-rose-600 dark:text-rose-400 text-sm">
                    ${exp.amount.toFixed(2)}
                  </td>

                  <td className="p-3.5 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => handleOpenEdit(exp)}
                        className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                        title="Edit Expense"
                      >
                        <Edit className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => setDeletingId(exp.id)}
                        className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                        title="Delete Expense"
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

      {/* Expense Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingExpense ? 'Edit Expense Record' : 'Log New Expense'}
        subtitle="Track store overheads and inventory procurement costs"
        maxWidth="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Expense Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. July Store Electricity Bill"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-slate-100"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Amount ($) *
              </label>
              <input
                type="number"
                step="0.01"
                required
                placeholder="150.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Expense Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as Expense['category'])}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-slate-100"
              >
                {expenseCategories.map((c) => (
                  <option key={c.key} value={c.key}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Expense Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-slate-100"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Notes & Vendor Reference
            </label>
            <textarea
              rows={2}
              placeholder="Receipt number, invoice reference..."
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
              <span>Save Expense</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        title="Delete Expense Record?"
        subtitle="This action cannot be undone."
        maxWidth="sm"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600 dark:text-slate-300">
            Are you sure you want to delete this expense record?
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
                  deleteExpense(deletingId);
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
