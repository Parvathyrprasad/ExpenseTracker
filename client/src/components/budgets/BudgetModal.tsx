import React, { useState, useEffect } from 'react';
import { Budget, Category } from '../../types';
import { api } from '../../lib/api';
import { X, Loader2, AlertCircle, IndianRupee } from 'lucide-react';

interface BudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  budgetToEdit?: Budget | null;
  categories: Category[];
  initialMonth?: number;
  initialYear?: number;
}

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

export const BudgetModal: React.FC<BudgetModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  budgetToEdit,
  categories,
  initialMonth,
  initialYear,
}) => {
  const currentMonth = initialMonth || new Date().getMonth() + 1;
  const currentYear = initialYear || new Date().getFullYear();

  const [categoryId, setCategoryId] = useState('');
  const [month, setMonth] = useState(currentMonth);
  const [year, setYear] = useState(currentYear);
  const [amount, setAmount] = useState('');
  const [alertThreshold, setAlertThreshold] = useState(0.8);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Budgets are only applicable to expense categories
  const expenseCategories = categories.filter((c) => c.type === 'EXPENSE');

  useEffect(() => {
    if (budgetToEdit) {
      setCategoryId(budgetToEdit.categoryId);
      setMonth(budgetToEdit.month);
      setYear(budgetToEdit.year);
      setAmount(budgetToEdit.amount);
      setAlertThreshold(budgetToEdit.alertThreshold);
    } else {
      if (expenseCategories.length > 0) {
        setCategoryId(expenseCategories[0].id);
      }
      setMonth(currentMonth);
      setYear(currentYear);
      setAmount('');
      setAlertThreshold(0.8);
    }
    setError(null);
  }, [budgetToEdit, isOpen, categories, currentMonth, currentYear]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Please enter a valid positive budget amount.');
      return;
    }

    if (!categoryId) {
      setError('Please select an expense category.');
      return;
    }

    try {
      setIsSubmitting(true);
      if (budgetToEdit) {
        await api.put(`/budgets/${budgetToEdit.id}`, {
          amount: numAmount,
          alertThreshold,
        });
      } else {
        await api.post('/budgets', {
          categoryId,
          month,
          year,
          amount: numAmount,
          alertThreshold,
        });
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(
        err.response?.data?.message || err.message || 'Failed to save budget.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-scale-up">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">
            {budgetToEdit ? 'Edit Category Budget' : 'Set Category Budget'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2 text-rose-800 text-xs">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Category */}
          <div>
            <label htmlFor="bgtCat" className="block text-xs font-semibold text-slate-600 mb-1">
              Expense Category
            </label>
            <select
              id="bgtCat"
              disabled={!!budgetToEdit}
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white disabled:bg-slate-100"
            >
              {expenseCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Month & Year (disabled on edit) */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="bgtMonth" className="block text-xs font-semibold text-slate-600 mb-1">
                Month
              </label>
              <select
                id="bgtMonth"
                disabled={!!budgetToEdit}
                value={month}
                onChange={(e) => setMonth(parseInt(e.target.value, 10))}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white disabled:bg-slate-100"
              >
                {MONTH_OPTIONS.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="bgtYear" className="block text-xs font-semibold text-slate-600 mb-1">
                Year
              </label>
              <input
                id="bgtYear"
                type="number"
                disabled={!!budgetToEdit}
                value={year}
                onChange={(e) => setYear(parseInt(e.target.value, 10))}
                min={2020}
                max={2050}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white disabled:bg-slate-100"
              />
            </div>
          </div>

          {/* Budget Limit Amount */}
          <div>
            <label htmlFor="bgtAmount" className="block text-xs font-semibold text-slate-600 mb-1">
              Monthly Budget Limit (INR)
            </label>
            <div className="relative rounded-lg shadow-xs">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <IndianRupee className="w-4 h-4 text-emerald-600" />
              </div>
              <input
                id="bgtAmount"
                type="number"
                step="0.01"
                min="1"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="e.g. 5000.00"
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-semibold"
              />
            </div>
          </div>

          {/* Alert Threshold Slider */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label htmlFor="bgtThreshold" className="text-xs font-semibold text-slate-600">
                Warning Notification Threshold
              </label>
              <span className="text-xs font-bold text-amber-600">
                {Math.round(alertThreshold * 100)}%
              </span>
            </div>
            <input
              id="bgtThreshold"
              type="range"
              min="0.5"
              max="1.0"
              step="0.05"
              value={alertThreshold}
              onChange={(e) => setAlertThreshold(parseFloat(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Highlights in amber when spending reaches {Math.round(alertThreshold * 100)}% of the limit.
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg disabled:opacity-50 flex items-center shadow-xs"
            >
              {isSubmitting && <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />}
              {budgetToEdit ? 'Save Budget' : 'Set Budget'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
