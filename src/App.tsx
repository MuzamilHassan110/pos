import React, { useEffect, useState } from 'react';
import { POSProvider, usePOS } from './context/POSContext';
import { Sidebar } from './components/layout/Sidebar';
import { Topbar } from './components/layout/Topbar';
import { ToastContainer } from './components/common/Toast';
import { KeyboardShortcutsModal } from './components/common/KeyboardShortcutsModal';
import { ReceiptModal } from './components/common/ReceiptModal';

import { DashboardView } from './components/dashboard/DashboardView';
import { POSView } from './components/pos/POSView';
import { ProductsView } from './components/products/ProductsView';
import { CategoriesView } from './components/categories/CategoriesView';
import { CustomersView } from './components/customers/CustomersView';
import { SalesView } from './components/sales/SalesView';
import { ExpensesView } from './components/expenses/ExpensesView';
import { ReportsView } from './components/reports/ReportsView';
import { SettingsView } from './components/settings/SettingsView';

const MainLayout: React.FC = () => {
  const { currentView } = usePOS();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window === 'undefined') return 'light';

    const savedTheme = window.localStorage.getItem('pos-theme');
    if (savedTheme === 'light' || savedTheme === 'dark') {
      return savedTheme;
    }

    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    document.documentElement.style.colorScheme = theme;
    window.localStorage.setItem('pos-theme', theme);
  }, [theme]);

  return (
    <div className={`${theme === 'dark' ? 'dark' : ''} min-h-screen w-full bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans overflow-x-hidden`}>
      {/* Toast Notifications */}
      <ToastContainer />

      {/* Hotkeys Modal */}
      <KeyboardShortcutsModal />

      {/* Global Thermal Receipt Modal */}
      <ReceiptModal />

      {/* Sidebar Navigation */}
      <Sidebar mobileOpen={mobileSidebarOpen} setMobileOpen={setMobileSidebarOpen} />

      {/* Main Content Area */}
      <div className="lg:pl-64 flex flex-col min-h-screen w-full">
        {/* Top Header Bar */}
        <Topbar
          theme={theme}
          onToggleTheme={() => setTheme((current) => (current === 'dark' ? 'light' : 'dark'))}
          onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
        />

        {/* Dynamic View Switcher */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          {currentView === 'dashboard' && <DashboardView />}
          {currentView === 'pos' && <POSView />}
          {currentView === 'products' && <ProductsView />}
          {currentView === 'categories' && <CategoriesView />}
          {currentView === 'customers' && <CustomersView />}
          {currentView === 'sales' && <SalesView />}
          {currentView === 'expenses' && <ExpensesView />}
          {currentView === 'reports' && <ReportsView />}
          {currentView === 'settings' && <SettingsView />}
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <POSProvider>
      <MainLayout />
    </POSProvider>
  );
}
