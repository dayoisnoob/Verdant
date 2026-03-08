import express, { type Request } from 'express';
import rateLimit, { ipKeyGenerator } from 'express-rate-limit';

interface createLimiterInterface {
  keyGenerator: (req: Request) => string | undefined;
  max: number;
  windowMinutes: number;
  message?: string;
}

const app = express();
app.use(express.json());

const createLimiter = ({
  keyGenerator,
  max,
  windowMinutes,
  message,
}: createLimiterInterface) =>
  rateLimit({
    windowMs: windowMinutes * 60 * 1000,
    max,
    keyGenerator: (req) => {
      const key = keyGenerator(req);
      return key ?? ipKeyGenerator(req.ip ?? '127.0.0.1');
    },
    message: message || 'Too many requests. Try again later.',
    standardHeaders: true,
    legacyHeaders: false,
  });

// LOGIN
export const loginEmailLimiter = createLimiter({
  keyGenerator: (req) => req.body.email,
  max: 500,
  windowMinutes: 1,
  // max: 5,
  // windowMinutes: 15,
  message: 'Too many login attempts for this email. Wait 15 minutes.',
});
export const loginIpLimiter = createLimiter({
  keyGenerator: (req) => req.ip,
  max: 100,
  windowMinutes: 1,
  // max: 10,
  // windowMinutes: 60,
});

// // FORGOT PASSWORD
export const forgotPasswordRecentLimiter = createLimiter({
  keyGenerator: (req) => req.body.email,
  max: 100,
  windowMinutes: 200,
});
export const forgotPasswordHourlyLimiter = createLimiter({
  keyGenerator: (req) => req.body.email,
  max: 30,
  windowMinutes: 600,
});

// REGISTER
export const registerIpLimiter = createLimiter({
  keyGenerator: (req) => req.ip,
  max: 50,
  windowMinutes: 60,
});

// RESEND VERIFICATION
export const resendVerificationLimiter = createLimiter({
  keyGenerator: (req) => req.body.email,
  max: 3,
  windowMinutes: 10,
});

// CHANGE PASSWORD
export const changePasswordLimiter = createLimiter({
  keyGenerator: (req) => req.user?.id,
  max: 5,
  windowMinutes: 60,
});
