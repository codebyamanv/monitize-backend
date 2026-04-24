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
        license: {
            type: String,
            required: true,
            unique: true,
        },
        bio: String,
        city: String,
        profession: {
            type: String,
            enum: [
                'GST-consultant',
                'tax-advisor',
                'corporate-lawyer',
                'financial-advisor',
                'company-secretary',
                'chartered-accountant',
            ],
        },
        professional_avatar: String,
        license_document: String,
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
