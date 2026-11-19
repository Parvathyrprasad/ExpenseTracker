import { prisma } from '../prisma';
import { budgetService } from './budget.service';
import { ReportsQuery } from '../schemas/analytics.schema';

const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

export class AnalyticsService {
  /**
   * Comprehensive dashboard summary for the authenticated user
   */
  async getDashboardSummary(userId: string) {
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    const startOfMonth = new Date(currentYear, currentMonth - 1, 1);
    const endOfMonth = new Date(currentYear, currentMonth, 0, 23, 59, 59, 999);

    // 1. Current month Income and Expenses
    const [monthIncomeAgg, monthExpenseAgg, allTimeIncomeAgg, allTimeExpenseAgg] =
      await Promise.all([
        prisma.transaction.aggregate({
          _sum: { amount: true },
          where: {
            userId,
            type: 'INCOME',
            transactionDate: { gte: startOfMonth, lte: endOfMonth },
          },
        }),
        prisma.transaction.aggregate({
          _sum: { amount: true },
          where: {
            userId,
            type: 'EXPENSE',
            transactionDate: { gte: startOfMonth, lte: endOfMonth },
          },
        }),
        prisma.transaction.aggregate({
          _sum: { amount: true },
          where: { userId, type: 'INCOME' },
        }),
        prisma.transaction.aggregate({
          _sum: { amount: true },
          where: { userId, type: 'EXPENSE' },
        }),
      ]);

    const monthIncome = monthIncomeAgg._sum.amount
      ? parseFloat(monthIncomeAgg._sum.amount.toString())
      : 0;
    const monthExpense = monthExpenseAgg._sum.amount
      ? parseFloat(monthExpenseAgg._sum.amount.toString())
      : 0;
    const monthBalance = Math.round((monthIncome - monthExpense) * 100) / 100;

    const allTimeIncome = allTimeIncomeAgg._sum.amount
      ? parseFloat(allTimeIncomeAgg._sum.amount.toString())
      : 0;
    const allTimeExpense = allTimeExpenseAgg._sum.amount
      ? parseFloat(allTimeExpenseAgg._sum.amount.toString())
      : 0;
    const allTimeBalance = Math.round((allTimeIncome - allTimeExpense) * 100) / 100;

    // 2. Recent 5 Transactions
    const recentTransactions = await prisma.transaction.findMany({
      where: { userId },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            icon: true,
            color: true,
            type: true,
          },
        },
      },
      orderBy: [{ transactionDate: 'desc' }, { createdAt: 'desc' }],
      take: 5,
    });

    // 3. Current month budget status
    const budgetData = await budgetService.getBudgets(userId, {
      month: currentMonth,
      year: currentYear,
    });

    // 4. Category-wise expense breakdown for current month (Top 5)
    const categoryGrouped = await prisma.transaction.groupBy({
      by: ['categoryId'],
      _sum: { amount: true },
      where: {
        userId,
        type: 'EXPENSE',
        transactionDate: { gte: startOfMonth, lte: endOfMonth },
      },
      orderBy: { _sum: { amount: 'desc' } },
      take: 5,
    });

    const categoryIds = categoryGrouped.map((c) => c.categoryId);
    const categoryDetails = await prisma.category.findMany({
      where: { id: { in: categoryIds } },
    });

    const categoryMap = new Map(categoryDetails.map((c) => [c.id, c]));

    const topCategories = categoryGrouped.map((cg) => {
      const cat = categoryMap.get(cg.categoryId);
      const amount = cg._sum.amount ? parseFloat(cg._sum.amount.toString()) : 0;
      const percentage =
        monthExpense > 0 ? Math.round((amount / monthExpense) * 100) : 0;

      return {
        categoryId: cg.categoryId,
        name: cat?.name || 'Unknown',
        icon: cat?.icon || 'Tag',
        color: cat?.color || '#6B7280',
        amount: amount.toFixed(2),
        percentage,
      };
    });

    return {
      currentMonth: {
        month: currentMonth,
        year: currentYear,
        income: monthIncome.toFixed(2),
        expense: monthExpense.toFixed(2),
        balance: monthBalance.toFixed(2),
      },
      allTime: {
        income: allTimeIncome.toFixed(2),
        expense: allTimeExpense.toFixed(2),
        balance: allTimeBalance.toFixed(2),
      },
      recentTransactions: recentTransactions.map((t) => ({
        ...t,
        amount: t.amount.toFixed(2),
      })),
      budgetSummary: budgetData.summary,
      topCategories,
    };
  }

  /**
   * Detailed Reports with monthly & yearly filters and Recharts chart structures
   */
  async getReports(userId: string, query: ReportsQuery) {
    const now = new Date();
    const period = query.period || 'month';
    const month = parseInt(query.month?.toString() || (now.getMonth() + 1).toString(), 10);
    const year = parseInt(query.year?.toString() || now.getFullYear().toString(), 10);

    let startDate: Date;
    let endDate: Date;

    if (period === 'month') {
      startDate = new Date(year, month - 1, 1);
      endDate = new Date(year, month, 0, 23, 59, 59, 999);
    } else {
      startDate = new Date(year, 0, 1);
      endDate = new Date(year, 11, 31, 23, 59, 59, 999);
    }

    // 1. Period totals
    const [incomeAgg, expenseAgg] = await Promise.all([
      prisma.transaction.aggregate({
        _sum: { amount: true },
        where: {
          userId,
          type: 'INCOME',
          transactionDate: { gte: startDate, lte: endDate },
        },
      }),
      prisma.transaction.aggregate({
        _sum: { amount: true },
        where: {
          userId,
          type: 'EXPENSE',
          transactionDate: { gte: startDate, lte: endDate },
        },
      }),
    ]);

    const totalIncome = incomeAgg._sum.amount
      ? parseFloat(incomeAgg._sum.amount.toString())
      : 0;
    const totalExpense = expenseAgg._sum.amount
      ? parseFloat(expenseAgg._sum.amount.toString())
      : 0;
    const netSavings = Math.round((totalIncome - totalExpense) * 100) / 100;
    const savingsRate =
      totalIncome > 0
        ? Math.max(0, Math.round((netSavings / totalIncome) * 100))
        : 0;

    // 2. Category-wise expense breakdown (for Donut / Pie Chart)
    const categoryGrouped = await prisma.transaction.groupBy({
      by: ['categoryId'],
      _sum: { amount: true },
      where: {
        userId,
        type: 'EXPENSE',
        transactionDate: { gte: startDate, lte: endDate },
      },
      orderBy: { _sum: { amount: 'desc' } },
    });

    const categoryIds = categoryGrouped.map((c) => c.categoryId);
    const categoryDetails = await prisma.category.findMany({
      where: { id: { in: categoryIds } },
    });
    const categoryMap = new Map(categoryDetails.map((c) => [c.id, c]));

    const categoryBreakdown = categoryGrouped.map((cg) => {
      const cat = categoryMap.get(cg.categoryId);
      const amount = cg._sum.amount ? parseFloat(cg._sum.amount.toString()) : 0;
      const percentage =
        totalExpense > 0 ? Math.round((amount / totalExpense) * 100) : 0;

      return {
        categoryId: cg.categoryId,
        name: cat?.name || 'Unknown',
        icon: cat?.icon || 'Tag',
        color: cat?.color || '#6B7280',
        amount: amount.toFixed(2),
        percentage,
      };
    });

    // 3. Trend Series (Monthly Cash Flow comparison for Recharts Bar Chart)
    // If period === 'year', return 12 months of the selected year.
    // If period === 'month', return 6 months ending at the selected month.
    let monthlyTrend: Array<{
      month: string;
      income: number;
      expense: number;
      savings: number;
    }> = [];

    if (period === 'year') {
      monthlyTrend = await Promise.all(
        Array.from({ length: 12 }, async (_, i) => {
          const m = i + 1;
          const mStart = new Date(year, i, 1);
          const mEnd = new Date(year, m, 0, 23, 59, 59, 999);

          const [mInc, mExp] = await Promise.all([
            prisma.transaction.aggregate({
              _sum: { amount: true },
              where: {
                userId,
                type: 'INCOME',
                transactionDate: { gte: mStart, lte: mEnd },
              },
            }),
            prisma.transaction.aggregate({
              _sum: { amount: true },
              where: {
                userId,
                type: 'EXPENSE',
                transactionDate: { gte: mStart, lte: mEnd },
              },
            }),
          ]);

          const inc = mInc._sum.amount ? parseFloat(mInc._sum.amount.toString()) : 0;
          const exp = mExp._sum.amount ? parseFloat(mExp._sum.amount.toString()) : 0;

          return {
            month: MONTH_NAMES[i],
            income: Math.round(inc * 100) / 100,
            expense: Math.round(exp * 100) / 100,
            savings: Math.round((inc - exp) * 100) / 100,
          };
        })
      );
    } else {
      // 6-month trailing series ending at (year, month)
      const trailingMonths = [];
      for (let offset = 5; offset >= 0; offset--) {
        const d = new Date(year, month - 1 - offset, 1);
        trailingMonths.push({
          y: d.getFullYear(),
          m: d.getMonth() + 1,
          name: `${MONTH_NAMES[d.getMonth()]} '${d.getFullYear().toString().slice(-2)}`,
        });
      }

      monthlyTrend = await Promise.all(
        trailingMonths.map(async (tm) => {
          const mStart = new Date(tm.y, tm.m - 1, 1);
          const mEnd = new Date(tm.y, tm.m, 0, 23, 59, 59, 999);

          const [mInc, mExp] = await Promise.all([
            prisma.transaction.aggregate({
              _sum: { amount: true },
              where: {
                userId,
                type: 'INCOME',
                transactionDate: { gte: mStart, lte: mEnd },
              },
            }),
            prisma.transaction.aggregate({
              _sum: { amount: true },
              where: {
                userId,
                type: 'EXPENSE',
                transactionDate: { gte: mStart, lte: mEnd },
              },
            }),
          ]);

          const inc = mInc._sum.amount ? parseFloat(mInc._sum.amount.toString()) : 0;
          const exp = mExp._sum.amount ? parseFloat(mExp._sum.amount.toString()) : 0;

          return {
            month: tm.name,
            income: Math.round(inc * 100) / 100,
            expense: Math.round(exp * 100) / 100,
            savings: Math.round((inc - exp) * 100) / 100,
          };
        })
      );
    }

    return {
      period,
      month,
      year,
      summary: {
        totalIncome: totalIncome.toFixed(2),
        totalExpense: totalExpense.toFixed(2),
        netSavings: netSavings.toFixed(2),
        savingsRate,
      },
      categoryBreakdown,
      monthlyTrend,
    };
  }
}

export const analyticsService = new AnalyticsService();
