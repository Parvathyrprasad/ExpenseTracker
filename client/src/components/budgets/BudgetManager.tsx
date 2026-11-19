import React, { useState, useEffect } from 'react';
import { Budget, Category, BudgetSummary } from '../../types';
import { api } from '../../lib/api';
import { formatCurrency } from '../../lib/utils';
import { CategoryIcon } from '../common/CategoryIcon';
import { BudgetModal } from './BudgetModal';
import { 
  Plus, 
  ChevronLeft, 
  ChevronRight, 
  Edit2, 
  Trash2, 
  AlertTriangle, 
  CheckCircle2, 
  Target, 
  Loader2, 
  AlertCircle 
} from 'lucide-react';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const BudgetManager: React.FC = () => {
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [summary, setSummary] = useState<BudgetSummary | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [budgetToEdit, setBudgetToEdit] = useState<Budget | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      if (res.data?.success && res.data?.data?.categories) {
        setCategories(res.data.data.categories);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const fetchBudgets = async () => {
    try {
      setLoading(true);
      const res = await api.get('/budgets', {
        params: { month: selectedMonth, year: selectedYear },
      });
      if (res.data?.success && res.data?.data) {
        setBudgets(res.data.data.budgets);
        setSummary(res.data.data.summary);
      }
    } catch (err: any) {
      setActionError(err.message || 'Failed to load budgets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchBudgets();
  }, [selectedMonth, selectedYear]);

  const handlePrevMonth = () => {
    if (selectedMonth === 1) {
      setSelectedMonth(12);
      setSelectedYear(selectedYear - 1);
    } else {
      setSelectedMonth(selectedMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 12) {
      setSelectedMonth(1);
      setSelectedYear(selectedYear + 1);
    } else {
      setSelectedMonth(selectedMonth + 1);
    }
  };

  const handleDelete = async (budget: Budget) => {
    const catName = budget.category?.name || 'Category';
    if (!window.confirm(`Delete budget limit for "${catName}"?`)) return;

    try {
      setActionError(null);
      await api.delete(`/budgets/${budget.id}`);
      setActionSuccess(`Budget for "${catName}" deleted.`);
      setTimeout(() => setActionSuccess(null), 3000);
      fetchBudgets();
    } catch (err: any) {
      setActionError(err.response?.data?.message || err.message || 'Failed to delete budget');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Controls */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-emerald-600" />
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Budget Management</h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Set monthly category limits and monitor spending thresholds in real time
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Month Selector */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-white transition-colors"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 text-xs font-bold text-slate-800 min-w-[120px] text-center">
              {MONTH_NAMES[selectedMonth - 1]} {selectedYear}
            </span>
            <button
              onClick={handleNextMonth}
              className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-white transition-colors"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => {
              setBudgetToEdit(null);
              setIsModalOpen(true);
            }}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-sm shadow-emerald-200 transition-all hover:shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>Set Category Budget</span>
          </button>
        </div>
      </div>

      {actionError && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-rose-800 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-600 mt-0.5" />
          <span>{actionError}</span>
        </div>
      )}

      {actionSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-2.5 text-emerald-800 text-sm">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-600 mt-0.5" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Summary KPI Cards */}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
            <span className="text-xs text-slate-500 font-medium">Total Budgeted</span>
            <p className="text-xl font-bold text-slate-900 mt-1">
              {formatCurrency(summary.totalBudgeted)}
            </p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
            <span className="text-xs text-slate-500 font-medium">Total Spent</span>
            <p className="text-xl font-bold text-slate-800 mt-1">
              {formatCurrency(summary.totalSpent)}
            </p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
            <span className="text-xs text-slate-500 font-medium">
              {parseFloat(summary.totalRemaining) >= 0 ? 'Remaining Budget' : 'Overall Overspent'}
            </span>
            <p
              className={`text-xl font-bold mt-1 ${
                parseFloat(summary.totalRemaining) >= 0 ? 'text-emerald-600' : 'text-rose-600'
              }`}
            >
              {formatCurrency(Math.abs(parseFloat(summary.totalRemaining)))}
            </p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
            <span className="text-xs text-slate-500 font-medium">Status Alerts</span>
            <div className="flex items-center gap-2 mt-1">
              <span className={`px-2 py-0.5 text-xs font-bold rounded-md ${summary.exceededCount > 0 ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-500'}`}>
                {summary.exceededCount} Exceeded
              </span>
              <span className={`px-2 py-0.5 text-xs font-bold rounded-md ${summary.warningCount > 0 ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'}`}>
                {summary.warningCount} Warnings
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Budget Cards Grid */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mb-2" />
          <span className="text-xs font-medium">Calculating budget usages...</span>
        </div>
      ) : budgets.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
          <Target className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">
            No budgets configured for {MONTH_NAMES[selectedMonth - 1]} {selectedYear}
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto mb-4">
            Set monthly targets for your expense categories (Food, Groceries, Rent, etc.) to get proactive overspending warnings.
          </p>
          <button
            onClick={() => {
              setBudgetToEdit(null);
              setIsModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold hover:bg-emerald-700 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Create First Budget</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {budgets.map((b) => {
            const isExceeded = b.status === 'EXCEEDED';
            const isWarning = b.status === 'WARNING';

            const barColor = isExceeded
              ? 'bg-rose-500'
              : isWarning
              ? 'bg-amber-500'
              : 'bg-emerald-500';

            const badgeColor = isExceeded
              ? 'bg-rose-50 text-rose-700 border-rose-200'
              : isWarning
              ? 'bg-amber-50 text-amber-700 border-amber-200'
              : 'bg-emerald-50 text-emerald-700 border-emerald-200';

            const statusText = isExceeded
              ? 'Budget Exceeded'
              : isWarning
              ? `${Math.round(b.alertThreshold * 100)}% Threshold Warning`
              : 'Within Budget';

            return (
              <div
                key={b.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  {/* Category Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-2xs"
                        style={{ backgroundColor: b.category?.color || '#6B7280' }}
                      >
                        <CategoryIcon name={b.category?.icon || 'Tag'} className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 leading-tight">
                          {b.category?.name || 'Category'}
                        </h3>
                        <span className={`inline-flex items-center gap-1 mt-1 px-2 py-0.5 text-[10px] font-bold rounded-full border ${badgeColor}`}>
                          {isExceeded && <AlertTriangle className="w-3 h-3" />}
                          {isWarning && <AlertTriangle className="w-3 h-3" />}
                          {!isExceeded && !isWarning && <CheckCircle2 className="w-3 h-3" />}
                          {statusText}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => {
                          setBudgetToEdit(b);
                          setIsModalOpen(true);
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                        title="Edit Budget Limit"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(b)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                        title="Delete Budget"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Amounts */}
                  <div className="mt-5 flex items-baseline justify-between">
                    <div>
                      <span className="text-[11px] text-slate-400 font-medium">Spent so far</span>
                      <p className="text-lg font-bold text-slate-900 mt-0.5">
                        {formatCurrency(b.spent)}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-[11px] text-slate-400 font-medium">Budget Limit</span>
                      <p className="text-sm font-semibold text-slate-600 mt-0.5">
                        {formatCurrency(b.amount)}
                      </p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-3">
                    <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                      <div
                        className={`h-2.5 rounded-full transition-all duration-500 ${barColor}`}
                        style={{ width: `${Math.min(b.percentageUsed, 100)}%` }}
                      />
                    </div>
                    <div className="flex justify-between items-center text-[11px] text-slate-500 mt-1.5 font-medium">
                      <span>{b.percentageUsed}% used</span>
                      <span className={isExceeded ? 'text-rose-600 font-bold' : ''}>
                        {isExceeded
                          ? `Exceeded by ${formatCurrency(Math.abs(parseFloat(b.remaining)))}`
                          : `${formatCurrency(b.remaining)} left`}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      <BudgetModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchBudgets}
        budgetToEdit={budgetToEdit}
        categories={categories}
        initialMonth={selectedMonth}
        initialYear={selectedYear}
      />
    </div>
  );
};
