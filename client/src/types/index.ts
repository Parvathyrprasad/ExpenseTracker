export type CategoryType = 'INCOME' | 'EXPENSE';
export type TransactionType = 'INCOME' | 'EXPENSE';
export type PaymentMethod = 'CASH' | 'CARD' | 'UPI' | 'BANK_TRANSFER' | 'OTHER';
export type BudgetStatus = 'NORMAL' | 'WARNING' | 'EXCEEDED';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  currency: string;
  createdAt: string;
}

export interface Category {
  id: string;
  userId?: string | null;
  name: string;
  type: CategoryType;
  icon: string;
  color: string;
  isDefault: boolean;
  createdAt?: string;
}

export interface Transaction {
  id: string;
  userId: string;
  categoryId: string;
  category?: Category;
  title: string;
  amount: string;
  type: TransactionType;
  transactionDate: string;
  note?: string | null;
  paymentMethod: PaymentMethod;
  createdAt: string;
  updatedAt: string;
}

export interface Budget {
  id: string;
  userId: string;
  categoryId: string;
  category?: Category;
  month: number;
  year: number;
  amount: string;
  alertThreshold: number;
  spent: string;
  remaining: string;
  percentageUsed: number;
  status: BudgetStatus;
  createdAt: string;
  updatedAt: string;
}

export interface BudgetSummary {
  totalBudgeted: string;
  totalSpent: string;
  totalRemaining: string;
  warningCount: number;
  exceededCount: number;
}

export interface DashboardData {
  currentMonth: {
    month: number;
    year: number;
    income: string;
    expense: string;
    balance: string;
  };
  allTime: {
    income: string;
    expense: string;
    balance: string;
  };
  recentTransactions: Transaction[];
  budgetSummary: BudgetSummary;
  topCategories: Array<{
    categoryId: string;
    name: string;
    icon: string;
    color: string;
    amount: string;
    percentage: number;
  }>;
}

export interface ReportsData {
  period: 'month' | 'year';
  month: number;
  year: number;
  summary: {
    totalIncome: string;
    totalExpense: string;
    netSavings: string;
    savingsRate: number;
  };
  categoryBreakdown: Array<{
    categoryId: string;
    name: string;
    icon: string;
    color: string;
    amount: string;
    percentage: number;
  }>;
  monthlyTrend: Array<{
    month: string;
    income: number;
    expense: number;
    savings: number;
  }>;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: Array<{ path: string; message: string }>;
}
