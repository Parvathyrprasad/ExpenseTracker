import { z } from 'zod';
import { TransactionType, PaymentMethod } from '@prisma/client';

export const createTransactionSchema = z.object({
  body: z.object({
    title: z
      .string({ required_error: 'Transaction title is required' })
      .min(1, 'Title cannot be empty')
      .max(100, 'Title cannot exceed 100 characters')
      .trim(),
    amount: z
      .union([z.number(), z.string()])
      .refine(
        (val) => {
          const num = typeof val === 'string' ? parseFloat(val) : val;
          return !isNaN(num) && num > 0;
        },
        { message: 'Amount must be a positive number' }
      )
      .transform((val) => {
        const num = typeof val === 'string' ? parseFloat(val) : val;
        return (Math.round(num * 100) / 100).toFixed(2);
      }),
    type: z.nativeEnum(TransactionType, {
      required_error: 'Type must be INCOME or EXPENSE',
    }),
    categoryId: z.string().uuid('Invalid category ID'),
    transactionDate: z
      .string({ required_error: 'Date is required' })
      .refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid date format' })
      .transform((val) => new Date(val)),
    note: z.string().max(500, 'Note cannot exceed 500 characters').optional().nullable(),
    paymentMethod: z.nativeEnum(PaymentMethod).optional().default(PaymentMethod.UPI),
  }),
});

export const updateTransactionSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid transaction ID'),
  }),
  body: z.object({
    title: z.string().min(1).max(100).trim().optional(),
    amount: z
      .union([z.number(), z.string()])
      .refine(
        (val) => {
          const num = typeof val === 'string' ? parseFloat(val) : val;
          return !isNaN(num) && num > 0;
        },
        { message: 'Amount must be a positive number' }
      )
      .transform((val) => {
        const num = typeof val === 'string' ? parseFloat(val) : val;
        return (Math.round(num * 100) / 100).toFixed(2);
      })
      .optional(),
    type: z.nativeEnum(TransactionType).optional(),
    categoryId: z.string().uuid('Invalid category ID').optional(),
    transactionDate: z
      .string()
      .refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid date format' })
      .transform((val) => new Date(val))
      .optional(),
    note: z.string().max(500).optional().nullable(),
    paymentMethod: z.nativeEnum(PaymentMethod).optional(),
  }),
});

export const transactionIdParamSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid transaction ID'),
  }),
});

export const listTransactionsQuerySchema = z.object({
  query: z.object({
    type: z.nativeEnum(TransactionType).optional(),
    categoryId: z.string().uuid().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    search: z.string().optional(),
    limit: z.coerce.number().min(1).max(200).optional().default(100),
    offset: z.coerce.number().min(0).optional().default(0),
  }),
});

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>['body'];
export type UpdateTransactionInput = z.infer<typeof updateTransactionSchema>['body'];
export type ListTransactionsQuery = z.infer<typeof listTransactionsQuerySchema>['query'];
