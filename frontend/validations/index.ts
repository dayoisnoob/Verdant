import { z } from "zod";

export const registrationSchema = z
  .object({
    firstName: z.string().min(2, "First name must be at least 2 characters"),
    lastName: z.string().optional(),
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const checkoutSchema = z.object({
  streetAddress: z.string().min(1, "Address is required"),
  phone1: z.string().min(10, "Enter a valid phone number"),
  phone2: z.string().optional(),
  state: z.string().min(1, "Select a state"),
  deliveryNotes: z.string().optional(),
});

export type RegistrationForm = z.infer<typeof registrationSchema>;
export type CheckoutForm = z.infer<typeof checkoutSchema>;
