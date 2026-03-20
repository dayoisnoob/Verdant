import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import { app } from '../../app';
import { db } from '../../config/db';
import { cartItemsTable, productsTable, usersTable } from '../../db';
import { eq } from 'drizzle-orm';

const TEST_USER = {
  firstName: 'Test',
  email: 'testuser@gmail.com',
  password: 'Password123',
  confirmPassword: 'Password123',
};

let accessToken: string;
let productId: string | undefined;
const uniqueSlug = `test-tomatoes-${Date.now()}`;

beforeAll(async () => {
  await db.delete(usersTable).where(eq(usersTable.email, TEST_USER.email));
  await db.delete(productsTable).where(eq(productsTable.slug, uniqueSlug));

  await request(app).post('/api/auth/register').send(TEST_USER);

  await db
    .update(usersTable)
    .set({ emailVerified: true })
    .where(eq(usersTable.email, TEST_USER.email));

  const loginRes = await request(app)
    .post('/api/auth/login')
    .send({ email: TEST_USER.email, password: TEST_USER.password });

  const [product] = await db
    .insert(productsTable)
    .values({
      name: 'Test Tomatoes',
      slug: uniqueSlug,
      description: 'Test product',
      price: 299,
      category: 'Vegetables',
      unit: 'per kg',
      farm: 'Test Farm',
      origin: 'Test Origin',
      isOrganic: false,
      inStock: true,
      stock: 100,
      images: [{ url: 'https://example.com/img.jpg', alt: 'test' }],
      rating: '4.5',
    })
    .returning();

  productId = product?.id;
  accessToken = loginRes.body.data.accessToken;
});

afterAll(async () => {
  await db.delete(usersTable).where(eq(usersTable.email, TEST_USER.email));
  await db.delete(productsTable).where(eq(productsTable.id, productId!));
});

describe('POST /api/cart/items', () => {
  it('adds in-stock item to cart', async () => {
    const res = await request(app)
      .post('/api/cart/items')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ productId, quantity: 1 });

    expect(res.status).toBe(201);
    expect(res.body.data.item.productId).toBe(productId);
    expect(res.body.data.item.quantity).toBe(1);
    expect(res.body.data.item.pricePence).toBeDefined();

    const cartRes = await request(app)
      .get('/api/cart')
      .set('Authorization', `Bearer ${accessToken}`);

    const cartItem = cartRes.body.data.cart.items.find(
      (i: any) => i.productId === productId
    );

    expect(cartItem).toBeDefined();
    expect(cartItem.quantity).toBe(1);
  });
});

describe('PATCH /api/cart/items/:productId', () => {
  it('increments quantity', async () => {
    const res = await request(app)
      .patch(`/api/cart/items/${productId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ quantity: 5 });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.quantity).toBe(5);
  });

  it('removes item when quantity is 0', async () => {
    const res = await request(app)
      .patch(`/api/cart/items/${productId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ quantity: 0 });

    expect(res.status).toBe(200);

    const product = await db
      .select({})
      .from(cartItemsTable)
      .where(eq(cartItemsTable.productId, productId as string))
      .limit(1);

    expect(product.length).toBe(0);
  });

  it('rejects quantity above max', async () => {
    const res = await request(app)
      .patch(`/api/cart/items/${productId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ quantity: 11 });

    expect(res.status).toBe(400);
  });

  it('rejects request without auth', async () => {
    const res = await request(app)
      .patch(`/api/cart/items/${productId}`)
      .send({ quantity: 1 });

    expect(res.status).toBe(401);
  });
});
