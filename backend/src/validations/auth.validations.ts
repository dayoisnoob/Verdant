import { z } from 'zod';

export const signupSchemaValidation = z.object({
  firstName: z.string().min(2).trim(),
  lastName: z.string().min(2).trim().optional(),
  email: z.string().email('please enter a valid email').trim().toLowerCase(),
  password: z
    .string()
    .min(8, 'password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
});

export const loginSchemaValidation = z.object({
  email: z.string().email('please enter a valid email').trim().toLowerCase(),
  password: z.string().min(1, 'password is required'),
});

export const resendEmailSchemaValidation = z.object({
  email: z.string().email('please enter a valid email').trim().toLowerCase(),
});

export const forgotPasswordSchemaValidation = z.object({
  email: z.string().email('please enter a valid email').trim().toLowerCase(),
});

export const resetPasswordSchemaValidation = z
  .object({
    newPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
    confirmNewPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: 'Passwords do not match',
    path: ['confirmNewPassword'],
  });

export const changePasswordSchemaValidation = z
  .object({
    currentPassword: z.string().min(1, 'password is required'),
    newPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
    confirmNewPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: 'Passwords do not match',
    path: ['confirmNewPassword'],
  });

export type SignupInput = z.infer<typeof signupSchemaValidation>;
export type LoginInput = z.infer<typeof loginSchemaValidation>;
