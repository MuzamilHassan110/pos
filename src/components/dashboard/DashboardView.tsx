import React from 'react';
import { usePOS } from '../../context/POSContext';
import {
  DollarSign,
  ShoppingBag,
  TrendingUp,
  Package,
  AlertTriangle,
  Receipt,
  PlusCircle,
  Users,
  ArrowUpRight,
  Eye,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

export const DashboardView: React.FC = () => {
  const {
    sales,
    products,
    customers,
    setCurrentView,
    setActiveReceiptModalSale,
  } = usePOS();

  // Calculate Metrics
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const completedSales = sales.filter((s) => s.status === 'completed');

  const todaySalesList = completedSales.filter((s) => new Date(s.createdAt) >= todayStart);
  const todayRevenue = todaySalesList.reduce((sum, s) => sum + s.grandTotal, 0);

  const totalRevenue = completedSales.reduce((sum, s) => sum + s.grandTotal, 0);
  const totalTransactions = completedSales.length;

  const totalProductsSold = completedSales.reduce((sum, s) => {
    return sum + s.items.reduce((iSum, item) => iSum + item.quantity, 0);
  }, 0);

  const lowStockCount = products.filter((p) => p.stockQuantity <= p.minStockLevel).length;

  // Chart Data Preparation - Last 7 Days Revenue
  const last7DaysData = Array.from({ length: 7 }).map((_, idx) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - idx));
    d.setHours(0, 0, 0, 0);

    const nextD = new Date(d);
    nextD.setDate(nextD.getDate() + 1);

    const daySales = completedSales.filter((s) => {
      const sDate = new Date(s.createdAt);
      return sDate >= d && sDate < nextD;
    });

    const dayRevenue = daySales.reduce((sum, s) => sum + s.grandTotal, 0);
    const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' });

    return {
      day: dayLabel,
      Revenue: parseFloat(dayRevenue.toFixed(2)),
      Transactions: daySales.length,
    };
  });

  // Category Revenue Pie Chart Data
  const categoryRevenueMap: Record<string, number> = {};
  completedSales.forEach((sale) => {
    sale.items.forEach((item) => {
      const prod = products.find((p) => p.id === item.productId);
      const catName = prod ? prod.categoryName : 'General';
      categoryRevenueMap[catName] = (categoryRevenueMap[catName] || 0) + item.total;
    });
  });

  const pieColors = ['#4f46e5', '#06b6d4', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];
  const categoryData = Object.keys(categoryRevenueMap).map((catName, idx) => ({
    name: catName,
    value: parseFloat(categoryRevenueMap[catName].toFixed(2)),
    color: pieColors[idx % pieColors.length],
  }));

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Today's Sales */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Today's Sales</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
            ${todayRevenue.toFixed(2)}
          </div>
          <p className="text-[11px] text-slate-500 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
            <span>{todaySalesList.length} sales today</span>
          </p>
        </div>

        {/* Total Revenue */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Revenue</span>
            <div className="w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
            ${totalRevenue.toFixed(2)}
          </div>
          <p className="text-[11px] text-slate-500">Cumulative sales earnings</p>
        </div>

        {/* Total Transactions */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Transactions</span>
            <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Receipt className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {totalTransactions}
          </div>
          <p className="text-[11px] text-slate-500">Completed receipts</p>
        </div>

        {/* Products Sold */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Items Sold</span>
            <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {totalProductsSold}
          </div>
          <p className="text-[11px] text-slate-500">Individual units delivered</p>
        </div>

        {/* Low Stock Alert */}
        <div
          onClick={() => setCurrentView('products')}
          className={`border p-5 rounded-2xl shadow-xs space-y-2 cursor-pointer transition-all ${
            lowStockCount > 0
              ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800 hover:border-amber-500'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Low Stock</span>
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                lowStockCount > 0
                  ? 'bg-amber-500 text-amber-950'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
              }`}
            >
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {lowStockCount}
          </div>
          <p className="text-[11px] text-amber-700 dark:text-amber-400 font-medium flex items-center gap-1">
            <span>{lowStockCount > 0 ? 'Requires restocking' : 'Inventory healthy'}</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Trend Recharts Area Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Weekly Revenue Trend</h3>
              <p className="text-xs text-slate-500">Sales performance over the last 7 days</p>
            </div>
            <button
              onClick={() => setCurrentView('reports')}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              Full Reports &rarr;
            </button>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={last7DaysData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.5} />
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} tickFormatter={(v) => `$${v}`} />
                <Tooltip
                  formatter={(value: any) => [`$${value}`, 'Revenue']}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="Revenue"
                  stroke="#4f46e5"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorRev)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown Donut Pie Chart */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Category Distribution</h3>
            <p className="text-xs text-slate-500">Sales share by product category</p>
          </div>

          <div className="h-48 w-full flex items-center justify-center">
            {categoryData.length === 0 ? (
              <p className="text-xs text-slate-400">No category sales recorded yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: any) => [`$${val}`, 'Sales']}
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '0.75rem',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            {categoryData.slice(0, 4).map((c, i) => (
              <div key={i} className="flex items-center gap-2 text-xs">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: c.color }} />
                <span className="text-slate-600 dark:text-slate-300 truncate">{c.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Action Cards & Recent Transactions Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions Panel */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs space-y-3">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Quick Terminal Actions</h3>
          <div className="space-y-2">
            <button
              onClick={() => setCurrentView('pos')}
              className="w-full p-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-xs flex items-center justify-between transition-colors shadow-sm"
            >
              <div className="flex items-center gap-2.5">
                <PlusCircle className="w-4 h-4" />
                <span>Start New Sale Register</span>
              </div>
              <kbd className="px-1.5 py-0.5 bg-indigo-500 rounded text-[10px]">F1</kbd>
            </button>

            <button
              onClick={() => setCurrentView('products')}
              className="w-full p-3 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl font-semibold text-xs flex items-center justify-between border border-slate-200 dark:border-slate-700 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <Package className="w-4 h-4 text-indigo-500" />
                <span>Manage Inventory & Stock</span>
              </div>
              <kbd className="px-1.5 py-0.5 bg-slate-200 dark:bg-slate-700 rounded text-[10px]">F4</kbd>
            </button>

            <button
              onClick={() => setCurrentView('customers')}
              className="w-full p-3 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl font-semibold text-xs flex items-center justify-between border border-slate-200 dark:border-slate-700 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <Users className="w-4 h-4 text-emerald-500" />
                <span>View Customer Directory</span>
              </div>
              <kbd className="px-1.5 py-0.5 bg-slate-200 dark:bg-slate-700 rounded text-[10px]">F8</kbd>
            </button>
          </div>
        </div>

        {/* Recent Transactions List */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Recent Counter Transactions</h3>
              <p className="text-xs text-slate-500">Latest completed sale invoices</p>
            </div>
            <button
              onClick={() => setCurrentView('sales')}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              View All History &rarr;
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-semibold uppercase">
                  <th className="pb-2">Invoice #</th>
                  <th className="pb-2">Customer</th>
                  <th className="pb-2">Items</th>
                  <th className="pb-2">Total</th>
                  <th className="pb-2">Method</th>
                  <th className="pb-2 text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {sales.slice(0, 5).map((sale) => (
                  <tr key={sale.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-2.5 font-bold text-slate-900 dark:text-white">{sale.invoiceNumber}</td>
                    <td className="py-2.5 text-slate-600 dark:text-slate-300">{sale.customerName || 'Walk-in'}</td>
                    <td className="py-2.5 text-slate-500">
                      {sale.items.reduce((s, i) => s + i.quantity, 0)} items
                    </td>
                    <td className="py-2.5 font-bold text-indigo-600 dark:text-indigo-400">
                      ${sale.grandTotal.toFixed(2)}
                    </td>
                    <td className="py-2.5">
                      <span className="px-2 py-0.5 text-[10px] font-semibold uppercase bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded">
                        {sale.paymentMethod}
                      </span>
                    </td>
                    <td className="py-2.5 text-right">
                      <button
                        onClick={() => setActiveReceiptModalSale(sale)}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 rounded-lg transition-colors"
                        title="View & Print Receipt"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
