import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  INITIAL_CATEGORIES,
  INITIAL_CUSTOMERS,
  INITIAL_EXPENSES,
  INITIAL_PRODUCTS,
  INITIAL_SALES,
  INITIAL_SETTINGS,
} from '../data/mockData';
import {
  CartItem,
  Category,
  Customer,
  Expense,
  PaymentMethod,
  Product,
  Sale,
  StoreSettings,
  ViewMode,
} from '../types';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
}

interface POSContextType {
  currentView: ViewMode;
  setCurrentView: (view: ViewMode) => void;
  products: Product[];
  categories: Category[];
  customers: Customer[];
  sales: Sale[];
  expenses: Expense[];
  settings: StoreSettings;
  cart: CartItem[];
  selectedCustomer: Customer | null;
  setSelectedCustomer: (customer: Customer | null) => void;
  cashierName: string;
  setCashierName: (name: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  activeReceiptModalSale: Sale | null;
  setActiveReceiptModalSale: (sale: Sale | null) => void;
  isKeyboardHelpOpen: boolean;
  setIsKeyboardHelpOpen: (open: boolean) => void;
  toasts: ToastMessage[];
  showToast: (type: ToastMessage['type'], title: string, message?: string) => void;
  removeToast: (id: string) => void;

  // Cart actions
  addToCart: (product: Product, quantity?: number) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  updateCartItemDiscount: (productId: string, discount: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  getCartSubtotal: () => number;
  getCartTax: () => number;
  getCartGrandTotal: (overallDiscountDollar?: number) => number;

  // Sale Processing
  processCheckout: (
    paymentMethod: PaymentMethod,
    amountPaid: number,
    overallDiscountDollar: number,
    notes?: string
  ) => Sale | null;
  refundSale: (saleId: string) => void;

  // Product CRUD
  addProduct: (product: Omit<Product, 'id' | 'createdAt'>) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  adjustStock: (id: string, delta: number) => void;

  // Category CRUD
  addCategory: (category: Omit<Category, 'id'>) => void;
  updateCategory: (id: string, category: Partial<Category>) => void;
  deleteCategory: (id: string) => void;

  // Customer CRUD
  addCustomer: (customer: Omit<Customer, 'id' | 'createdAt' | 'totalPurchases' | 'purchaseCount'>) => Customer;
  updateCustomer: (id: string, customer: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;

  // Expense CRUD
  addExpense: (expense: Omit<Expense, 'id'>) => void;
  updateExpense: (id: string, expense: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;

  // Settings
  updateSettings: (newSettings: Partial<StoreSettings>) => void;
  resetAllData: () => void;
}

const POSContext = createContext<POSContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY_PREFIX = 'apex_pos_v1_';

export const POSProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Helper to safely parse local storage
  const loadInitial = <T,>(key: string, fallback: T): T => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY_PREFIX + key);
      return stored ? JSON.parse(stored) : fallback;
    } catch {
      return fallback;
    }
  };

  const [currentView, setCurrentView] = useState<ViewMode>('dashboard');
  const [products, setProducts] = useState<Product[]>(() => loadInitial('products', INITIAL_PRODUCTS));
  const [categories, setCategories] = useState<Category[]>(() => loadInitial('categories', INITIAL_CATEGORIES));
  const [customers, setCustomers] = useState<Customer[]>(() => loadInitial('customers', INITIAL_CUSTOMERS));
  const [sales, setSales] = useState<Sale[]>(() => loadInitial('sales', INITIAL_SALES));
  const [expenses, setExpenses] = useState<Expense[]>(() => loadInitial('expenses', INITIAL_EXPENSES));
  const [settings, setSettings] = useState<StoreSettings>(() => loadInitial('settings', INITIAL_SETTINGS));
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [cashierName, setCashierName] = useState<string>('Alex Rivers');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeReceiptModalSale, setActiveReceiptModalSale] = useState<Sale | null>(null);
  const [isKeyboardHelpOpen, setIsKeyboardHelpOpen] = useState<boolean>(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Sync state to local storage
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_PREFIX + 'products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_PREFIX + 'categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_PREFIX + 'customers', JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_PREFIX + 'sales', JSON.stringify(sales));
  }, [sales]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_PREFIX + 'expenses', JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_PREFIX + 'settings', JSON.stringify(settings));
  }, [settings]);

  // Toast Helpers
  const showToast = (type: ToastMessage['type'], title: string, message?: string) => {
    const id = 'toast-' + Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, title, message }]);

    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Cart Operations
  const addToCart = (product: Product, quantityToAdd = 1) => {
    if (product.stockQuantity <= 0) {
      showToast('error', 'Out of Stock', `${product.name} is currently out of stock.`);
      return;
    }

    const existing = cart.find((item) => item.product.id === product.id);

    if (existing) {
      const newQty = existing.quantity + quantityToAdd;
      if (newQty > product.stockQuantity) {
        showToast('warning', 'Stock Limit Reached', `Only ${product.stockQuantity} ${product.unit} available.`);
        return;
      }

      setCart((prev) =>
        prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: newQty } : item
        )
      );
      showToast('info', 'Cart Updated', `Increased quantity of ${product.name}`);
      return;
    }

    setCart((prev) => [...prev, { product, quantity: quantityToAdd, discount: 0 }]);
    showToast('success', 'Added to Cart', `${product.name} added.`);
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    const item = cart.find((i) => i.product.id === productId);
    if (item && quantity > item.product.stockQuantity) {
      showToast('warning', 'Stock Limit Exceeded', `Maximum stock is ${item.product.stockQuantity}.`);
      return;
    }
    setCart((prev) => prev.map((i) => (i.product.id === productId ? { ...i, quantity } : i)));
  };

  const updateCartItemDiscount = (productId: string, discountPercent: number) => {
    const validDiscount = Math.max(0, Math.min(100, discountPercent));
    setCart((prev) => prev.map((i) => (i.product.id === productId ? { ...i, discount: validDiscount } : i)));
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((i) => i.product.id !== productId));
    showToast('info', 'Item Removed');
  };

  const clearCart = () => {
    setCart([]);
    setSelectedCustomer(null);
  };

  const getCartSubtotal = () => {
    return cart.reduce((sum, item) => {
      const itemPrice = item.product.sellingPrice * (1 - item.discount / 100);
      return sum + itemPrice * item.quantity;
    }, 0);
  };

  const getCartTax = () => {
    const subtotal = getCartSubtotal();
    return (subtotal * settings.taxRate) / 100;
  };

  const getCartGrandTotal = (overallDiscountDollar = 0) => {
    const subtotal = getCartSubtotal();
    const tax = getCartTax();
    return Math.max(0, subtotal - overallDiscountDollar + tax);
  };

  // Complete Sale & Inventory Deduction
  const processCheckout = (
    paymentMethod: PaymentMethod,
    amountPaid: number,
    overallDiscountDollar = 0,
    notes?: string
  ): Sale | null => {
    if (cart.length === 0) {
      showToast('error', 'Cart Empty', 'Please add items to cart before checkout.');
      return null;
    }

    const subtotal = getCartSubtotal();
    const tax = getCartTax();
    const grandTotal = getCartGrandTotal(overallDiscountDollar);

    if (amountPaid < grandTotal) {
      showToast('error', 'Insufficient Payment', `Amount paid must be at least $${grandTotal.toFixed(2)}`);
      return null;
    }

    const nextInvoiceNumber = `INV-${new Date().getFullYear()}-${1000 + sales.length + 1}`;
    const defaultCustomer = customers.find((c) => c.id === 'cust-4') || customers[0];
    const customer = selectedCustomer || defaultCustomer;

    const saleItems = cart.map((item) => ({
      productId: item.product.id,
      productName: item.product.name,
      sku: item.product.sku,
      unitPrice: item.product.sellingPrice,
      quantity: item.quantity,
      discount: item.discount,
      total: item.product.sellingPrice * (1 - item.discount / 100) * item.quantity,
    }));

    const newSale: Sale = {
      id: 'sale-' + Date.now(),
      invoiceNumber: nextInvoiceNumber,
      customerId: customer?.id,
      customerName: customer?.name,
      customerPhone: customer?.phone,
      items: saleItems,
      subtotal,
      discount: overallDiscountDollar,
      tax,
      taxRate: settings.taxRate,
      grandTotal,
      paymentMethod,
      amountPaid,
      change: amountPaid - grandTotal,
      cashierName,
      createdAt: new Date().toISOString(),
      status: 'completed',
      notes,
    };

    // 1. Deduct Stock
    setProducts((prev) =>
      prev.map((p) => {
        const cartItem = cart.find((i) => i.product.id === p.id);
        if (cartItem) {
          const newQty = Math.max(0, p.stockQuantity - cartItem.quantity);
          return { ...p, stockQuantity: newQty };
        }
        return p;
      })
    );

    // 2. Update Customer Totals
    if (customer) {
      setCustomers((prev) =>
        prev.map((c) => {
          if (c.id === customer.id) {
            return {
              ...c,
              totalPurchases: c.totalPurchases + grandTotal,
              purchaseCount: c.purchaseCount + 1,
              lastPurchaseDate: new Date().toISOString(),
            };
          }
          return c;
        })
      );
    }

    // 3. Record Sale
    setSales((prev) => [newSale, ...prev]);

    // 4. Clear Cart
    clearCart();

    // 5. Open Receipt Modal
    setActiveReceiptModalSale(newSale);
    showToast('success', 'Sale Completed!', `Invoice #${newSale.invoiceNumber} recorded.`);

    return newSale;
  };

  const refundSale = (saleId: string) => {
    const sale = sales.find((s) => s.id === saleId);
    if (!sale) return;
    if (sale.status === 'refunded') {
      showToast('warning', 'Already Refunded', 'This sale has already been refunded.');
      return;
    }

    // Restock items
    setProducts((prev) =>
      prev.map((p) => {
        const item = sale.items.find((i) => i.productId === p.id);
        if (item) {
          return { ...p, stockQuantity: p.stockQuantity + item.quantity };
        }
        return p;
      })
    );

    // Mark sale as refunded
    setSales((prev) => prev.map((s) => (s.id === saleId ? { ...s, status: 'refunded' } : s)));
    showToast('info', 'Sale Refunded', `Invoice ${sale.invoiceNumber} refunded & items returned to inventory.`);
  };

  // Product CRUD
  const addProduct = (productData: Omit<Product, 'id' | 'createdAt'>) => {
    const category = categories.find((c) => c.id === productData.categoryId);
    const newProduct: Product = {
      ...productData,
      id: 'prod-' + Date.now(),
      categoryName: category ? category.name : 'General',
      createdAt: new Date().toISOString(),
    };
    setProducts((prev) => [newProduct, ...prev]);
    showToast('success', 'Product Created', `${newProduct.name} added to inventory.`);
  };

  const updateProduct = (id: string, productData: Partial<Product>) => {
    let categoryName = productData.categoryName;
    if (productData.categoryId) {
      const cat = categories.find((c) => c.id === productData.categoryId);
      if (cat) categoryName = cat.name;
    }

    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...productData, ...(categoryName ? { categoryName } : {}) } : p))
    );
    showToast('success', 'Product Updated');
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    showToast('info', 'Product Deleted');
  };

  const adjustStock = (id: string, delta: number) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const newQty = Math.max(0, p.stockQuantity + delta);
          return { ...p, stockQuantity: newQty };
        }
        return p;
      })
    );
    showToast('info', 'Stock Adjusted');
  };

  // Category CRUD
  const addCategory = (categoryData: Omit<Category, 'id'>) => {
    const newCat: Category = {
      ...categoryData,
      id: 'cat-' + Date.now(),
    };
    setCategories((prev) => [...prev, newCat]);
    showToast('success', 'Category Created', newCat.name);
  };

  const updateCategory = (id: string, categoryData: Partial<Category>) => {
    setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, ...categoryData } : c)));
    showToast('success', 'Category Updated');
  };

  const deleteCategory = (id: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
    showToast('info', 'Category Removed');
  };

  // Customer CRUD
  const addCustomer = (customerData: Omit<Customer, 'id' | 'createdAt' | 'totalPurchases' | 'purchaseCount'>): Customer => {
    const newCust: Customer = {
      ...customerData,
      id: 'cust-' + Date.now(),
      totalPurchases: 0,
      purchaseCount: 0,
      createdAt: new Date().toISOString(),
    };
    setCustomers((prev) => [newCust, ...prev]);
    showToast('success', 'Customer Added', newCust.name);
    return newCust;
  };

  const updateCustomer = (id: string, customerData: Partial<Customer>) => {
    setCustomers((prev) => prev.map((c) => (c.id === id ? { ...c, ...customerData } : c)));
    showToast('success', 'Customer Record Updated');
  };

  const deleteCustomer = (id: string) => {
    setCustomers((prev) => prev.filter((c) => c.id !== id));
    showToast('info', 'Customer Deleted');
  };

  // Expense CRUD
  const addExpense = (expenseData: Omit<Expense, 'id'>) => {
    const newExp: Expense = {
      ...expenseData,
      id: 'exp-' + Date.now(),
    };
    setExpenses((prev) => [newExp, ...prev]);
    showToast('success', 'Expense Logged', `$${newExp.amount.toFixed(2)} for ${newExp.title}`);
  };

  const updateExpense = (id: string, expenseData: Partial<Expense>) => {
    setExpenses((prev) => prev.map((e) => (e.id === id ? { ...e, ...expenseData } : e)));
    showToast('success', 'Expense Updated');
  };

  const deleteExpense = (id: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
    showToast('info', 'Expense Deleted');
  };

  // Settings
  const updateSettings = (newSettings: Partial<StoreSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
    showToast('success', 'Store Settings Saved');
  };

  const resetAllData = () => {
    setProducts(INITIAL_PRODUCTS);
    setCategories(INITIAL_CATEGORIES);
    setCustomers(INITIAL_CUSTOMERS);
    setSales(INITIAL_SALES);
    setExpenses(INITIAL_EXPENSES);
    setSettings(INITIAL_SETTINGS);
    setCart([]);
    setSelectedCustomer(null);
    showToast('info', 'Demo Data Restored', 'All products, sales, and settings reset to defaults.');
  };

  return (
    <POSContext.Provider
      value={{
        currentView,
        setCurrentView,
        products,
        categories,
        customers,
        sales,
        expenses,
        settings,
        cart,
        selectedCustomer,
        setSelectedCustomer,
        cashierName,
        setCashierName,
        searchQuery,
        setSearchQuery,
        activeReceiptModalSale,
        setActiveReceiptModalSale,
        isKeyboardHelpOpen,
        setIsKeyboardHelpOpen,
        toasts,
        showToast,
        removeToast,
        addToCart,
        updateCartQuantity,
        updateCartItemDiscount,
        removeFromCart,
        clearCart,
        getCartSubtotal,
        getCartTax,
        getCartGrandTotal,
        processCheckout,
        refundSale,
        addProduct,
        updateProduct,
        deleteProduct,
        adjustStock,
        addCategory,
        updateCategory,
        deleteCategory,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        addExpense,
        updateExpense,
        deleteExpense,
        updateSettings,
        resetAllData,
      }}
    >
      {children}
    </POSContext.Provider>
  );
};

export const usePOS = () => {
  const context = useContext(POSContext);
  if (!context) {
    throw new Error('usePOS must be used within a POSProvider');
  }
  return context;
};
