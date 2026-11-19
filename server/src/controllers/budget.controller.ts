import { Request, Response, NextFunction } from 'express';
import { budgetService } from '../services/budget.service';

export class BudgetController {
  async getBudgets(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await budgetService.getBudgets(req.user!.id, req.query as any);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async createBudget(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const budget = await budgetService.createBudget(req.user!.id, req.body);
      res.status(201).json({
        success: true,
        message: 'Budget created successfully',
        data: { budget },
      });
    } catch (error) {
      next(error);
    }
  }

  async updateBudget(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const budgetId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const budget = await budgetService.updateBudget(req.user!.id, budgetId, req.body);
      res.status(200).json({
        success: true,
        message: 'Budget updated successfully',
        data: { budget },
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteBudget(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const budgetId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const result = await budgetService.deleteBudget(req.user!.id, budgetId);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
}

export const budgetController = new BudgetController();
