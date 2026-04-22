import { Schema, model } from 'mongoose'
import bcrypt from 'bcrypt'

const professionalSchema = new Schema(
    {
        user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        fullname: {
            type: String,
            required: true,
        },
        experience: String,
        website: String,
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
        },
        linkedin: String,
        specialization: [String],
        license: String,
        bio: String,
        city: String,
        profession: String,
        professional_avatar: String,
        status: {
            type: String,
            enum: ['approved', 'rejected', 'pending'],
            default: 'pending',
        },
    },
    {
        timestamps: true,
    },
)

const Professional = model('Professional', professionalSchema)
export default Professional
