import { Request, Response, NextFunction } from 'express';
import { transactionService } from '../services/transaction.service';

export class TransactionController {
  async getTransactions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await transactionService.getTransactions(
        req.user!.id,
        req.query as any
      );
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getTransactionById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const transactionId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const transaction = await transactionService.getTransactionById(
        req.user!.id,
        transactionId
      );
      res.status(200).json({
        success: true,
        data: { transaction },
      });
    } catch (error) {
      next(error);
    }
  }

  async createTransaction(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const transaction = await transactionService.createTransaction(
        req.user!.id,
        req.body
      );
      res.status(201).json({
        success: true,
        message: 'Transaction created successfully',
        data: { transaction },
      });
    } catch (error) {
      next(error);
    }
  }

  async updateTransaction(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const transactionId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const transaction = await transactionService.updateTransaction(
        req.user!.id,
        transactionId,
        req.body
      );
      res.status(200).json({
        success: true,
        message: 'Transaction updated successfully',
        data: { transaction },
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteTransaction(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const transactionId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const result = await transactionService.deleteTransaction(
        req.user!.id,
        transactionId
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
}

export const transactionController = new TransactionController();
