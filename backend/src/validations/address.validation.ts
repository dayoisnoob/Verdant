import z from 'zod';

const NIGERIAN_STATES = [
  'Abia',
  'Adamawa',
  'Akwa Ibom',
  'Anambra',
  'Bauchi',
  'Bayelsa',
  'Benue',
  'Borno',
  'Cross River',
  'Delta',
  'Ebonyi',
  'Edo',
  'Ekiti',
  'Enugu',
  'FCT — Abuja',
  'Gombe',
  'Imo',
  'Jigawa',
  'Kaduna',
  'Kano',
  'Katsina',
  'Kebbi',
  'Kogi',
  'Kwara',
  'Lagos',
  'Nasarawa',
  'Niger',
  'Ogun',
  'Ondo',
  'Osun',
  'Oyo',
  'Plateau',
  'Rivers',
  'Sokoto',
  'Taraba',
  'Yobe',
  'Zamfara',
] as const;

const nigerianPhoneRegex = /^(0?[789][01]\d{8})$/;

export const addressSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  streetAddress: z.string().min(5, 'Enter a full street address'),
  state: z.enum(NIGERIAN_STATES, {
    error: 'Select a valid Nigerian state',
  }),
  phone1: z
    .string()
    .regex(nigerianPhoneRegex, 'Enter a valid Nigerian phone number'),
  phone2: z
    .string()
    .regex(nigerianPhoneRegex, 'Enter a valid Nigerian phone number')
    .optional()
    .or(z.literal(''))
    .transform((val) => (val === '' ? undefined : val)),
});

export type AddressForm = z.infer<typeof addressSchema>;
