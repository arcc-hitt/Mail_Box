import { z } from 'zod'

// Advanced password policy:
// - min 8 chars
// - at least 1 uppercase, 1 lowercase, 1 digit, 1 special
// - no spaces
// - should not contain the email local-part
export const signupSchema = z
  .object({
    email: z
      .string({ required_error: 'Email is required' })
      .trim()
      .email('Please enter a valid email'),
    password: z
      .string({ required_error: 'Password is required' })
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Must contain at least one number')
      .regex(/[^A-Za-z0-9]/, 'Must contain at least one special character')
      .regex(/^\S+$/, 'No spaces allowed'),
    confirmPassword: z
      .string({ required_error: 'Please confirm your password' })
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match',
  })
  .superRefine((data, ctx) => {
    const local = data.email?.split('@')[0]?.toLowerCase() || ''
    if (local && data.password?.toLowerCase().includes(local)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['password'],
        message: 'Password should not contain your email name',
      })
    }
  })

export const passwordChecks = [
  { label: 'At least 8 characters', test: (p) => p.length >= 8 },
  { label: 'Contains uppercase letter', test: (p) => /[A-Z]/.test(p) },
  { label: 'Contains lowercase letter', test: (p) => /[a-z]/.test(p) },
  { label: 'Contains a number', test: (p) => /\d/.test(p) },
  { label: 'Contains a special character', test: (p) => /[^A-Za-z0-9]/.test(p) },
  { label: 'No spaces', test: (p) => /^\S+$/.test(p) },
]
