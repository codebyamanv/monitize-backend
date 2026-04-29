import { Schema, model } from 'mongoose'
import { en } from 'zod/v4/locales'

const bookingSchema = new Schema(
    {
        user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        professional: { type: Schema.Types.ObjectId, ref: 'Professional', required: true },
        fullname: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
        },
        status: {
            type: String,
            required: true,
            default: 'pending',
            enum: ['pending', 'accepted', 'rejected'],
        },
        phone: {
            type: String,
            trim: true,
        },
        message: {
            type: String,
            required: true,
        },
    },
    {
        timestamps: true,
    },
)

const Booking = model('Booking', bookingSchema)
export default Booking
