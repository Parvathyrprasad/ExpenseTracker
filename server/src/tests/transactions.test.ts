import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../app';
import { prisma } from '../prisma';

describe('Transactions API Endpoints', () => {
  let userAToken: string;
  let userBToken: string;
  let userAId: string;
  let userBId: string;
  let expenseCategoryId: string;
  let incomeCategoryId: string;
  let transactionId: string;

  beforeAll(async () => {
    // Create User A
    const resA = await request(app).post('/api/auth/register').send({
      email: `txn_user_a_${Date.now()}@example.com`,
      password: 'Password123!',
      firstName: 'Transaction',
      lastName: 'UserA',
    });
    userAToken = resA.body.data.token;
    userAId = resA.body.data.user.id;

    // Create User B
    const resB = await request(app).post('/api/auth/register').send({
      email: `txn_user_b_${Date.now()}@example.com`,
      password: 'Password123!',
      firstName: 'Transaction',
      lastName: 'UserB',
    });
    userBToken = resB.body.data.token;
    userBId = resB.body.data.user.id;

    // Fetch default categories for testing
    const expenseCat = await prisma.category.findFirst({
      where: { type: 'EXPENSE', isDefault: true },
    });
    expenseCategoryId = expenseCat!.id;

    const incomeCat = await prisma.category.findFirst({
      where: { type: 'INCOME', isDefault: true },
    });
    incomeCategoryId = incomeCat!.id;
  });

  afterAll(async () => {
    await prisma.user.deleteMany({
      where: { id: { in: [userAId, userBId] } },
    });
    await prisma.$disconnect();
  });

  it('POST /api/transactions - should create transaction with Decimal precision and title', async () => {
    const res = await request(app)
      .post('/api/transactions')
      .set('Authorization', `Bearer ${userAToken}`)
      .send({
        title: 'Weekly Supermarket Grocery',
        amount: 2450.75, // Decimal precision
        type: 'EXPENSE',
        categoryId: expenseCategoryId,
        transactionDate: '2026-11-19T10:00:00.000Z',
        note: 'Vegetables and dairy items',
        paymentMethod: 'UPI',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.transaction.title).toBe('Weekly Supermarket Grocery');
    expect(res.body.data.transaction.amount).toBe('2450.75');
    expect(res.body.data.transaction.type).toBe('EXPENSE');
    expect(res.body.data.transaction.paymentMethod).toBe('UPI');
    expect(res.body.data.transaction.category.id).toBe(expenseCategoryId);
    expect(res.body.data.transaction.userId).toBe(userAId);

    transactionId = res.body.data.transaction.id;
  });

  it('POST /api/transactions - should reject category type mismatch', async () => {
    // Attempting to assign an EXPENSE transaction to an INCOME category
    const res = await request(app)
      .post('/api/transactions')
      .set('Authorization', `Bearer ${userAToken}`)
      .send({
        title: 'Invalid Categorization',
        amount: 1500,
        type: 'EXPENSE',
        categoryId: incomeCategoryId, // INCOME category
        transactionDate: '2026-11-19T10:00:00.000Z',
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/type/i);
  });

  it('GET /api/transactions - should list transactions for authenticated user', async () => {
    const res = await request(app)
      .get('/api/transactions')
      .set('Authorization', `Bearer ${userAToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.transactions.length).toBe(1);
    expect(res.body.data.transactions[0].title).toBe('Weekly Supermarket Grocery');
    expect(res.body.data.transactions[0].amount).toBe('2450.75');
  });

  it('GET /api/transactions - should support search by title keyword', async () => {
    const res = await request(app)
      .get('/api/transactions?search=Supermarket')
      .set('Authorization', `Bearer ${userAToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.transactions.length).toBe(1);

    const emptyRes = await request(app)
      .get('/api/transactions?search=NonExistentKeyword')
      .set('Authorization', `Bearer ${userAToken}`);

    expect(emptyRes.body.data.transactions.length).toBe(0);
  });

  it('GET /api/transactions/:id - should get transaction by ID', async () => {
    const res = await request(app)
      .get(`/api/transactions/${transactionId}`)
      .set('Authorization', `Bearer ${userAToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.transaction.id).toBe(transactionId);
    expect(res.body.data.transaction.title).toBe('Weekly Supermarket Grocery');
  });

  it('PUT /api/transactions/:id - should update transaction details', async () => {
    const res = await request(app)
      .put(`/api/transactions/${transactionId}`)
      .set('Authorization', `Bearer ${userAToken}`)
      .send({
        title: 'Weekly Grocery with Organic Produce',
        amount: 2750.50,
      });

    expect(res.status).toBe(200);
    expect(res.body.data.transaction.title).toBe('Weekly Grocery with Organic Produce');
    expect(res.body.data.transaction.amount).toBe('2750.50');
  });

  it('GET /api/transactions - User B should see 0 transactions (Strict Isolation)', async () => {
    const res = await request(app)
      .get('/api/transactions')
      .set('Authorization', `Bearer ${userBToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.transactions.length).toBe(0);
  });

  it('PUT /api/transactions/:id - User B cannot modify User A transaction', async () => {
    const res = await request(app)
      .put(`/api/transactions/${transactionId}`)
      .set('Authorization', `Bearer ${userBToken}`)
      .send({
        title: 'Unauthorized Modification',
      });

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it('DELETE /api/transactions/:id - User B cannot delete User A transaction', async () => {
    const res = await request(app)
      .delete(`/api/transactions/${transactionId}`)
      .set('Authorization', `Bearer ${userBToken}`);

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it('DELETE /api/transactions/:id - User A can delete own transaction', async () => {
    const res = await request(app)
      .delete(`/api/transactions/${transactionId}`)
      .set('Authorization', `Bearer ${userAToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    // Verify deletion
    const verifyRes = await request(app)
      .get(`/api/transactions/${transactionId}`)
      .set('Authorization', `Bearer ${userAToken}`);

    expect(verifyRes.status).toBe(404);
  });
});
