import { Request, Response, NextFunction } from 'express';
import { categoryService } from '../services/category.service';

export class CategoryController {
  async getCategories(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const categories = await categoryService.getCategories(req.user!.id);
      res.status(200).json({
        success: true,
        data: { categories },
      });
    } catch (error) {
      next(error);
    }
  }

  async createCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const category = await categoryService.createCategory(req.user!.id, req.body);
      res.status(201).json({
        success: true,
        message: 'Category created successfully',
        data: { category },
      });
    } catch (error) {
      next(error);
    }
  }

  async updateCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const categoryId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const category = await categoryService.updateCategory(
        req.user!.id,
        categoryId,
        req.body
      );
      res.status(200).json({
        success: true,
        message: 'Category updated successfully',
        data: { category },
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const categoryId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const result = await categoryService.deleteCategory(req.user!.id, categoryId);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
}

export const categoryController = new CategoryController();
