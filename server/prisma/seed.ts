import { PrismaClient, CategoryType } from '@prisma/client';

const prisma = new PrismaClient();

const DEFAULT_CATEGORIES = [
  // Expense Categories
  { name: 'Food & Dining', type: CategoryType.EXPENSE, icon: 'Utensils', color: '#EF4444', isDefault: true },
  { name: 'Groceries', type: CategoryType.EXPENSE, icon: 'ShoppingCart', color: '#F97316', isDefault: true },
  { name: 'Housing & Rent', type: CategoryType.EXPENSE, icon: 'Home', color: '#8B5CF6', isDefault: true },
  { name: 'Transportation', type: CategoryType.EXPENSE, icon: 'Car', color: '#3B82F6', isDefault: true },
  { name: 'Utilities & Bills', type: CategoryType.EXPENSE, icon: 'Zap', color: '#EAB308', isDefault: true },
  { name: 'Healthcare & Medical', type: CategoryType.EXPENSE, icon: 'HeartPulse', color: '#EC4899', isDefault: true },
  { name: 'Entertainment', type: CategoryType.EXPENSE, icon: 'Film', color: '#14B8A6', isDefault: true },
  { name: 'Shopping', type: CategoryType.EXPENSE, icon: 'ShoppingBag', color: '#06B6D4', isDefault: true },
  { name: 'Education', type: CategoryType.EXPENSE, icon: 'GraduationCap', color: '#6366F1', isDefault: true },
  { name: 'Investments & Savings', type: CategoryType.EXPENSE, icon: 'TrendingUp', color: '#10B981', isDefault: true },
  { name: 'Miscellaneous', type: CategoryType.EXPENSE, icon: 'MoreHorizontal', color: '#6B7280', isDefault: true },

  // Income Categories
  { name: 'Salary', type: CategoryType.INCOME, icon: 'Briefcase', color: '#10B981', isDefault: true },
  { name: 'Freelance & Consulting', type: CategoryType.INCOME, icon: 'Laptop', color: '#059669', isDefault: true },
  { name: 'Investments & Dividends', type: CategoryType.INCOME, icon: 'LineChart', color: '#34D399', isDefault: true },
  { name: 'Business Income', type: CategoryType.INCOME, icon: 'Building2', color: '#14B8A6', isDefault: true },
  { name: 'Rental Income', type: CategoryType.INCOME, icon: 'Key', color: '#0D9488', isDefault: true },
  { name: 'Gifts & Awards', type: CategoryType.INCOME, icon: 'Gift', color: '#6EE7B7', isDefault: true },
  { name: 'Other Income', type: CategoryType.INCOME, icon: 'Wallet', color: '#047857', isDefault: true },
];

async function main() {
  console.log('Seeding default categories...');

  for (const cat of DEFAULT_CATEGORIES) {
    const existing = await prisma.category.findFirst({
      where: {
        name: cat.name,
        type: cat.type,
        isDefault: true,
        userId: null,
      },
    });

    if (!existing) {
      await prisma.category.create({
        data: {
          ...cat,
          userId: null,
        },
      });
      console.log(`Created category: [${cat.type}] ${cat.name}`);
    } else {
      console.log(`Skipped existing: [${cat.type}] ${cat.name}`);
    }
  }

  console.log('Default categories seeded successfully.');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
