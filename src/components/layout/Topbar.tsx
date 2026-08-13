import React, { useEffect, useState } from 'react';
import { usePOS } from '../../context/POSContext';
import {
  Menu,
  Search,
  Bell,
  PlusCircle,
  Keyboard,
  UserCheck,
  AlertTriangle,
  Clock,
  X,
  Sun,
  Moon,
} from 'lucide-react';

interface TopbarProps {
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onOpenMobileSidebar: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ theme, onToggleTheme, onOpenMobileSidebar }) => {
  const {
    currentView,
    setCurrentView,
    searchQuery,
    setSearchQuery,
    products,
    cashierName,
    setCashierName,
    setIsKeyboardHelpOpen,
  } = usePOS();

  const [currentTime, setCurrentTime] = useState<string>('');
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) +
          ' ' +
          now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      );
    };
    update();
    const timer = setInterval(update, 30000);
    return () => clearInterval(timer);
  }, []);

  const lowStockItems = products.filter((p) => p.stockQuantity <= p.minStockLevel);

  const viewTitles: Record<string, string> = {
    dashboard: 'Dashboard Overview',
    pos: 'Point of Sale Terminal',
    products: 'Inventory & Products',
    categories: 'Product Categories',
    customers: 'Customer Directory',
    sales: 'Sales & Invoices History',
    expenses: 'Store Expense Tracker',
    reports: 'Financial & Sales Analytics',
    settings: 'Store Configuration',
  };

  return (
    <header className="sticky top-0 z-30 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
      {/* Left section: Mobile menu toggle + Page Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileSidebar}
          className="lg:hidden p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-800 rounded-xl"
          aria-label="Toggle menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 leading-tight">
            {viewTitles[currentView] || 'POS System'}
          </h2>
          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <Clock className="w-3.5 h-3.5" />
            <span>{currentTime || 'Loading...'}</span>
          </div>
        </div>
      </div>

      {/* Middle section: Search Bar */}
      <div className="flex-1 max-w-md hidden md:block">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search products, SKU, customers, invoice... (Press / to focus)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-9 py-2 text-sm bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-slate-900 dark:text-slate-100 placeholder-slate-400 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Right section: Quick Actions, Notifications, Cashier */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Quick New Sale button if not in POS view */}
        {currentView !== 'pos' && (
          <button
            onClick={() => setCurrentView('pos')}
            className="hidden sm:flex items-center gap-2 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-sm transition-colors shrink-0"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Sale</span>
            <kbd className="hidden lg:inline-block px-1.5 py-0.5 text-[10px] bg-indigo-500/60 rounded text-indigo-100">
              F1
            </kbd>
          </button>
        )}

        {/* Hotkey Guide Button */}
        <button
          onClick={() => setIsKeyboardHelpOpen(true)}
          className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
          title="Keyboard Hotkeys (?)"
        >
          <Keyboard className="w-5 h-5" />
        </button>

        {/* Theme Toggle */}
        <button
          onClick={onToggleTheme}
          className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        {/* Low Stock Notification Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            title="Stock Notifications"
          >
            <Bell className="w-5 h-5" />
            {lowStockItems.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-amber-500 rounded-full ring-2 ring-white dark:ring-slate-900 animate-pulse" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-50 p-4 space-y-3 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  Stock Alerts ({lowStockItems.length})
                </h4>
                <button
                  onClick={() => setShowNotifications(false)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs"
                >
                  Close
                </button>
              </div>

              {lowStockItems.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-4">All items are sufficiently stocked.</p>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {lowStockItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-2 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/30 text-xs"
                    >
                      <div className="min-w-0 pr-2">
                        <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">{item.name}</p>
                        <p className="text-[10px] text-amber-700 dark:text-amber-400">
                          Stock: {item.stockQuantity} / Min: {item.minStockLevel} {item.unit}
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setShowNotifications(false);
                          setCurrentView('products');
                        }}
                        className="px-2 py-1 bg-amber-500 text-amber-950 font-bold rounded-lg text-[10px] hover:bg-amber-400 transition-colors shrink-0"
                      >
                        Restock
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Cashier Selector Dropdown */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
          <div className="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 font-bold flex items-center justify-center text-xs shrink-0">
            {cashierName.substring(0, 2).toUpperCase()}
          </div>
          <div className="hidden md:block text-xs">
            <span className="block text-[10px] text-slate-400 uppercase font-semibold leading-none mb-1">Cashier</span>
            <div className="relative">
              <select
                value={cashierName}
                onChange={(e) => setCashierName(e.target.value)}
                className="appearance-none bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 pr-8 font-semibold text-slate-800 dark:text-slate-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500/40 shadow-sm"
              >
                <option value="Alex Rivers">Alex Rivers</option>
                <option value="Jordan Lee">Jordan Lee</option>
                <option value="Taylor Smith">Taylor Smith</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-2.5 flex items-center text-slate-500 dark:text-slate-400">
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                  <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
