import { z } from 'zod';

export const reportsQuerySchema = z.object({
  query: z.object({
    period: z.enum(['month', 'year']).optional().default('month'),
    month: z.coerce.number().min(1).max(12).optional(),
    year: z.coerce.number().min(2000).max(2100).optional(),
  }),
});

export type ReportsQuery = z.infer<typeof reportsQuerySchema>['query'];
