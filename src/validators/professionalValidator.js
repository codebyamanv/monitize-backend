import z from 'zod/v4'

export const registerProfessionalValidator = z.object({
    fullname: z.string('Fullname must be a string').regex(/^[^\d]*$/, 'Fullname must not contain digits'),
    email: z.email('Invalid email'),
    city: z.string('City must be a string').min(1, 'City is required'),
    profession: z.string('Profession must be a string').min(1, 'Profession is required'),
    license: z.string('License number must be a string').min(1, 'License number is required'),
    experience: z.string('Experience must be a string').min(1, 'Experience is required'),
    specialization: z.string('Specialization must be a string').min(1, 'Specialization is required'),
    bio: z.string('Description must be a string').min(1, 'Description is required'),
    website: z.string('Website must be a string').url('Invalid URL').optional(),
    linkedin: z.string('LinkedIn must be a string').url('Invalid URL').optional(),
})
