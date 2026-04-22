import { Schema, model } from 'mongoose'
import bcrypt from 'bcrypt'

const userSchema = new Schema(
    {
        role: {
            type: String,
            required: true,
            enum: ['user', 'admin'],
            default: 'user',
        },
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
        isEmailVerified: {
            type: Boolean,
            required: true,
            default: false,
        },
        userType: {
            type: String,
            required: true,
            enum: ['individual', 'professional', 'business-owner', 'student'],
            default: 'individual',
        },
        professionalAccount: {
            type: Schema.Types.ObjectId,
            ref: 'Professional',
        },
        interests: {
            type: [String],
            default: [],
        },
        status: {
            type: String,
            enum: ['active', 'inactive', 'deleted', 'banned', 'disabled'],
            default: 'active',
        },
        password: {
            type: String,
            required: true,
        },
        avatar: {
            type: String,
            required: true,
            default: 'uploads/avatar/default/avatar.png',
        },
        avatarPath: {
            type: String,
        },
        emailVerificationToken: {
            type: String,
        },
        emailVerificationExpires: {
            type: Date,
        },
    },
    {
        timestamps: true,
    },
)

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next()
    this.password = await bcrypt.hash(this.password, 12)
    next()
})

userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password)
}

const User = model('User', userSchema)
export default User
