import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../../app';
import { db } from '../../config/db';
import { usersTable } from '../../db/schema/users';
import { eq } from 'drizzle-orm';

const REGISTER_EMAIL = 'register-test@example.com';

const TEST_USER = {
  firstName: 'Test',
  email: 'login-test@example.com',
  password: 'Password123',
};

describe('POST /api/auth/register', () => {
  afterAll(async () => {
    await db.delete(usersTable).where(eq(usersTable.email, REGISTER_EMAIL));
  });

  it('registers a new user successfully', async () => {
    const res = await request(app).post('/api/auth/register').send({
      firstName: 'Test',
      email: REGISTER_EMAIL,
      password: 'Password123',
      confirmPassword: 'Password123',
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe(REGISTER_EMAIL);
    expect(res.body.data.user.passwordHash).toBeUndefined();
  });

  it('rejects duplicate email with 409', async () => {
    const res = await request(app).post('/api/auth/register').send({
      firstName: 'Test',
      email: REGISTER_EMAIL,
      password: 'Password123',
      confirmPassword: 'Password123',
    });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
  });

  it('rejects invalid email format', async () => {
    const res = await request(app).post('/api/auth/register').send({
      firstName: 'Test',
      email: 'not-an-email',
      password: 'Password123',
      confirmPassword: 'Password123',
    });

    expect(res.status).toBe(400);
  });

  it('rejects weak password', async () => {
    const res = await request(app).post('/api/auth/register').send({
      firstName: 'Test',
      email: REGISTER_EMAIL,
      password: '123',
      confirmPassword: '123',
    });

    expect(res.status).toBe(400);
  });
});

describe('POST /api/auth/login', () => {
  beforeAll(async () => {
    await request(app).post('/api/auth/register').send({
      firstName: TEST_USER.firstName,
      email: TEST_USER.email,
      password: TEST_USER.password,
      confirmPassword: TEST_USER.password,
    });

    await db
      .update(usersTable)
      .set({ emailVerified: true })
      .where(eq(usersTable.email, TEST_USER.email));
  });

  afterAll(async () => {
    await db.delete(usersTable).where(eq(usersTable.email, TEST_USER.email));
  });

  it('logs in with correct credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: TEST_USER.email, password: TEST_USER.password });

    expect(res.status).toBe(200);
    expect(res.body.data.accessToken).toBeDefined();
    expect(res.body.data.user.email).toBe(TEST_USER.email);
    expect(res.headers['set-cookie']).toBeDefined();
  });

  it('rejects wrong password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: TEST_USER.email, password: 'WrongPassword123' });

    expect(res.status).toBe(403);
  });

  it('rejects unverified email', async () => {
    await db
      .update(usersTable)
      .set({ emailVerified: false })
      .where(eq(usersTable.email, TEST_USER.email));

    await request(app).post('/api/auth/register').send({
      firstName: 'Unverified',
      email: TEST_USER.email,
      password: 'Password123',
      confirmPassword: 'Password123',
    });

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: TEST_USER.email, password: 'Password123' });

    expect(res.status).toBe(403);
    expect(res.body.message).toContain('verify your email');

    await db
      .update(usersTable)
      .set({ emailVerified: true })
      .where(eq(usersTable.email, TEST_USER.email));
  });

  it('rejects non-existent email', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'ghost@example.com', password: 'Password123' });

    expect(res.status).toBe(403);
  });
});
