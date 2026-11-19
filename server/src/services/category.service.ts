import { prisma } from '../prisma';
import { AppError } from '../middlewares/errorHandler';
import { CreateCategoryInput, UpdateCategoryInput } from '../schemas/category.schema';

export class CategoryService {
  /**
   * Get all system default categories + user's custom categories
   */
  async getCategories(userId: string) {
    return prisma.category.findMany({
      where: {
        OR: [{ isDefault: true }, { userId }],
      },
      orderBy: [
        { isDefault: 'desc' },
        { type: 'asc' },
        { name: 'asc' },
      ],
    });
  }

  /**
   * Create a custom category for the authenticated user
   */
  async createCategory(userId: string, input: CreateCategoryInput) {
    // Check if category with exact name & type already exists for this user or as default
    const existing = await prisma.category.findFirst({
      where: {
        name: { equals: input.name, mode: 'insensitive' },
        type: input.type,
        OR: [{ isDefault: true }, { userId }],
      },
    });

    if (existing) {
      throw new AppError(
        `A category named "${input.name}" already exists for ${input.type.toLowerCase()}`,
        409
      );
    }

    return prisma.category.create({
      data: {
        name: input.name,
        type: input.type,
        icon: input.icon || 'Tag',
        color: input.color || '#6B7280',
        isDefault: false,
        userId,
      },
    });
  }

  /**
   * Update user's custom category (prevents editing system default categories)
   */
  async updateCategory(userId: string, categoryId: string, input: UpdateCategoryInput) {
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      throw new AppError('Category not found', 404);
    }

    if (category.isDefault) {
      throw new AppError('Default system categories cannot be modified', 403);
    }

    if (category.userId !== userId) {
      throw new AppError('Access denied. You cannot modify another user\'s category.', 403);
    }

    return prisma.category.update({
      where: { id: categoryId },
      data: {
        ...(input.name && { name: input.name }),
        ...(input.type && { type: input.type }),
        ...(input.icon && { icon: input.icon }),
        ...(input.color && { color: input.color }),
      },
    });
  }

  /**
   * Delete user's custom category (prevents deleting defaults or categories with transactions)
   */
  async deleteCategory(userId: string, categoryId: string) {
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      throw new AppError('Category not found', 404);
    }

    if (category.isDefault) {
      throw new AppError('Default system categories cannot be deleted', 403);
    }

    if (category.userId !== userId) {
      throw new AppError('Access denied. You cannot delete another user\'s category.', 403);
    }

    // Check if category is used in any transactions
    const transactionCount = await prisma.transaction.count({
      where: { categoryId },
    });

    if (transactionCount > 0) {
      throw new AppError(
        `Cannot delete category. It is referenced by ${transactionCount} transaction(s). Reassign them first.`,
        400
      );
    }

    await prisma.category.delete({
      where: { id: categoryId },
    });

    return { success: true, message: 'Category deleted successfully' };
  }
}

export const categoryService = new CategoryService();
