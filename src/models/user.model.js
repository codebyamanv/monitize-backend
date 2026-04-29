import { Schema, model } from 'mongoose'
import bcrypt from 'bcrypt'

const userSchema = new Schema(
    {
        role: {
            type: String,
            enum: ['user', 'admin'],
            default: 'user',
        },
        fullname: {
            type: String,
            required: true,
            trim: true,
        },
        fullnameLower: {
            type: String,
            index: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            match: [/^\S+@\S+\.\S+$/, 'Invalid email'],
        },
        isEmailVerified: {
            type: Boolean,
            default: false,
        },
        userType: {
            type: String,
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
            enum: ['active', 'inactive', 'deleted', 'banned'],
            default: 'active',
        },
        password: {
            type: String,
            required: true,
        },
        avatar: {
            type: String,
            default: 'uploads/avatar/default/avatar.png',
        },
        avatarPath: String,
        emailVerificationToken: String,
        emailVerificationExpires: Date,
    },
    {
        timestamps: true,
    },
)

// Indexes
userSchema.index({ fullnameLower: 1 })
userSchema.index({ status: 1, createdAt: -1 })

// Hooks
userSchema.pre('save', async function (next) {
    if (this.isModified('fullname')) {
        this.fullnameLower = this.fullname.toLowerCase()
    }

    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 12)
    }

    next()
})

// Methods
userSchema.methods.isPasswordCorrect = async function (password) {
    return bcrypt.compare(password, this.password)
}

const User = model('User', userSchema)
export default User
