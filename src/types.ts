export type PaymentMethod = 'cash' | 'card' | 'other';

export interface Product {
  id: string;
  name: string;
  sku: string;
  barcode: string;
  categoryId: string;
  categoryName: string;
  purchasePrice: number;
  sellingPrice: number;
  stockQuantity: number;
  minStockLevel: number;
  imageUrl: string;
  unit: string;
  description?: string;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  color: string;
  icon?: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  address?: string;
  totalPurchases: number;
  purchaseCount: number;
  lastPurchaseDate?: string;
  notes?: string;
  createdAt: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  discount: number; // percentage discount on item (0 - 100)
}

export interface SaleItem {
  productId: string;
  productName: string;
  sku: string;
  unitPrice: number;
  quantity: number;
  discount: number; // percentage
  total: number;
}

export interface Sale {
  id: string;
  invoiceNumber: string;
  customerId?: string;
  customerName?: string;
  customerPhone?: string;
  items: SaleItem[];
  subtotal: number;
  discount: number; // dollar amount discount overall
  discountPercent?: number;
  tax: number;
  taxRate: number;
  grandTotal: number;
  paymentMethod: PaymentMethod;
  amountPaid: number;
  change: number;
  cashierName: string;
  createdAt: string;
  status: 'completed' | 'refunded';
  notes?: string;
}

export interface Expense {
  id: string;
  title: string;
  amount: number;
  category: 'rent' | 'utilities' | 'salaries' | 'inventory' | 'marketing' | 'maintenance' | 'other';
  date: string;
  notes?: string;
  createdBy: string;
}

export interface StoreSettings {
  storeName: string;
  tagline: string;
  address: string;
  phone: string;
  email: string;
  taxRate: number; // percentage, e.g. 8.5
  currencySymbol: string;
  receiptHeader: string;
  receiptFooter: string;
  enableLowStockAlerts: boolean;
}

export type ViewMode =
  | 'dashboard'
  | 'pos'
  | 'products'
  | 'categories'
  | 'customers'
  | 'sales'
  | 'expenses'
  | 'reports'
  | 'settings';
