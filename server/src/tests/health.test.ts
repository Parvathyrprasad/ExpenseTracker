import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../app';

describe('API Health Check', () => {
  it('should return 200 and healthy status with INR as default currency', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('healthy');
    expect(res.body.service).toBe('expense-tracker-api');
    expect(res.body.defaultCurrency).toBe('INR');
    expect(res.body.defaultCurrencySymbol).toBe('₹');
  });
});
