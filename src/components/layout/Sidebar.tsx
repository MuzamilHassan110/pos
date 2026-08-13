import React from 'react';
import { usePOS } from '../../context/POSContext';
import { ViewMode } from '../../types';
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Tags,
  Users,
  Receipt,
  Wallet,
  BarChart3,
  Settings,
  Store,
  AlertTriangle,
  Keyboard,
  RotateCcw,
} from 'lucide-react';

interface SidebarProps {
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, setMobileOpen }) => {
  const {
    currentView,
    setCurrentView,
    cart,
    products,
    settings,
    setIsKeyboardHelpOpen,
    resetAllData,
  } = usePOS();

  const cartItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const lowStockCount = products.filter((p) => p.stockQuantity <= p.minStockLevel).length;

  const navItems: { id: ViewMode; label: string; icon: React.ReactNode; badge?: number; badgeColor?: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    {
      id: 'pos',
      label: 'New Sale (POS)',
      icon: <ShoppingCart className="w-5 h-5" />,
      badge: cartItemsCount > 0 ? cartItemsCount : undefined,
      badgeColor: 'bg-indigo-600 text-white',
    },
    {
      id: 'products',
      label: 'Products',
      icon: <Package className="w-5 h-5" />,
      badge: lowStockCount > 0 ? lowStockCount : undefined,
      badgeColor: 'bg-amber-500 text-amber-950 font-bold',
    },
    { id: 'categories', label: 'Categories', icon: <Tags className="w-5 h-5" /> },
    { id: 'customers', label: 'Customers', icon: <Users className="w-5 h-5" /> },
    { id: 'sales', label: 'Sales History', icon: <Receipt className="w-5 h-5" /> },
    { id: 'expenses', label: 'Expenses', icon: <Wallet className="w-5 h-5" /> },
    { id: 'reports', label: 'Reports & Analytics', icon: <BarChart3 className="w-5 h-5" /> },
    { id: 'settings', label: 'Store Settings', icon: <Settings className="w-5 h-5" /> },
  ];

  const handleNavClick = (view: ViewMode) => {
    setCurrentView(view);
    setMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Store Brand Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3 bg-slate-50 dark:bg-slate-900/80">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 shrink-0">
            <Store className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-base font-bold text-slate-900 dark:text-white tracking-tight leading-tight truncate">
              {settings.storeName || 'Point of Sale'}
            </h1>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">Express Retail Terminal</p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className={isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400'}>{item.icon}</span>
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span
                    className={`ml-2 px-2 py-0.5 text-xs rounded-full font-semibold shrink-0 ${
                      item.badgeColor || 'bg-indigo-500 text-white'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Low Stock Quick Alert Banner if low stock items exist */}
        {lowStockCount > 0 && (
          <div className="mx-3 my-2 p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50 rounded-xl flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-500 dark:text-amber-400 shrink-0" />
            <div className="text-xs min-w-0 flex-1">
              <p className="text-amber-800 dark:text-amber-200 font-semibold">{lowStockCount} items low in stock</p>
              <button
                onClick={() => handleNavClick('products')}
                className="text-[11px] text-amber-600 dark:text-amber-400 hover:underline font-medium"
              >
                View & Restock &rarr;
              </button>
            </div>
          </div>
        )}

        {/* Bottom Actions Footer */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 space-y-1 text-xs bg-slate-50 dark:bg-slate-900/80">
          <button
            onClick={() => setIsKeyboardHelpOpen(true)}
            className="w-full flex items-center justify-between px-3 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800/60 rounded-xl transition-colors"
          >
            <div className="flex items-center gap-2">
              <Keyboard className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
              <span>Hotkeys Help</span>
            </div>
            <kbd className="px-1.5 py-0.5 text-[10px] bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded text-slate-700 dark:text-slate-300">
              ?
            </kbd>
          </button>

          <button
            onClick={() => {
              if (confirm('Reset all demo data back to factory defaults?')) {
                resetAllData();
              }
            }}
            className="w-full flex items-center gap-2 px-3 py-2 text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition-colors text-left"
          >
            <RotateCcw className="w-4 h-4 text-rose-500 dark:text-rose-400" />
            <span>Reset Demo Data</span>
          </button>
        </div>
      </aside>
    </>
  );
};
