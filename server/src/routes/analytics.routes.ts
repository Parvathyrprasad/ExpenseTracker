import { Router } from 'express';
import { analyticsController } from '../controllers/analytics.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validateRequest } from '../middlewares/validateRequest';
import { reportsQuerySchema } from '../schemas/analytics.schema';

const router = Router();

// Protected analytics routes
router.use(authenticate);

router.get('/dashboard', analyticsController.getDashboardSummary);
router.get('/reports', validateRequest(reportsQuerySchema), analyticsController.getReports);

export default router;
