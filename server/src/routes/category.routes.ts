import { Router } from 'express';
import { categoryController } from '../controllers/category.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validateRequest } from '../middlewares/validateRequest';
import {
  createCategorySchema,
  updateCategorySchema,
  categoryIdParamSchema,
} from '../schemas/category.schema';

const router = Router();

// All category routes require authentication
router.use(authenticate);

router.get('/', categoryController.getCategories);
router.post('/', validateRequest(createCategorySchema), categoryController.createCategory);
router.put('/:id', validateRequest(updateCategorySchema), categoryController.updateCategory);
router.delete('/:id', validateRequest(categoryIdParamSchema), categoryController.deleteCategory);

export default router;
