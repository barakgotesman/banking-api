import request from 'supertest';
import app from '../src/app';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Before all tests: clean the DB and seed one Person + one Account
beforeAll(async () => {
  await prisma.transaction.deleteMany();
  await prisma.account.deleteMany();
  await prisma.person.deleteMany();

  await prisma.person.create({
    data: {
      personId: 1,
      name: 'Test User',
      document: '123456789',
      birthDate: new Date('1990-01-01'),
    },
  });

  await prisma.account.create({
    data: {
      accountId: 1,
      personId: 1,
      balance: 1000,
      dailyWithdrawalLimit: 500,
      accountType: 1,
    },
  });
});

// After all tests: disconnect Prisma
afterAll(async () => {
  await prisma.$disconnect();
});

// --- POST /accounts ---
describe('POST /accounts', () => {
  it('should create a new account and return 201', async () => {
    const res = await request(app).post('/accounts').send({
      personId: 1,
      balance: 500,
      dailyWithdrawalLimit: 200,
      accountType: 2,
    });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('accountId');
    expect(res.body.balance).toBe(500);
  });
});

// --- GET /accounts/:id/balance ---
describe('GET /accounts/:id/balance', () => {
  it('should return 200 and the balance', async () => {
    const res = await request(app).get('/accounts/1/balance');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('accountId', 1);
    expect(res.body).toHaveProperty('balance');
  });

  it('should return 404 if account does not exist', async () => {
    const res = await request(app).get('/accounts/9999/balance');

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error', 'Account not found');
  });
});

// --- POST /accounts/:id/deposit ---
describe('POST /accounts/:id/deposit', () => {
  it('should deposit and return updated balance', async () => {
    const res = await request(app).post('/accounts/1/deposit').send({ value: 200 });

    expect(res.status).toBe(200);
    expect(res.body.balance).toBe(1200);
  });

  it('should return 400 for invalid amount', async () => {
    const res = await request(app).post('/accounts/1/deposit').send({ value: -50 });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error', 'Invalid amount');
  });

  it('should return 404 if account does not exist', async () => {
    const res = await request(app).post('/accounts/9999/deposit').send({ value: 100 });

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error', 'Account not found');
  });
});

// --- POST /accounts/:id/withdraw ---
describe('POST /accounts/:id/withdraw', () => {
  it('should withdraw and return updated balance', async () => {
    const res = await request(app).post('/accounts/1/withdraw').send({ value: 100 });

    expect(res.status).toBe(200);
    expect(res.body.balance).toBe(1100);
  });

  it('should return 400 for insufficient balance', async () => {
    const res = await request(app).post('/accounts/1/withdraw').send({ value: 99999 });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error', 'Insufficient balance');
  });

  it('should return 400 when daily limit is exceeded', async () => {
    // Account 1 has dailyWithdrawalLimit: 500, we already withdrew 100 above
    // So withdrawing 450 more would exceed the limit (100 + 450 = 550 > 500)
    const res = await request(app).post('/accounts/1/withdraw').send({ value: 450 });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error', 'Daily withdrawal limit exceeded');
  });

  it('should return 400 for invalid amount', async () => {
    const res = await request(app).post('/accounts/1/withdraw').send({ value: 0 });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error', 'Invalid amount');
  });
});

// --- PATCH /accounts/:id/block ---
describe('PATCH /accounts/:id/block', () => {
  it('should block the account and return 200', async () => {
    const res = await request(app).patch('/accounts/1/block');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('message', 'Account blocked successfully');
  });

  it('should return 403 on deposit to blocked account', async () => {
    const res = await request(app).post('/accounts/1/deposit').send({ value: 100 });

    expect(res.status).toBe(403);
    expect(res.body).toHaveProperty('error', 'Account is blocked');
  });

  it('should return 404 if account does not exist', async () => {
    const res = await request(app).patch('/accounts/9999/block');

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error', 'Account not found');
  });
});

// --- GET /accounts/:id/transactions ---
describe('GET /accounts/:id/transactions', () => {
  it('should return list of transactions', async () => {
    const res = await request(app).get('/accounts/1/transactions');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('should return 404 if account does not exist', async () => {
    const res = await request(app).get('/accounts/9999/transactions');

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error', 'Account not found');
  });

  it('should return 400 for invalid date format', async () => {
    const res = await request(app).get('/accounts/1/transactions?from=not-a-date');

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error', 'Invalid from date');
  });
});
