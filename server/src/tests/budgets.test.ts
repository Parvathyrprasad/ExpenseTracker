import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../app';
import { prisma } from '../prisma';

describe('Budgets API Endpoints', () => {
  let userAToken: string;
  let userBToken: string;
  let userAId: string;
  let userBId: string;
  let expenseCategoryId: string;
  let incomeCategoryId: string;
  let budgetId: string;

  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  beforeAll(async () => {
    // Create User A
    const resA = await request(app).post('/api/auth/register').send({
      email: `bgt_user_a_${Date.now()}@example.com`,
      password: 'Password123!',
      firstName: 'Budget',
      lastName: 'UserA',
    });
    userAToken = resA.body.data.token;
    userAId = resA.body.data.user.id;

    // Create User B
    const resB = await request(app).post('/api/auth/register').send({
      email: `bgt_user_b_${Date.now()}@example.com`,
      password: 'Password123!',
      firstName: 'Budget',
      lastName: 'UserB',
    });
    userBToken = resB.body.data.token;
    userBId = resB.body.data.user.id;

    // Fetch expense and income categories
    const expenseCat = await prisma.category.findFirst({
      where: { type: 'EXPENSE', isDefault: true },
    });
    expenseCategoryId = expenseCat!.id;

    const incomeCat = await prisma.category.findFirst({
      where: { type: 'INCOME', isDefault: true },
    });
    incomeCategoryId = incomeCat!.id;

    // Create an expense transaction for User A to test budget calculations
    await request(app)
      .post('/api/transactions')
      .set('Authorization', `Bearer ${userAToken}`)
      .send({
        title: 'Budget Test Expense',
        amount: 850,
        type: 'EXPENSE',
        categoryId: expenseCategoryId,
        transactionDate: new Date().toISOString(),
      });
  });

  afterAll(async () => {
    await prisma.user.deleteMany({
      where: { id: { in: [userAId, userBId] } },
    });
    await prisma.$disconnect();
  });

  it('POST /api/budgets - should create a budget for an expense category', async () => {
    const res = await request(app)
      .post('/api/budgets')
      .set('Authorization', `Bearer ${userAToken}`)
      .send({
        categoryId: expenseCategoryId,
        month: currentMonth,
        year: currentYear,
        amount: 1000,
        alertThreshold: 0.8,
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.budget.amount).toBe('1000.00');
    expect(res.body.data.budget.month).toBe(currentMonth);
    expect(res.body.data.budget.year).toBe(currentYear);

    budgetId = res.body.data.budget.id;
  });

  it('POST /api/budgets - should reject budget for income category', async () => {
    const res = await request(app)
      .post('/api/budgets')
      .set('Authorization', `Bearer ${userAToken}`)
      .send({
        categoryId: incomeCategoryId, // Income category
        month: currentMonth,
        year: currentYear,
        amount: 5000,
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/EXPENSE/i);
  });

  it('POST /api/budgets - should reject duplicate budget for same category/month/year', async () => {
    const res = await request(app)
      .post('/api/budgets')
      .set('Authorization', `Bearer ${userAToken}`)
      .send({
        categoryId: expenseCategoryId,
        month: currentMonth,
        year: currentYear,
        amount: 2000,
      });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
  });

  it('GET /api/budgets - should compute spent, remaining, percentageUsed and status', async () => {
    const res = await request(app)
      .get(`/api/budgets?month=${currentMonth}&year=${currentYear}`)
      .set('Authorization', `Bearer ${userAToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.budgets.length).toBe(1);

    const b = res.body.data.budgets[0];
    expect(b.amount).toBe('1000.00');
    expect(b.spent).toBe('850.00'); // From earlier 850 transaction
    expect(b.remaining).toBe('150.00');
    expect(b.percentageUsed).toBe(85);
    expect(b.status).toBe('WARNING'); // Since 85% >= 80% threshold
  });

  it('PUT /api/budgets/:id - should update budget amount and threshold', async () => {
    const res = await request(app)
      .put(`/api/budgets/${budgetId}`)
      .set('Authorization', `Bearer ${userAToken}`)
      .send({
        amount: 2000,
        alertThreshold: 0.9,
      });

    expect(res.status).toBe(200);
    expect(res.body.data.budget.amount).toBe('2000.00');
    expect(res.body.data.budget.alertThreshold).toBe(0.9);
  });

  it('GET /api/budgets - User B should see 0 budgets (Strict Isolation)', async () => {
    const res = await request(app)
      .get(`/api/budgets?month=${currentMonth}&year=${currentYear}`)
      .set('Authorization', `Bearer ${userBToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.budgets.length).toBe(0);
  });

  it('PUT /api/budgets/:id - User B cannot modify User A budget', async () => {
    const res = await request(app)
      .put(`/api/budgets/${budgetId}`)
      .set('Authorization', `Bearer ${userBToken}`)
      .send({
        amount: 9999,
      });

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it('DELETE /api/budgets/:id - User A can delete budget', async () => {
    const res = await request(app)
      .delete(`/api/budgets/${budgetId}`)
      .set('Authorization', `Bearer ${userAToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
