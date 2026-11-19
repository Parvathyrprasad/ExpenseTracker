import { Router } from 'express';
import { transactionController } from '../controllers/transaction.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validateRequest } from '../middlewares/validateRequest';
import {
  createTransactionSchema,
  updateTransactionSchema,
  transactionIdParamSchema,
  listTransactionsQuerySchema,
} from '../schemas/transaction.schema';

const router = Router();

// All transaction routes require authentication
router.use(authenticate);

router.get(
  '/',
  validateRequest(listTransactionsQuerySchema),
  transactionController.getTransactions
);

router.get(
  '/:id',
  validateRequest(transactionIdParamSchema),
  transactionController.getTransactionById
);

router.post(
  '/',
  validateRequest(createTransactionSchema),
  transactionController.createTransaction
);

router.put(
  '/:id',
  validateRequest(updateTransactionSchema),
  transactionController.updateTransaction
);

router.delete(
  '/:id',
  validateRequest(transactionIdParamSchema),
  transactionController.deleteTransaction
);

export default router;
