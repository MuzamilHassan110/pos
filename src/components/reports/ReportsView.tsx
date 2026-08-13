import React, { useState } from 'react';
import { usePOS } from '../../context/POSContext';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  PieChart as PieIcon,
  Calendar,
  Download,
  ShoppingBag,
  ArrowUpRight,
  ArrowDownRight,
  ShieldAlert,
} from 'lucide-react';

export const ReportsView: React.FC = () => {
  const { sales, expenses, products, categories, settings } = usePOS();

  const [dateRange, setDateRange] = useState<'7d' | '30d' | 'all'>('all');

  // Filter sales based on date range
  const filteredSales = sales.filter((s) => {
    if (dateRange === 'all') return true;
    const saleDate = new Date(s.createdAt).getTime();
    const now = new Date().getTime();
    const daysDiff = (now - saleDate) / (1000 * 3600 * 24);
    if (dateRange === '7d') return daysDiff <= 7;
    if (dateRange === '30d') return daysDiff <= 30;
    return true;
  });

  const completedSales = filteredSales.filter((s) => s.status === 'completed');

  // Financial Metrics Calculation
  const grossRevenue = completedSales.reduce((sum, s) => sum + s.grandTotal, 0);
  const totalTaxCollected = completedSales.reduce((sum, s) => sum + s.tax, 0);
  const netRevenue = grossRevenue - totalTaxCollected;

  // Calculate COGS (Cost of Goods Sold)
  let cogs = 0;
  completedSales.forEach((s) => {
    s.items.forEach((item) => {
      const prod = products.find((p) => p.id === item.productId);
      const purchasePrice = prod ? prod.purchasePrice : item.unitPrice * 0.6;
      cogs += purchasePrice * item.quantity;
    });
  });

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const grossProfit = netRevenue - cogs;
  const netProfit = grossProfit - totalExpenses;
  const profitMarginPercent = netRevenue > 0 ? ((netProfit / netRevenue) * 100).toFixed(1) : '0';

  // Revenue Daily Chart Data
  const dailySalesMap: { [key: string]: { date: string; revenue: number; profit: number } } = {};

  completedSales.forEach((s) => {
    const day = new Date(s.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    if (!dailySalesMap[day]) {
      dailySalesMap[day] = { date: day, revenue: 0, profit: 0 };
    }
    dailySalesMap[day].revenue += s.grandTotal;

    // Approximate profit
    let saleCOGS = 0;
    s.items.forEach((item) => {
      const prod = products.find((p) => p.id === item.productId);
      const purchasePrice = prod ? prod.purchasePrice : item.unitPrice * 0.6;
      saleCOGS += purchasePrice * item.quantity;
    });
    dailySalesMap[day].profit += s.grandTotal - s.tax - saleCOGS;
  });

  const dailyChartData = Object.values(dailySalesMap).reverse();

  // Category Revenue Chart Data
  const categoryMap: { [key: string]: number } = {};
  completedSales.forEach((s) => {
    s.items.forEach((i) => {
      const prod = products.find((p) => p.id === i.productId);
      const catName = prod ? prod.categoryName : 'General';
      categoryMap[catName] = (categoryMap[catName] || 0) + i.total;
    });
  });

  const categoryChartData = Object.keys(categoryMap).map((catName) => ({
    name: catName,
    value: categoryMap[catName],
  }));

  // Payment Method Breakdown Chart Data
  const paymentMethodMap: { [key: string]: number } = { cash: 0, card: 0, other: 0 };
  completedSales.forEach((s) => {
    const method = s.paymentMethod || 'cash';
    paymentMethodMap[method] = (paymentMethodMap[method] || 0) + s.grandTotal;
  });

  const paymentChartData = [
    { name: 'Cash Payments', value: paymentMethodMap.cash || 0, color: '#10b981' },
    { name: 'Card Terminal', value: paymentMethodMap.card || 0, color: '#6366f1' },
    { name: 'Mobile / Digital', value: paymentMethodMap.other || 0, color: '#f59e0b' },
  ];

  // Top Selling Products
  const productSalesMap: { [key: string]: { name: string; qty: number; revenue: number } } = {};
  completedSales.forEach((s) => {
    s.items.forEach((i) => {
      if (!productSalesMap[i.productId]) {
        productSalesMap[i.productId] = { name: i.productName, qty: 0, revenue: 0 };
      }
      productSalesMap[i.productId].qty += i.quantity;
      productSalesMap[i.productId].revenue += i.total;
    });
  });

  const topProducts = Object.values(productSalesMap)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4'];

  const exportCSV = () => {
    const headers = ['Invoice Number', 'Date', 'Customer', 'Grand Total', 'Payment Method', 'Status'];
    const rows = completedSales.map((s) => [
      s.invoiceNumber,
      new Date(s.createdAt).toISOString(),
      s.customerName || 'Walk-in',
      s.grandTotal.toFixed(2),
      s.paymentMethod,
      s.status,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Sales_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Financial Reports & Analytics</h3>
          <p className="text-xs text-slate-500">Comprehensive sales performance, margins, and expense auditing</p>
        </div>

        <div className="flex items-center gap-2">
          {/* Date Selector */}
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setDateRange('7d')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                dateRange === '7d'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-500'
              }`}
            >
              Last 7 Days
            </button>
            <button
              onClick={() => setDateRange('30d')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                dateRange === '30d'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-500'
              }`}
            >
              Last 30 Days
            </button>
            <button
              onClick={() => setDateRange('all')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                dateRange === 'all'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-500'
              }`}
            >
              All Time
            </button>
          </div>

          <button
            onClick={exportCSV}
            className="flex items-center gap-2 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-sm transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* P&L Executive Summary Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Gross Revenue</span>
          <div className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">${grossRevenue.toFixed(2)}</div>
          <span className="text-[10px] text-slate-400">{completedSales.length} total orders</span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Cost of Goods (COGS)</span>
          <div className="text-xl font-extrabold text-slate-700 dark:text-slate-300 mt-1">${cogs.toFixed(2)}</div>
          <span className="text-[10px] text-slate-400">Inventory cost</span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Operating Expenses</span>
          <div className="text-xl font-extrabold text-rose-600 dark:text-rose-400 mt-1">${totalExpenses.toFixed(2)}</div>
          <span className="text-[10px] text-slate-400">Store bills & overheads</span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Net Profit</span>
          <div className={`text-xl font-extrabold mt-1 ${netProfit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600'}`}>
            ${netProfit.toFixed(2)}
          </div>
          <span className="text-[10px] text-slate-400">After all costs</span>
        </div>

        <div className="col-span-2 lg:col-span-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Net Profit Margin</span>
          <div className="text-xl font-extrabold text-indigo-600 dark:text-indigo-400 mt-1">{profitMarginPercent}%</div>
          <span className="text-[10px] text-slate-400">Margin efficiency</span>
        </div>
      </div>

      {/* Visual Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily Revenue & Profit Trend Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-500" />
              <span>Revenue & Estimated Profit Trend</span>
            </h4>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyChartData}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorProf" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#1e293b',
                    borderRadius: '0.75rem',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Area type="monotone" dataKey="revenue" name="Revenue ($)" stroke="#6366f1" fillOpacity={1} fill="url(#colorRev)" strokeWidth={2} />
                <Area type="monotone" dataKey="profit" name="Est. Profit ($)" stroke="#10b981" fillOpacity={1} fill="url(#colorProf)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Payment Method Breakdown Donut */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs space-y-4">
          <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <PieIcon className="w-4 h-4 text-indigo-500" />
            <span>Payment Method Distribution</span>
          </h4>

          <div className="h-56 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={paymentChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {paymentChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#1e293b',
                    borderRadius: '0.75rem',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
            {paymentChartData.map((p) => (
              <div key={p.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color }} />
                  <span className="text-slate-600 dark:text-slate-300 font-medium">{p.name}</span>
                </div>
                <span className="font-bold text-slate-900 dark:text-white">${p.value.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Secondary Analytics: Top Products & Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top 5 Best Selling Items */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs space-y-4">
          <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-indigo-500" />
            <span>Top Performing Products</span>
          </h4>

          <div className="space-y-3">
            {topProducts.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No sales recorded yet.</p>
            ) : (
              topProducts.map((p, idx) => (
                <div key={p.name} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-xs">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-bold flex items-center justify-center text-xs">
                      #{idx + 1}
                    </span>
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white">{p.name}</div>
                      <div className="text-[10px] text-slate-400">{p.qty} units sold</div>
                    </div>
                  </div>
                  <div className="font-extrabold text-emerald-600 dark:text-emerald-400 text-sm">
                    ${p.revenue.toFixed(2)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Category Revenue Bar Breakdown */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs space-y-4">
          <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-indigo-500" />
            <span>Sales by Department / Category</span>
          </h4>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryChartData}>
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#1e293b',
                    borderRadius: '0.75rem',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="value" name="Revenue ($)" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
