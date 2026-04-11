import { z } from "zod";

const nigerianPhoneRegex = /^(0?[789][01]\d{8})$/;

export const registrationSchema = z
  .object({
    firstName: z.string().min(2, "First name must be at least 2 characters"),
    lastName: z.string().optional(),
    email: z.string().email("Invalid email address"),
    password: z
      .string()
      .min(8, "password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  email: z.string().email("please enter a valid email").trim().toLowerCase(),
  password: z.string().min(1, "password is required"),
});

export const checkoutSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().optional(),
  streetAddress: z.string().min(1, "Address is required"),
  phone1: z.string().min(10, "Enter a valid phone number"),
  phone2: z.string().optional(),
  state: z.string().min(1, "Select a state"),
  deliveryNotes: z.string().optional(),
});

export const addressSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().optional(),
  phone1: z.string().regex(nigerianPhoneRegex, "Enter a valid Nigerian number"),
  phone2: z
    .string()
    .regex(nigerianPhoneRegex, "Enter a valid Nigerian number")
    .optional()
    .or(z.literal("")),
  streetAddress: z.string().min(5, "Enter a full street address"),
  state: z.string().min(1, "State is required"),
});

export const updateProfileSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(8, "Must be at least 8 characters"),
    confirmNewPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmNewPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export const resetPasswordSchema = z.object({
  newPassword: z.string().min(1, "Password is required"),
  confirmNewPassword: z.string(),
});

export type LoginForm = z.infer<typeof loginSchema>;
export type RegistrationForm = z.infer<typeof registrationSchema>;
export type CheckoutForm = z.infer<typeof checkoutSchema>;
export type AddressFormData = z.infer<typeof addressSchema>;
export type ProfileForm = z.infer<typeof updateProfileSchema>;
export type ChangePasswordForm = z.infer<typeof changePasswordSchema>;
export type ResetPasswordForm = z.infer<typeof resetPasswordSchema>;
