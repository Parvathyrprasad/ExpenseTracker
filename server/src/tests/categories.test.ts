import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../app';
import { prisma } from '../prisma';

describe('Categories API Endpoints', () => {
  let userAToken: string;
  let userBToken: string;
  let userAId: string;
  let userBId: string;
  let customCategoryId: string;
  let defaultCategoryId: string;

  beforeAll(async () => {
    // Create User A
    const resA = await request(app).post('/api/auth/register').send({
      email: `cat_user_a_${Date.now()}@example.com`,
      password: 'Password123!',
      firstName: 'Category',
      lastName: 'UserA',
    });
    userAToken = resA.body.data.token;
    userAId = resA.body.data.user.id;

    // Create User B
    const resB = await request(app).post('/api/auth/register').send({
      email: `cat_user_b_${Date.now()}@example.com`,
      password: 'Password123!',
      firstName: 'Category',
      lastName: 'UserB',
    });
    userBToken = resB.body.data.token;
    userBId = resB.body.data.user.id;

    // Find one default category
    const defaultCat = await prisma.category.findFirst({
      where: { isDefault: true },
    });
    defaultCategoryId = defaultCat!.id;
  });

  afterAll(async () => {
    await prisma.user.deleteMany({
      where: { id: { in: [userAId, userBId] } },
    });
    await prisma.$disconnect();
  });

  it('GET /api/categories - should list all default categories (at least 18)', async () => {
    const res = await request(app)
      .get('/api/categories')
      .set('Authorization', `Bearer ${userAToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.categories.length).toBeGreaterThanOrEqual(18);

    const hasFood = res.body.data.categories.some(
      (c: any) => c.name === 'Food & Dining' && c.isDefault === true
    );
    expect(hasFood).toBe(true);
  });

  it('POST /api/categories - should create a custom category for authenticated user', async () => {
    const res = await request(app)
      .post('/api/categories')
      .set('Authorization', `Bearer ${userAToken}`)
      .send({
        name: 'Gym & Fitness',
        type: 'EXPENSE',
        icon: 'Dumbbell',
        color: '#10B981',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.category.name).toBe('Gym & Fitness');
    expect(res.body.data.category.isDefault).toBe(false);
    expect(res.body.data.category.userId).toBe(userAId);

    customCategoryId = res.body.data.category.id;
  });

  it('POST /api/categories - should reject duplicate category under the same type', async () => {
    const res = await request(app)
      .post('/api/categories')
      .set('Authorization', `Bearer ${userAToken}`)
      .send({
        name: 'Gym & Fitness',
        type: 'EXPENSE',
      });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
  });

  it('PUT /api/categories/:id - should update user custom category', async () => {
    const res = await request(app)
      .put(`/api/categories/${customCategoryId}`)
      .set('Authorization', `Bearer ${userAToken}`)
      .send({
        name: 'CrossFit & Gym',
        color: '#059669',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.category.name).toBe('CrossFit & Gym');
  });

  it('PUT /api/categories/:id - should reject modification of a system default category', async () => {
    const res = await request(app)
      .put(`/api/categories/${defaultCategoryId}`)
      .set('Authorization', `Bearer ${userAToken}`)
      .send({
        name: 'Renamed Default',
      });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/cannot be modified/i);
  });

  it('PUT /api/categories/:id - User B cannot modify User A custom category (Strict Isolation)', async () => {
    const res = await request(app)
      .put(`/api/categories/${customCategoryId}`)
      .set('Authorization', `Bearer ${userBToken}`)
      .send({
        name: 'Hacked Category',
      });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it('DELETE /api/categories/:id - should reject deletion of system default category', async () => {
    const res = await request(app)
      .delete(`/api/categories/${defaultCategoryId}`)
      .set('Authorization', `Bearer ${userAToken}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it('DELETE /api/categories/:id - User B cannot delete User A custom category', async () => {
    const res = await request(app)
      .delete(`/api/categories/${customCategoryId}`)
      .set('Authorization', `Bearer ${userBToken}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it('DELETE /api/categories/:id - User A can delete own custom category', async () => {
    const res = await request(app)
      .delete(`/api/categories/${customCategoryId}`)
      .set('Authorization', `Bearer ${userAToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
