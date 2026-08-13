import React, { useEffect } from 'react';
import { usePOS } from '../../context/POSContext';
import { Keyboard, Command } from 'lucide-react';
import { Modal } from './Modal';

export const KeyboardShortcutsModal: React.FC = () => {
  const { isKeyboardHelpOpen, setIsKeyboardHelpOpen, setCurrentView } = usePOS();

  useEffect(() => {
    const handleGlobalKeys = (e: KeyboardEvent) => {
      // Don't trigger if typing in an input or textarea
      const targetTag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      const isInput = targetTag === 'input' || targetTag === 'textarea' || targetTag === 'select';

      if (e.key === '?' && !isInput) {
        e.preventDefault();
        setIsKeyboardHelpOpen(!isKeyboardHelpOpen);
      } else if (e.key === 'F1') {
        e.preventDefault();
        setCurrentView('pos');
      } else if (e.key === 'F4') {
        e.preventDefault();
        setCurrentView('products');
      } else if (e.key === 'F8') {
        e.preventDefault();
        setCurrentView('customers');
      }
    };

    window.addEventListener('keydown', handleGlobalKeys);
    return () => window.removeEventListener('keydown', handleGlobalKeys);
  }, [isKeyboardHelpOpen, setIsKeyboardHelpOpen, setCurrentView]);

  if (!isKeyboardHelpOpen) return null;

  const shortcuts = [
    { key: 'F1', description: 'Open New Sale / POS View' },
    { key: 'F2', description: 'Open Quick Checkout Modal (in POS)' },
    { key: 'F4', description: 'Open Products Inventory' },
    { key: 'F8', description: 'Open Customers Directory' },
    { key: '/', description: 'Focus Product Search Input' },
    { key: 'Esc', description: 'Close Modals or Clear Selections' },
    { key: '?', description: 'Toggle Hotkey Reference Guide' },
  ];

  return (
    <Modal
      isOpen={isKeyboardHelpOpen}
      onClose={() => setIsKeyboardHelpOpen(false)}
      title="POS Keyboard Shortcuts"
      subtitle="Speed up daily cashier operations with keyboard hotkeys"
      maxWidth="md"
    >
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
          <Keyboard className="w-4 h-4 text-indigo-500 shrink-0" />
          <span>Shortcuts function globally across the app when not typing in text boxes.</span>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
          {shortcuts.map((sc, index) => (
            <div key={index} className="flex items-center justify-between p-3.5 bg-white dark:bg-slate-900">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{sc.description}</span>
              <kbd className="px-2.5 py-1 text-xs font-mono font-semibold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xs">
                {sc.key}
              </kbd>
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
};
