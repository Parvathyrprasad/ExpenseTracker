import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { DashboardData, Category } from '../../types';
import { api } from '../../lib/api';
import { formatCurrency } from '../../lib/utils';
import { CategoryIcon } from '../common/CategoryIcon';
import { TransactionModal } from '../transactions/TransactionModal';
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  Wallet, 
  Plus, 
  Target, 
  AlertTriangle, 
  Calendar, 
  Receipt, 
  CheckCircle2, 
  ArrowRight,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';

export const DashboardOverview: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const [dashRes, catRes] = await Promise.all([
        api.get('/analytics/dashboard'),
        api.get('/categories'),
      ]);

      if (dashRes.data?.success && dashRes.data?.data) {
        setData(dashRes.data.data);
      }
      if (catRes.data?.success && catRes.data?.data?.categories) {
        setCategories(catRes.data.data.categories);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const currentMonthName = new Date().toLocaleString('default', { month: 'long' });

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 rounded-2xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 mb-3">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              INR (₹) Standard • Milestone 4 Active
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Welcome back, {user?.firstName}!
            </h1>
            <p className="text-slate-300 mt-2 text-sm sm:text-base max-w-2xl leading-relaxed">
              Here is your financial executive summary for {currentMonthName} {new Date().getFullYear()}.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setIsTxModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-sm shadow-emerald-200 transition-all hover:shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>Record Transaction</span>
            </button>
            <Link
              to="/budgets"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl text-xs sm:text-sm font-semibold backdrop-blur-sm transition-all"
            >
              <Target className="w-4 h-4" />
              <span>Manage Budgets</span>
            </Link>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-rose-800 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-600 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Budget Warning Banner if budgets exceeded */}
      {data && (data.budgetSummary.exceededCount > 0 || data.budgetSummary.warningCount > 0) && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-amber-900 text-sm">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <span>
              <strong>Budget Alert for {currentMonthName}:</strong>{' '}
              {data.budgetSummary.exceededCount > 0 && `${data.budgetSummary.exceededCount} category budget(s) exceeded! `}
              {data.budgetSummary.warningCount > 0 && `${data.budgetSummary.warningCount} category budget(s) near limit.`}
            </span>
          </div>
          <Link
            to="/budgets"
            className="text-xs font-bold text-amber-800 hover:underline flex items-center gap-1 flex-shrink-0"
          >
            Review Budgets <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* Summary KPI Cards */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mb-2" />
          <span className="text-xs font-medium">Loading financial metrics...</span>
        </div>
      ) : data ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Balance */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <span className="text-xs text-slate-400 font-medium">Net Balance ({currentMonthName})</span>
              <p className={`text-2xl font-bold mt-1.5 ${parseFloat(data.currentMonth.balance) >= 0 ? 'text-slate-900' : 'text-rose-600'}`}>
                {formatCurrency(data.currentMonth.balance)}
              </p>
              <span className="text-[11px] text-slate-400 mt-1 block">
                All-time Balance: {formatCurrency(data.allTime.balance)}
              </span>
            </div>

            {/* Total Income */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <span className="text-xs text-slate-400 font-medium">Monthly Income</span>
              <p className="text-2xl font-bold text-emerald-600 mt-1.5 flex items-center">
                <ArrowUpRight className="w-6 h-6 mr-1" />
                {formatCurrency(data.currentMonth.income)}
              </p>
              <span className="text-[11px] text-slate-400 mt-1 block">
                All-time Income: {formatCurrency(data.allTime.income)}
              </span>
            </div>

            {/* Total Expenses */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <span className="text-xs text-slate-400 font-medium">Monthly Expenses</span>
              <p className="text-2xl font-bold text-rose-600 mt-1.5 flex items-center">
                <ArrowDownLeft className="w-6 h-6 mr-1" />
                {formatCurrency(data.currentMonth.expense)}
              </p>
              <span className="text-[11px] text-slate-400 mt-1 block">
                All-time Expense: {formatCurrency(data.allTime.expense)}
              </span>
            </div>

            {/* Monthly Budget Summary */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-medium">Monthly Budget</span>
                <span className="text-xs font-bold text-slate-700">
                  {formatCurrency(data.budgetSummary.totalSpent)} / {formatCurrency(data.budgetSummary.totalBudgeted)}
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 mt-3 overflow-hidden">
                <div
                  className={`h-2.5 rounded-full transition-all ${
                    parseFloat(data.budgetSummary.totalBudgeted) > 0 &&
                    parseFloat(data.budgetSummary.totalSpent) >= parseFloat(data.budgetSummary.totalBudgeted)
                      ? 'bg-rose-500'
                      : 'bg-emerald-500'
                  }`}
                  style={{
                    width: `${
                      parseFloat(data.budgetSummary.totalBudgeted) > 0
                        ? Math.min(
                            (parseFloat(data.budgetSummary.totalSpent) /
                              parseFloat(data.budgetSummary.totalBudgeted)) *
                              100,
                            100
                          )
                        : 0
                    }%`,
                  }}
                />
              </div>
              <span className="text-[11px] text-slate-400 mt-2 block">
                {parseFloat(data.budgetSummary.totalRemaining) >= 0
                  ? `${formatCurrency(data.budgetSummary.totalRemaining)} remaining`
                  : `Overspent by ${formatCurrency(Math.abs(parseFloat(data.budgetSummary.totalRemaining)))}`}
              </span>
            </div>
          </div>

          {/* Grid: Recent Transactions & Top Spending Categories */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Transactions Card (2 Cols) */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-emerald-600" />
                  <h2 className="text-sm font-bold text-slate-900">Recent Transactions</h2>
                </div>
                <Link
                  to="/transactions"
                  className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                >
                  View All <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {data.recentTransactions.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">
                  No transactions recorded yet. Click "Record Transaction" to get started.
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {data.recentTransactions.map((tx) => (
                    <div
                      key={tx.id}
                      className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className="w-9 h-9 rounded-xl flex items-center justify-center text-white"
                          style={{ backgroundColor: tx.category?.color || '#6B7280' }}
                        >
                          <CategoryIcon name={tx.category?.icon || 'Tag'} className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">
                            {tx.title}
                          </p>
                          <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                            <span>{tx.category?.name}</span>
                            <span>•</span>
                            <span className="flex items-center">
                              <Calendar className="w-3 h-3 mr-0.5" />
                              {format(new Date(tx.transactionDate), 'dd MMM yyyy')}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <span
                          className={`text-xs sm:text-sm font-bold ${
                            tx.type === 'INCOME' ? 'text-emerald-600' : 'text-rose-600'
                          }`}
                        >
                          {tx.type === 'INCOME' ? '+ ' : '− '}
                          {formatCurrency(tx.amount)}
                        </span>
                        <span className="text-[10px] block text-slate-400 uppercase mt-0.5">
                          {tx.paymentMethod}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Top Categories Card (1 Col) */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between">
              <div>
                <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Wallet className="w-4 h-4 text-emerald-600" />
                    <h2 className="text-sm font-bold text-slate-900">Top Expenses ({currentMonthName})</h2>
                  </div>
                  <Link
                    to="/reports"
                    className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                  >
                    Reports <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                {data.topCategories.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-400">
                    No expense data for this month.
                  </div>
                ) : (
                  <div className="p-4 space-y-4">
                    {data.topCategories.map((c) => (
                      <div key={c.categoryId} className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <span
                              className="w-2.5 h-2.5 rounded-full"
                              style={{ backgroundColor: c.color }}
                            />
                            <span className="font-semibold text-slate-800">{c.name}</span>
                          </div>
                          <span className="font-bold text-slate-900">
                            {formatCurrency(c.amount)} ({c.percentage}%)
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="h-1.5 rounded-full"
                            style={{ backgroundColor: c.color, width: `${c.percentage}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* View Full Reports Link */}
              <div className="p-4 bg-slate-50 border-t border-slate-100">
                <Link
                  to="/reports"
                  className="w-full flex items-center justify-center gap-2 py-2 text-xs font-bold text-slate-700 hover:text-slate-900 bg-white rounded-xl border border-slate-200 shadow-2xs"
                >
                  <span>Open Full Visual Analytics</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </>
      ) : null}

      {/* Transaction Modal */}
      <TransactionModal
        isOpen={isTxModalOpen}
        onClose={() => setIsTxModalOpen(false)}
        onSuccess={fetchDashboard}
        categories={categories}
      />
    </div>
  );
};
