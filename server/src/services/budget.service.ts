import { Prisma } from '@prisma/client';
import { prisma } from '../prisma';
import { AppError } from '../middlewares/errorHandler';
import {
  CreateBudgetInput,
  UpdateBudgetInput,
  ListBudgetsQuery,
} from '../schemas/budget.schema';

export class BudgetService {
  /**
   * List budgets for a specific month and year, computing actual spending,
   * remaining amounts, percentage used, and threshold warnings.
   */
  async getBudgets(userId: string, query: ListBudgetsQuery) {
    const now = new Date();
    const month = parseInt(query.month?.toString() || (now.getMonth() + 1).toString(), 10);
    const year = parseInt(query.year?.toString() || now.getFullYear().toString(), 10);

    const budgets = await prisma.budget.findMany({
      where: {
        userId,
        month,
        year,
      },
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
      orderBy: { amount: 'desc' },
    });

    // Date range for the requested month
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    // Compute actual spending per category for this month
    const enrichedBudgets = await Promise.all(
      budgets.map(async (budget) => {
        const expenseSum = await prisma.transaction.aggregate({
          _sum: { amount: true },
          where: {
            userId,
            categoryId: budget.categoryId,
            type: 'EXPENSE',
            transactionDate: {
              gte: startDate,
              lte: endDate,
            },
          },
        });

        const budgetLimit = parseFloat(budget.amount.toString());
        const spent = expenseSum._sum.amount
          ? parseFloat(expenseSum._sum.amount.toString())
          : 0;
        const remaining = Math.round((budgetLimit - spent) * 100) / 100;
        const percentageUsed = budgetLimit > 0
          ? Math.min(Math.round((spent / budgetLimit) * 100), 999)
          : 0;

        let status: 'NORMAL' | 'WARNING' | 'EXCEEDED' = 'NORMAL';
        if (spent >= budgetLimit) {
          status = 'EXCEEDED';
        } else if (spent >= budgetLimit * budget.alertThreshold) {
          status = 'WARNING';
        }

        return {
          id: budget.id,
          userId: budget.userId,
          categoryId: budget.categoryId,
          category: budget.category,
          month: budget.month,
          year: budget.year,
          amount: budget.amount.toFixed(2),
          alertThreshold: budget.alertThreshold,
          spent: spent.toFixed(2),
          remaining: remaining.toFixed(2),
          percentageUsed,
          status,
          createdAt: budget.createdAt,
          updatedAt: budget.updatedAt,
        };
      })
    );

    // Overall month budget aggregates
    const totalBudgeted = enrichedBudgets.reduce(
      (sum, b) => sum + parseFloat(b.amount),
      0
    );
    const totalSpent = enrichedBudgets.reduce(
      (sum, b) => sum + parseFloat(b.spent),
      0
    );
    const totalRemaining = totalBudgeted - totalSpent;
    const warningCount = enrichedBudgets.filter((b) => b.status === 'WARNING').length;
    const exceededCount = enrichedBudgets.filter((b) => b.status === 'EXCEEDED').length;

    return {
      month,
      year,
      budgets: enrichedBudgets,
      summary: {
        totalBudgeted: totalBudgeted.toFixed(2),
        totalSpent: totalSpent.toFixed(2),
        totalRemaining: totalRemaining.toFixed(2),
        warningCount,
        exceededCount,
      },
    };
  }

  /**
   * Create a monthly budget for an expense category
   */
  async createBudget(userId: string, input: CreateBudgetInput) {
    // Verify category exists and is an EXPENSE category
    const category = await prisma.category.findFirst({
      where: {
        id: input.categoryId,
        OR: [{ isDefault: true }, { userId }],
      },
    });

    if (!category) {
      throw new AppError('Category not found or access denied', 400);
    }

    if (category.type !== 'EXPENSE') {
      throw new AppError('Budgets can only be created for EXPENSE categories', 400);
    }

    // Check for existing budget for the same category, month, and year
    const existing = await prisma.budget.findUnique({
      where: {
        userId_categoryId_month_year: {
          userId,
          categoryId: input.categoryId,
          month: input.month,
          year: input.year,
        },
      },
    });

    if (existing) {
      throw new AppError(
        `A budget for "${category.name}" already exists for ${input.month}/${input.year}`,
        409
      );
    }

    const budget = await prisma.budget.create({
      data: {
        userId,
        categoryId: input.categoryId,
        month: input.month,
        year: input.year,
        amount: new Prisma.Decimal(input.amount),
        alertThreshold: input.alertThreshold,
      },
      include: {
        category: true,
      },
    });

    return {
      ...budget,
      amount: budget.amount.toFixed(2),
    };
  }

  /**
   * Update budget amount or alert threshold
   */
  async updateBudget(userId: string, budgetId: string, input: UpdateBudgetInput) {
    const existing = await prisma.budget.findFirst({
      where: { id: budgetId, userId },
    });

    if (!existing) {
      throw new AppError('Budget not found or access denied', 404);
    }

    const data: Prisma.BudgetUpdateInput = {
      ...(input.amount && { amount: new Prisma.Decimal(input.amount) }),
      ...(input.alertThreshold !== undefined && { alertThreshold: input.alertThreshold }),
    };

    const updated = await prisma.budget.update({
      where: { id: budgetId },
      data,
      include: {
        category: true,
      },
    });

    return {
      ...updated,
      amount: updated.amount.toFixed(2),
    };
  }

  /**
   * Delete budget
   */
  async deleteBudget(userId: string, budgetId: string) {
    const existing = await prisma.budget.findFirst({
      where: { id: budgetId, userId },
    });

    if (!existing) {
      throw new AppError('Budget not found or access denied', 404);
    }

    await prisma.budget.delete({
      where: { id: budgetId },
    });

    return { success: true, message: 'Budget deleted successfully' };
  }
}

export const budgetService = new BudgetService();
