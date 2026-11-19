import { z } from 'zod';

export const createBudgetSchema = z.object({
  body: z.object({
    categoryId: z.string({ required_error: 'Category is required' }).uuid('Invalid category ID'),
    month: z.coerce
      .number({ required_error: 'Month is required' })
      .min(1, 'Month must be between 1 and 12')
      .max(12, 'Month must be between 1 and 12'),
    year: z.coerce
      .number({ required_error: 'Year is required' })
      .min(2000, 'Year must be 2000 or later')
      .max(2100, 'Year is too far in future'),
    amount: z
      .union([z.number(), z.string()])
      .refine(
        (val) => {
          const num = typeof val === 'string' ? parseFloat(val) : val;
          return !isNaN(num) && num > 0;
        },
        { message: 'Budget amount must be a positive number' }
      )
      .transform((val) => {
        const num = typeof val === 'string' ? parseFloat(val) : val;
        return (Math.round(num * 100) / 100).toFixed(2);
      }),
    alertThreshold: z.coerce
      .number()
      .min(0.1, 'Alert threshold must be at least 0.1 (10%)')
      .max(1.0, 'Alert threshold cannot exceed 1.0 (100%)')
      .optional()
      .default(0.8),
  }),
});

export const updateBudgetSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid budget ID format'),
  }),
  body: z.object({
    amount: z
      .union([z.number(), z.string()])
      .refine(
        (val) => {
          const num = typeof val === 'string' ? parseFloat(val) : val;
          return !isNaN(num) && num > 0;
        },
        { message: 'Budget amount must be a positive number' }
      )
      .transform((val) => {
        const num = typeof val === 'string' ? parseFloat(val) : val;
        return (Math.round(num * 100) / 100).toFixed(2);
      })
      .optional(),
    alertThreshold: z.coerce
      .number()
      .min(0.1)
      .max(1.0)
      .optional(),
  }),
});

export const budgetIdParamSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid budget ID format'),
  }),
});

export const listBudgetsQuerySchema = z.object({
  query: z.object({
    month: z.coerce.number().min(1).max(12).optional(),
    year: z.coerce.number().min(2000).max(2100).optional(),
  }),
});

export type CreateBudgetInput = z.infer<typeof createBudgetSchema>['body'];
export type UpdateBudgetInput = z.infer<typeof updateBudgetSchema>['body'];
export type ListBudgetsQuery = z.infer<typeof listBudgetsQuerySchema>['query'];
