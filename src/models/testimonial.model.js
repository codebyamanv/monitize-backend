import { Schema, model } from 'mongoose'

const testimonialSchema = new Schema(
    {
        fullname: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
            match: [/^\S+@\S+\.\S+$/, 'Invalid email'],
        },
        message: {
            type: String,
            required: true,
            trim: true,
        },
        profession: {
            type: String,
            required: true,
            trim: true,
        },
        avatar: {
            type: String,
            required: true,
        },
        status: {
            type: String,
            enum: ['pending', 'approved', 'rejected'],
            default: 'pending',
        },
    },
    {
        timestamps: true,
    },
)

// Indexes
testimonialSchema.index({ createdAt: -1 })
testimonialSchema.index({ email: 1 })

// Optional anti-duplicate protection
// testimonialSchema.index({ email: 1, message: 1 }, { unique: true })

const Testimonial = model('Testimonial', testimonialSchema)
export default Testimonial
