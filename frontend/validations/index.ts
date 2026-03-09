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

const nigerianPhoneRegex = /^[789]\d{9}$/;

export const addressSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().optional(),
  phone1: z
    .string()
    .regex(nigerianPhoneRegex, "Enter a valid Nigerian number e.g. 8012345678"),
  phone2: z
    .string()
    .regex(nigerianPhoneRegex, "Enter a valid Nigerian number e.g. 8012345678")
    .optional()
    .or(z.literal("")),
  streetAddress: z.string().min(5, "Enter a full street address"),
  state: z.string().min(1, "State is required"),
});

export type RegistrationForm = z.infer<typeof registrationSchema>;
export type CheckoutForm = z.infer<typeof checkoutSchema>;
export type AddressFormData = z.infer<typeof addressSchema>;
