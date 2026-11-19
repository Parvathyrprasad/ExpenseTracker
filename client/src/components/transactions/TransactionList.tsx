import React, { useState, useEffect } from 'react';
import { Transaction, Category, TransactionType } from '../../types';
import { api } from '../../lib/api';
import { formatCurrency } from '../../lib/utils';
import { CategoryIcon } from '../common/CategoryIcon';
import { TransactionModal } from './TransactionModal';
import { 
  Plus, 
  Search, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Edit2, 
  Trash2, 
  Calendar, 
  CreditCard, 
  Loader2, 
  AlertCircle,
  Receipt,
  CheckCircle2
} from 'lucide-react';
import { format } from 'date-fns';

export const TransactionList: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | TransactionType>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [transactionToEdit, setTransactionToEdit] = useState<Transaction | null>(null);
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

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (typeFilter !== 'ALL') params.type = typeFilter;
      if (search.trim()) params.search = search.trim();

      const res = await api.get('/transactions', { params });
      if (res.data?.success && res.data?.data?.transactions) {
        setTransactions(res.data.data.transactions);
      }
    } catch (err: any) {
      setActionError(err.message || 'Failed to fetch transactions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [typeFilter, search]);

  const handleDelete = async (transaction: Transaction) => {
    if (!window.confirm(`Delete transaction "${transaction.title}"?`)) return;

    try {
      setActionError(null);
      await api.delete(`/transactions/${transaction.id}`);
      setActionSuccess('Transaction deleted successfully.');
      setTimeout(() => setActionSuccess(null), 3000);
      fetchTransactions();
    } catch (err: any) {
      setActionError(err.response?.data?.message || err.message || 'Failed to delete transaction');
    }
  };

  // Metrics summary
  const totalIncome = transactions
    .filter((t) => t.type === 'INCOME')
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);

  const totalExpense = transactions
    .filter((t) => t.type === 'EXPENSE')
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);

  const netBalance = totalIncome - totalExpense;

  return (
    <div className="space-y-6">
      {/* Top Header & Metrics */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-emerald-600" />
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Transactions</h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage your personal income and expenses with exact decimal precision
          </p>
        </div>

        <button
          onClick={() => {
            setTransactionToEdit(null);
            setIsModalOpen(true);
          }}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-sm shadow-emerald-200 transition-all hover:shadow-md"
        >
          <Plus className="w-4 h-4" />
          <span>Record Transaction</span>
        </button>
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
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <span className="text-xs text-slate-500 font-medium">Income (Filtered)</span>
          <p className="text-xl font-bold text-emerald-600 mt-1 flex items-center">
            <ArrowUpRight className="w-5 h-5 mr-1" />
            {formatCurrency(totalIncome)}
          </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <span className="text-xs text-slate-500 font-medium">Expenses (Filtered)</span>
          <p className="text-xl font-bold text-rose-600 mt-1 flex items-center">
            <ArrowDownLeft className="w-5 h-5 mr-1" />
            {formatCurrency(totalExpense)}
          </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <span className="text-xs text-slate-500 font-medium">Net Cashflow</span>
          <p className={`text-xl font-bold mt-1 ${netBalance >= 0 ? 'text-slate-900' : 'text-rose-600'}`}>
            {formatCurrency(netBalance)}
          </p>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full sm:w-72">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search title or notes..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
          />
        </div>

        {/* Type Filter Pills */}
        <div className="flex items-center space-x-1.5 w-full sm:w-auto">
          {(['ALL', 'EXPENSE', 'INCOME'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                typeFilter === t
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {t === 'ALL' ? 'All' : t === 'EXPENSE' ? 'Expenses' : 'Incomes'}
            </button>
          ))}
        </div>
      </div>

      {/* Transactions Data Table / Cards */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mb-2" />
            <span className="text-xs font-medium">Loading transactions...</span>
          </div>
        ) : transactions.length === 0 ? (
          <div className="py-16 text-center text-slate-500">
            <Receipt className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-700">No transactions found</p>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              {search
                ? `No transactions matched your search query "${search}"`
                : 'Get started by clicking "Record Transaction" above.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[11px] font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">Transaction / Payee</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Method</th>
                  <th className="py-3 px-4 text-right">Amount (₹)</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Title & Notes */}
                    <td className="py-3.5 px-4 font-semibold text-slate-900 max-w-xs">
                      <div>{tx.title}</div>
                      {tx.note && (
                        <div className="text-[11px] font-normal text-slate-400 truncate mt-0.5">
                          {tx.note}
                        </div>
                      )}
                    </td>

                    {/* Category */}
                    <td className="py-3.5 px-4">
                      {tx.category ? (
                        <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-[11px] font-medium">
                          <span
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: tx.category.color }}
                          />
                          <CategoryIcon name={tx.category.icon} className="w-3 h-3 text-slate-500" />
                          <span>{tx.category.name}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400">Uncategorized</span>
                      )}
                    </td>

                    {/* Date */}
                    <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{format(new Date(tx.transactionDate), 'dd MMM yyyy')}</span>
                      </div>
                    </td>

                    {/* Payment Method */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600">
                        <CreditCard className="w-3 h-3 text-slate-400" />
                        {tx.paymentMethod}
                      </span>
                    </td>

                    {/* Amount */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <span
                        className={`font-bold text-sm ${
                          tx.type === 'INCOME' ? 'text-emerald-600' : 'text-rose-600'
                        }`}
                      >
                        {tx.type === 'INCOME' ? '+ ' : '− '}
                        {formatCurrency(tx.amount)}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <div className="inline-flex items-center space-x-1">
                        <button
                          onClick={() => {
                            setTransactionToEdit(tx);
                            setIsModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                          title="Edit Transaction"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(tx)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                          title="Delete Transaction"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchTransactions}
        transactionToEdit={transactionToEdit}
        categories={categories}
      />
    </div>
  );
};
