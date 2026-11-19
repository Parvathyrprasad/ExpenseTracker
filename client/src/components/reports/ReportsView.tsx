import React, { useState, useEffect } from 'react';
import { ReportsData } from '../../types';
import { api } from '../../lib/api';
import { formatCurrency } from '../../lib/utils';
import { CategoryIcon } from '../common/CategoryIcon';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  BarChart3,
  PieChart as PieIcon,
  TrendingUp,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  Loader2,
  AlertCircle,
  PiggyBank,
} from 'lucide-react';

const MONTH_OPTIONS = [
  { value: 1, label: 'January' },
  { value: 2, label: 'February' },
  { value: 3, label: 'March' },
  { value: 4, label: 'April' },
  { value: 5, label: 'May' },
  { value: 6, label: 'June' },
  { value: 7, label: 'July' },
  { value: 8, label: 'August' },
  { value: 9, label: 'September' },
  { value: 10, label: 'October' },
  { value: 11, label: 'November' },
  { value: 12, label: 'December' },
];

export const ReportsView: React.FC = () => {
  const now = new Date();
  const [period, setPeriod] = useState<'month' | 'year'>('month');
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [data, setData] = useState<ReportsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/analytics/reports', {
        params: { period, month, year },
      });
      if (res.data?.success && res.data?.data) {
        setData(res.data.data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load visual reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [period, month, year]);

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-emerald-600" />
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
              Visual Reports & Analytics
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Cashflow trends, spending breakdowns, and savings rate analytics
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Period Toggle */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setPeriod('month')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                period === 'month'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Monthly Analysis
            </button>
            <button
              onClick={() => setPeriod('year')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                period === 'year'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Full Year Overview
            </button>
          </div>

          {/* Month selector if month period */}
          {period === 'month' && (
            <select
              value={month}
              onChange={(e) => setMonth(parseInt(e.target.value, 10))}
              className="px-3 py-2 text-xs font-semibold border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-emerald-500"
            >
              {MONTH_OPTIONS.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          )}

          {/* Year selector */}
          <select
            value={year}
            onChange={(e) => setYear(parseInt(e.target.value, 10))}
            className="px-3 py-2 text-xs font-semibold border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-emerald-500"
          >
            {[2024, 2025, 2026, 2027].map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-rose-800 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-600 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* KPI Cards */}
      {data && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
            <span className="text-xs text-slate-500 font-medium">Total Income</span>
            <p className="text-xl font-bold text-emerald-600 mt-1 flex items-center">
              <ArrowUpRight className="w-5 h-5 mr-1" />
              {formatCurrency(data.summary.totalIncome)}
            </p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
            <span className="text-xs text-slate-500 font-medium">Total Expenses</span>
            <p className="text-xl font-bold text-rose-600 mt-1 flex items-center">
              <ArrowDownLeft className="w-5 h-5 mr-1" />
              {formatCurrency(data.summary.totalExpense)}
            </p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
            <span className="text-xs text-slate-500 font-medium">Net Savings</span>
            <p
              className={`text-xl font-bold mt-1 ${
                parseFloat(data.summary.netSavings) >= 0 ? 'text-slate-900' : 'text-rose-600'
              }`}
            >
              {formatCurrency(data.summary.netSavings)}
            </p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
            <span className="text-xs text-slate-500 font-medium">Savings Rate</span>
            <p className="text-xl font-bold text-indigo-600 mt-1 flex items-center">
              <PiggyBank className="w-5 h-5 mr-1 text-indigo-500" />
              {data.summary.savingsRate}%
            </p>
          </div>
        </div>
      )}

      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mb-2" />
          <span className="text-xs font-medium">Rendering charts & calculating trends...</span>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Cashflow Bar Chart */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                  <h3 className="text-sm font-bold text-slate-900">
                    {period === 'year'
                      ? `Monthly Cashflow (${year})`
                      : '6-Month Trailing Cashflow'}
                  </h3>
                </div>
                <span className="text-xs text-slate-400">Income vs Expenses (₹)</span>
              </div>

              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={data?.monthlyTrend || []}
                    margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis
                      dataKey="month"
                      tick={{ fontSize: 11, fill: '#64748B' }}
                      axisLine={{ stroke: '#CBD5E1' }}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: '#64748B' }}
                      axisLine={{ stroke: '#CBD5E1' }}
                      tickFormatter={(val) => `₹${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
                    />
                    <Tooltip
                      formatter={(value: any) => [formatCurrency(Number(value)), '']}
                      contentStyle={{
                        backgroundColor: '#0F172A',
                        borderRadius: '0.75rem',
                        color: '#F8FAFC',
                        border: 'none',
                        fontSize: '0.75rem',
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '0.75rem', paddingTop: '10px' }} />
                    <Bar dataKey="income" name="Income" fill="#10B981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="expense" name="Expense" fill="#EF4444" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Category Expense Donut Chart */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                <div className="flex items-center gap-2">
                  <PieIcon className="w-4 h-4 text-emerald-600" />
                  <h3 className="text-sm font-bold text-slate-900">
                    Expense Distribution by Category
                  </h3>
                </div>
                <span className="text-xs text-slate-400">Percentage Split</span>
              </div>

              {data?.categoryBreakdown.length === 0 ? (
                <div className="h-72 flex flex-col items-center justify-center text-slate-400">
                  <PieIcon className="w-10 h-10 text-slate-200 mb-2" />
                  <p className="text-xs font-semibold text-slate-600">No expenses recorded</p>
                  <p className="text-[11px] text-slate-400">Zero expense data for this time period</p>
                </div>
              ) : (
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data?.categoryBreakdown || []}
                        dataKey="amount"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={65}
                        outerRadius={95}
                        paddingAngle={3}
                      >
                        {(data?.categoryBreakdown || []).map((entry) => (
                          <Cell key={entry.categoryId} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(val: any, name: any, item: any) => [
                          `${formatCurrency(Number(val))} (${item.payload.percentage}%)`,
                          name,
                        ]}
                        contentStyle={{
                          backgroundColor: '#0F172A',
                          borderRadius: '0.75rem',
                          color: '#F8FAFC',
                          border: 'none',
                          fontSize: '0.75rem',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>

          {/* Category-wise Breakdown Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Detailed Category Breakdown</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Expense amounts ranked by volume
              </p>
            </div>

            {data?.categoryBreakdown.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                No expense categories recorded for this period.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {data?.categoryBreakdown.map((cat, idx) => (
                  <div
                    key={cat.categoryId}
                    className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-xs font-bold text-slate-400 w-4 text-center">
                        #{idx + 1}
                      </span>
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-white"
                        style={{ backgroundColor: cat.color }}
                      >
                        <CategoryIcon name={cat.icon} className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800">{cat.name}</p>
                        <div className="w-32 bg-slate-100 rounded-full h-1.5 mt-1.5 overflow-hidden">
                          <div
                            className="h-1.5 rounded-full"
                            style={{
                              backgroundColor: cat.color,
                              width: `${cat.percentage}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-sm font-bold text-slate-900">
                        {formatCurrency(cat.amount)}
                      </p>
                      <span className="text-xs font-semibold text-slate-400">
                        {cat.percentage}% of expenses
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
