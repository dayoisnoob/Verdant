import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { type Request, type Response } from 'express';
import { globalErrorHandler, notFoundError } from './middlewares/error';
import addressRouter from './router/address.ts';
import authRouter from './router/auth.ts';
import cartRouter from './router/cart.ts';
import couponsRouter from './router/coupons.ts';
import orderRouter from './router/orders.ts';
import paymentRouter from './router/payments.ts';
import productRouter from './router/products.ts';
import wishlistRouter from './router/wishlist.ts';

export const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));

app.use(cookieParser());
app.use(express.json());
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'up',
    timestamp: new Date().toISOString(),
    uptime: process.uptime,
  });
});

app.use('/api/auth', authRouter);
app.use('/api/products', productRouter);
app.use('/api/payments', paymentRouter);
app.use('/api/orders', orderRouter);
app.use('/api/address', addressRouter);
app.use('/api/wishlist', wishlistRouter);
app.use('/api/coupons', couponsRouter);
app.use('/api/cart', cartRouter);

app.use(notFoundError);
app.use(globalErrorHandler);
