import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../app';
import { prisma } from '../prisma';

describe('Analytics & Reports API Endpoints', () => {
  let userAToken: string;
  let userBToken: string;
  let userAId: string;
  let userBId: string;
  let expenseCategoryId: string;
  let incomeCategoryId: string;

  beforeAll(async () => {
    // Create User A
    const resA = await request(app).post('/api/auth/register').send({
      email: `ana_user_a_${Date.now()}@example.com`,
      password: 'Password123!',
      firstName: 'Analytics',
      lastName: 'UserA',
    });
    userAToken = resA.body.data.token;
    userAId = resA.body.data.user.id;

    // Create User B
    const resB = await request(app).post('/api/auth/register').send({
      email: `ana_user_b_${Date.now()}@example.com`,
      password: 'Password123!',
      firstName: 'Analytics',
      lastName: 'UserB',
    });
    userBToken = resB.body.data.token;
    userBId = resB.body.data.user.id;

    // Fetch default categories
    const expenseCat = await prisma.category.findFirst({
      where: { type: 'EXPENSE', isDefault: true },
    });
    expenseCategoryId = expenseCat!.id;

    const incomeCat = await prisma.category.findFirst({
      where: { type: 'INCOME', isDefault: true },
    });
    incomeCategoryId = incomeCat!.id;

    // Add Income transaction for User A: 50,000 INR
    await request(app)
      .post('/api/transactions')
      .set('Authorization', `Bearer ${userAToken}`)
      .send({
        title: 'Monthly Consulting Retainer',
        amount: 50000,
        type: 'INCOME',
        categoryId: incomeCategoryId,
        transactionDate: new Date().toISOString(),
      });

    // Add Expense transaction for User A: 12,500 INR
    await request(app)
      .post('/api/transactions')
      .set('Authorization', `Bearer ${userAToken}`)
      .send({
        title: 'Office Rental',
        amount: 12500,
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

  it('GET /api/analytics/dashboard - should return income, expense, balance and recent transactions', async () => {
    const res = await request(app)
      .get('/api/analytics/dashboard')
      .set('Authorization', `Bearer ${userAToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const data = res.body.data;
    expect(data.currentMonth.income).toBe('50000.00');
    expect(data.currentMonth.expense).toBe('12500.00');
    expect(data.currentMonth.balance).toBe('37500.00');
    expect(data.recentTransactions.length).toBe(2);
    expect(data.topCategories.length).toBeGreaterThanOrEqual(1);
  });

  it('GET /api/analytics/reports - should return monthly report with category breakdown and trend', async () => {
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();

    const res = await request(app)
      .get(`/api/analytics/reports?period=month&month=${currentMonth}&year=${currentYear}`)
      .set('Authorization', `Bearer ${userAToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const data = res.body.data;
    expect(data.summary.totalIncome).toBe('50000.00');
    expect(data.summary.totalExpense).toBe('12500.00');
    expect(data.summary.netSavings).toBe('37500.00');
    expect(data.categoryBreakdown.length).toBeGreaterThanOrEqual(1);
    expect(data.monthlyTrend.length).toBe(6); // 6 trailing months
  });

  it('GET /api/analytics/reports - should return 12 months when period=year', async () => {
    const currentYear = new Date().getFullYear();

    const res = await request(app)
      .get(`/api/analytics/reports?period=year&year=${currentYear}`)
      .set('Authorization', `Bearer ${userAToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.monthlyTrend.length).toBe(12);
  });

  it('GET /api/analytics/dashboard - User B sees 0 amounts (Strict Data Isolation)', async () => {
    const res = await request(app)
      .get('/api/analytics/dashboard')
      .set('Authorization', `Bearer ${userBToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.currentMonth.income).toBe('0.00');
    expect(res.body.data.currentMonth.expense).toBe('0.00');
    expect(res.body.data.currentMonth.balance).toBe('0.00');
    expect(res.body.data.recentTransactions.length).toBe(0);
  });
});
