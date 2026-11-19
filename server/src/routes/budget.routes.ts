import { Router } from 'express';
import { budgetController } from '../controllers/budget.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validateRequest } from '../middlewares/validateRequest';
import {
  createBudgetSchema,
  updateBudgetSchema,
  budgetIdParamSchema,
  listBudgetsQuerySchema,
} from '../schemas/budget.schema';

const router = Router();

// All budget routes require authentication
router.use(authenticate);

router.get('/', validateRequest(listBudgetsQuerySchema), budgetController.getBudgets);
router.post('/', validateRequest(createBudgetSchema), budgetController.createBudget);
router.put('/:id', validateRequest(updateBudgetSchema), budgetController.updateBudget);
router.delete('/:id', validateRequest(budgetIdParamSchema), budgetController.deleteBudget);

export default router;
