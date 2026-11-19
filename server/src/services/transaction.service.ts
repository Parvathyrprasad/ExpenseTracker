import { Prisma } from '@prisma/client';
import { prisma } from '../prisma';
import { AppError } from '../middlewares/errorHandler';
import {
  CreateTransactionInput,
  UpdateTransactionInput,
  ListTransactionsQuery,
} from '../schemas/transaction.schema';

export class TransactionService {
  /**
   * List transactions for the authenticated user with filtering and search
   */
  async getTransactions(userId: string, query: ListTransactionsQuery) {
    const where: Prisma.TransactionWhereInput = {
      userId,
    };

    if (query.type) {
      where.type = query.type;
    }

    if (query.categoryId) {
      where.categoryId = query.categoryId;
    }

    if (query.startDate || query.endDate) {
      where.transactionDate = {};
      if (query.startDate) {
        where.transactionDate.gte = new Date(query.startDate);
      }
      if (query.endDate) {
        // End of the selected day
        const end = new Date(query.endDate);
        end.setHours(23, 59, 59, 999);
        where.transactionDate.lte = end;
      }
    }

    if (query.search && query.search.trim()) {
      const search = query.search.trim();
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { note: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        include: {
          category: {
            select: {
              id: true,
              name: true,
              type: true,
              icon: true,
              color: true,
              isDefault: true,
            },
          },
        },
        orderBy: [{ transactionDate: 'desc' }, { createdAt: 'desc' }],
        take: query.limit,
        skip: query.offset,
      }),
      prisma.transaction.count({ where }),
    ]);

    return {
      transactions: transactions.map((t) => ({
        ...t,
        amount: t.amount.toFixed(2), // Format Decimal to string for JSON output
      })),
      total,
      limit: query.limit,
      offset: query.offset,
    };
  }

  /**
   * Get single transaction by ID scoped to authenticated user
   */
  async getTransactionById(userId: string, transactionId: string) {
    const transaction = await prisma.transaction.findFirst({
      where: {
        id: transactionId,
        userId,
      },
      include: {
        category: true,
      },
    });

    if (!transaction) {
      throw new AppError('Transaction not found', 404);
    }

    return {
      ...transaction,
      amount: transaction.amount.toFixed(2),
    };
  }

  /**
   * Create a new transaction with Decimal precision
   */
  async createTransaction(userId: string, input: CreateTransactionInput) {
    // Verify category exists and belongs to system or user
    const category = await prisma.category.findFirst({
      where: {
        id: input.categoryId,
        OR: [{ isDefault: true }, { userId }],
      },
    });

    if (!category) {
      throw new AppError('Category not found or access denied', 400);
    }

    if (category.type !== input.type) {
      throw new AppError(
        `Category "${category.name}" is of type ${category.type}, but transaction was specified as ${input.type}`,
        400
      );
    }

    const decimalAmount = new Prisma.Decimal(input.amount);

    const transaction = await prisma.transaction.create({
      data: {
        userId,
        categoryId: input.categoryId,
        title: input.title,
        amount: decimalAmount,
        type: input.type,
        transactionDate: input.transactionDate,
        note: input.note || null,
        paymentMethod: input.paymentMethod,
      },
      include: {
        category: true,
      },
    });

    return {
      ...transaction,
      amount: transaction.amount.toFixed(2),
    };
  }

  /**
   * Update transaction
   */
  async updateTransaction(
    userId: string,
    transactionId: string,
    input: UpdateTransactionInput
  ) {
    const existing = await prisma.transaction.findFirst({
      where: { id: transactionId, userId },
    });

    if (!existing) {
      throw new AppError('Transaction not found or access denied', 404);
    }

    const targetType = input.type || existing.type;
    const targetCategoryId = input.categoryId || existing.categoryId;

    if (input.categoryId || input.type) {
      const category = await prisma.category.findFirst({
        where: {
          id: targetCategoryId,
          OR: [{ isDefault: true }, { userId }],
        },
      });

      if (!category) {
        throw new AppError('Category not found or access denied', 400);
      }

      if (category.type !== targetType) {
        throw new AppError(
          `Category "${category.name}" is of type ${category.type}, but transaction is ${targetType}`,
          400
        );
      }
    }

    const data: Prisma.TransactionUpdateInput = {
      ...(input.title && { title: input.title }),
      ...(input.amount && { amount: new Prisma.Decimal(input.amount) }),
      ...(input.type && { type: input.type }),
      ...(input.categoryId && {
        category: { connect: { id: input.categoryId } },
      }),
      ...(input.transactionDate && { transactionDate: input.transactionDate }),
      ...(input.note !== undefined && { note: input.note }),
      ...(input.paymentMethod && { paymentMethod: input.paymentMethod }),
    };

    const updated = await prisma.transaction.update({
      where: { id: transactionId },
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
   * Delete transaction
   */
  async deleteTransaction(userId: string, transactionId: string) {
    const existing = await prisma.transaction.findFirst({
      where: { id: transactionId, userId },
    });

    if (!existing) {
      throw new AppError('Transaction not found or access denied', 404);
    }

    await prisma.transaction.delete({
      where: { id: transactionId },
    });

    return { success: true, message: 'Transaction deleted successfully' };
  }
}

export const transactionService = new TransactionService();
