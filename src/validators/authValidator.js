import z from 'zod/v4'

export const loginValidator = z.object({
    email: z.email('Invalid email'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
})

export const registerValidator = loginValidator.extend({
    fullname: z.string('Fullname must be a string').regex(/^[^\d]*$/, 'Fullname must not contain digits'),
    userType: z.enum(['individual', 'professional', 'business-owner', 'student']).default('individual'),
    interests: z.array(z.string()).default([]),
})
