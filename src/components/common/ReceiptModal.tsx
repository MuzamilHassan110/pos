import React from 'react';
import { usePOS } from '../../context/POSContext';
import { Printer, Download, Check, Store } from 'lucide-react';
import { Modal } from './Modal';

export const ReceiptModal: React.FC = () => {
  const { activeReceiptModalSale, setActiveReceiptModalSale, settings } = usePOS();

  if (!activeReceiptModalSale) return null;

  const sale = activeReceiptModalSale;

  const handlePrint = () => {
    window.print();
  };

  const formattedDate = new Date(sale.createdAt).toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  return (
    <>
      {/* Printable CSS styling */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-receipt, #printable-receipt * {
            visibility: visible;
          }
          #printable-receipt {
            position: absolute;
            left: 0;
            top: 0;
            width: 80mm;
            padding: 10px;
            font-family: monospace;
            color: #000;
            background: #fff;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <Modal
        isOpen={!!activeReceiptModalSale}
        onClose={() => setActiveReceiptModalSale(null)}
        title="Transaction Receipt"
        subtitle={`Invoice #${sale.invoiceNumber}`}
        maxWidth="md"
        footer={
          <div className="flex items-center justify-between w-full no-print">
            <button
              type="button"
              onClick={() => setActiveReceiptModalSale(null)}
              className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              Close
            </button>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrint}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-xl shadow-sm transition-colors"
              >
                <Printer className="w-4 h-4" />
                Print Receipt
              </button>
            </div>
          </div>
        }
      >
        <div className="flex justify-center my-2">
          {/* Thermal Paper Container */}
          <div
            id="printable-receipt"
            className="w-full max-w-sm bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-6 rounded-xl shadow-inner font-mono text-xs text-stone-800 dark:text-stone-200 space-y-4"
          >
            {/* Store Header */}
            <div className="text-center space-y-1 pb-3 border-b border-dashed border-stone-300 dark:border-stone-700">
              <div className="inline-flex items-center justify-center p-2 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-full mb-1">
                <Store className="w-5 h-5" />
              </div>
              <h2 className="text-base font-bold tracking-tight text-stone-900 dark:text-stone-100 uppercase">
                {settings.storeName}
              </h2>
              <p className="text-[11px] text-stone-500 dark:text-stone-400">{settings.tagline}</p>
              <p className="text-[10px] text-stone-500 dark:text-stone-400 leading-tight">{settings.address}</p>
              <p className="text-[10px] text-stone-500 dark:text-stone-400">{settings.phone}</p>
            </div>

            {/* Transaction Info */}
            <div className="space-y-1 text-[11px] py-1 border-b border-dashed border-stone-300 dark:border-stone-700">
              <div className="flex justify-between">
                <span className="text-stone-500 dark:text-stone-400">Invoice:</span>
                <span className="font-semibold text-stone-900 dark:text-stone-100">{sale.invoiceNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500 dark:text-stone-400">Date:</span>
                <span>{formattedDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500 dark:text-stone-400">Cashier:</span>
                <span>{sale.cashierName}</span>
              </div>
              {sale.customerName && (
                <div className="flex justify-between">
                  <span className="text-stone-500 dark:text-stone-400">Customer:</span>
                  <span className="font-medium text-indigo-600 dark:text-indigo-400">{sale.customerName}</span>
                </div>
              )}
              {sale.status === 'refunded' && (
                <div className="mt-1 p-1 text-center bg-rose-100 text-rose-800 font-bold uppercase rounded">
                  *** REFUNDED TRANSACTION ***
                </div>
              )}
            </div>

            {/* Line Items Table */}
            <div className="space-y-2 py-1">
              <div className="flex justify-between text-[10px] uppercase text-stone-400 font-bold pb-1 border-b border-stone-200 dark:border-stone-800">
                <span className="flex-1">Item</span>
                <span className="w-10 text-center">Qty</span>
                <span className="w-14 text-right">Price</span>
                <span className="w-14 text-right">Total</span>
              </div>
              {sale.items.map((item, idx) => (
                <div key={idx} className="flex justify-between items-start text-[11px] leading-tight">
                  <div className="flex-1 pr-1">
                    <div className="font-medium text-stone-900 dark:text-stone-100">{item.productName}</div>
                    <div className="text-[9px] text-stone-400">SKU: {item.sku}</div>
                  </div>
                  <span className="w-10 text-center">{item.quantity}</span>
                  <span className="w-14 text-right">${item.unitPrice.toFixed(2)}</span>
                  <span className="w-14 text-right font-medium">${item.total.toFixed(2)}</span>
                </div>
              ))}
            </div>

            {/* Totals Section */}
            <div className="space-y-1.5 pt-2 border-t border-dashed border-stone-300 dark:border-stone-700 text-[11px]">
              <div className="flex justify-between">
                <span className="text-stone-500 dark:text-stone-400">Subtotal:</span>
                <span>${sale.subtotal.toFixed(2)}</span>
              </div>
              {sale.discount > 0 && (
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                  <span>Discount:</span>
                  <span>-${sale.discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-stone-500 dark:text-stone-400">
                <span>Tax ({sale.taxRate}%):</span>
                <span>${sale.tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-stone-900 dark:text-stone-100 pt-1.5 border-t border-stone-300 dark:border-stone-700">
                <span>GRAND TOTAL:</span>
                <span>${sale.grandTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* Payment Details */}
            <div className="space-y-1 pt-2 border-t border-dashed border-stone-300 dark:border-stone-700 text-[11px]">
              <div className="flex justify-between">
                <span className="text-stone-500 dark:text-stone-400">Payment Method:</span>
                <span className="uppercase font-semibold text-stone-800 dark:text-stone-200">{sale.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500 dark:text-stone-400">Amount Tendered:</span>
                <span>${sale.amountPaid.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-semibold">
                <span className="text-stone-500 dark:text-stone-400">Change Due:</span>
                <span className="text-indigo-600 dark:text-indigo-400">${sale.change.toFixed(2)}</span>
              </div>
            </div>

            {/* Footer Message & Barcode */}
            <div className="text-center pt-3 border-t border-dashed border-stone-300 dark:border-stone-700 space-y-2">
              <p className="text-[10px] text-stone-500 dark:text-stone-400 italic leading-snug">
                {settings.receiptFooter}
              </p>

              {/* Barcode graphic lines simulation */}
              <div className="pt-2 flex flex-col items-center justify-center">
                <div className="h-8 w-48 bg-stone-900 dark:bg-stone-200 flex items-center justify-around px-2 rounded-xs">
                  <div className="w-1 h-full bg-stone-100 dark:bg-stone-900"></div>
                  <div className="w-2 h-full bg-stone-100 dark:bg-stone-900"></div>
                  <div className="w-0.5 h-full bg-stone-100 dark:bg-stone-900"></div>
                  <div className="w-3 h-full bg-stone-100 dark:bg-stone-900"></div>
                  <div className="w-1 h-full bg-stone-100 dark:bg-stone-900"></div>
                  <div className="w-2 h-full bg-stone-100 dark:bg-stone-900"></div>
                  <div className="w-0.5 h-full bg-stone-100 dark:bg-stone-900"></div>
                  <div className="w-1 h-full bg-stone-100 dark:bg-stone-900"></div>
                </div>
                <span className="text-[9px] text-stone-400 mt-0.5 tracking-widest">{sale.invoiceNumber}</span>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};
