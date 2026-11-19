import React, { useState, useEffect } from 'react';
import { Category, CategoryType } from '../../types';
import { api } from '../../lib/api';
import { CategoryIcon } from '../common/CategoryIcon';
import { CategoryModal } from './CategoryModal';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Lock, 
  Tag, 
  Loader2, 
  AlertCircle,
  CheckCircle2
} from 'lucide-react';

export const CategoryManager: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'ALL' | CategoryType>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState<Category | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await api.get('/categories');
      if (res.data?.success && res.data?.data?.categories) {
        setCategories(res.data.data.categories);
      }
    } catch (err: any) {
      setActionError(err.message || 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleDelete = async (category: Category) => {
    if (category.isDefault) return;
    if (!window.confirm(`Are you sure you want to delete "${category.name}"?`)) {
      return;
    }

    try {
      setActionError(null);
      await api.delete(`/categories/${category.id}`);
      setActionSuccess(`Category "${category.name}" deleted successfully.`);
      setTimeout(() => setActionSuccess(null), 3000);
      fetchCategories();
    } catch (err: any) {
      setActionError(
        err.response?.data?.message || err.message || 'Failed to delete category.'
      );
    }
  };

  const filteredCategories = categories.filter((c) => {
    if (activeTab === 'ALL') return true;
    return c.type === activeTab;
  });

  const defaultCount = categories.filter((c) => c.isDefault).length;
  const customCount = categories.filter((c) => !c.isDefault).length;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <Tag className="w-5 h-5 text-emerald-600" />
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Categories Management</h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Organize transactions with {defaultCount} system defaults and {customCount} custom categories
          </p>
        </div>

        <button
          onClick={() => {
            setCategoryToEdit(null);
            setIsModalOpen(true);
          }}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-sm shadow-emerald-200 transition-all hover:shadow-md"
        >
          <Plus className="w-4 h-4" />
          <span>Add Custom Category</span>
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

      {/* Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 pb-3">
        {(['ALL', 'EXPENSE', 'INCOME'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === tab
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {tab === 'ALL' ? 'All Categories' : tab === 'EXPENSE' ? 'Expense Categories' : 'Income Categories'}
            <span className="ml-1.5 px-1.5 py-0.5 text-[10px] rounded-full bg-slate-200/50 text-current">
              {tab === 'ALL'
                ? categories.length
                : categories.filter((c) => c.type === tab).length}
            </span>
          </button>
        ))}
      </div>

      {/* Category Grid */}
      {loading ? (
        <div className="py-16 flex flex-col items-center justify-center text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mb-2" />
          <span className="text-xs font-medium">Loading categories...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredCategories.map((cat) => (
            <div
              key={cat.id}
              className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs hover:shadow-sm transition-all flex flex-col justify-between"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-2xs"
                    style={{ backgroundColor: cat.color }}
                  >
                    <CategoryIcon name={cat.icon} className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 leading-tight">
                      {cat.name}
                    </h3>
                    <span
                      className={`inline-block mt-1 px-2 py-0.5 text-[10px] font-semibold rounded-full ${
                        cat.type === 'INCOME'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}
                    >
                      {cat.type}
                    </span>
                  </div>
                </div>

                {cat.isDefault ? (
                  <span
                    className="flex items-center text-[10px] font-semibold text-slate-400 bg-slate-100 px-2 py-1 rounded-md"
                    title="Built-in System Default Category"
                  >
                    <Lock className="w-3 h-3 mr-1 text-slate-400" />
                    Default
                  </span>
                ) : (
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => {
                        setCategoryToEdit(cat);
                        setIsModalOpen(true);
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                      title="Edit Custom Category"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(cat)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                      title="Delete Custom Category"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <CategoryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchCategories}
        categoryToEdit={categoryToEdit}
      />
    </div>
  );
};
