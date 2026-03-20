import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { type Request, type Response } from 'express';
import helmet from 'helmet';
import { env } from './config/env.ts';
import {
  globalErrorHandler,
  notFoundError,
} from './middleware/error.middleware.ts';
import { globalLimiter } from './middleware/rate-limit.middleware.ts';
import addressRouter from './routes/address.routes.ts';
import authRouter from './routes/auth.routes.ts';
import cartRouter from './routes/cart.routes.ts';
import couponsRouter from './routes/coupons.routes.ts';
import orderRouter from './routes/orders.routes.ts';
import paymentRouter from './routes/payments.routes.ts';
import productRouter from './routes/products.routes.ts';
import wishlistRouter from './routes/wishlist.routes.ts';

export const app = express();

app.use(helmet());
app.use(
  cors({
    origin: env.FRONTEND_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

if (env.NODE_ENV !== 'development') {
  app.use(globalLimiter);
}

app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));

app.use(cookieParser());
app.use(express.json());
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'up',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
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
