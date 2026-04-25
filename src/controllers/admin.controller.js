import Session from '../models/session.model.js'
import User from '../models/user.model.js'
import ApiResponse from '../utils/apiResponse.js'
import asyncHandler from '../utils/asyncHandler.js'
import ErrorResponse from '../utils/errorResponse.js'
import { cookieOptions, generateSessionToken } from '../utils/sessionUtils.js'
import { loginValidator, registerValidator } from '../validators/authValidator.js'
import Professional from '../models/professional.model.js'

export const adminLogin = asyncHandler(async (req, res) => {
    const { success, data, error } = loginValidator.safeParse(req.body)
    if (!success) {
        const zodError = JSON.parse(error)
            .map((err) => err.message)
            .join(', ')
        throw new ErrorResponse(zodError, 400, 'ValidationError')
    }

    const user = await User.findOne({ email: data.email })
    console.log(user)
    if (!user) {
        throw new ErrorResponse('Invalid credentials', 401, 'InvalidCredentialsError')
    }
    const isPasswordCorrect = await user.isPasswordCorrect(data.password)
    if (!isPasswordCorrect) {
        throw new ErrorResponse('Invalid credentials', 401, 'InvalidCredentialsError')
    }
    if (!user.isEmailVerified) {
        throw new ErrorResponse('Email not verified.', 401, 'EmailNotVerifiedError')
    }
    if (user.role !== 'admin') {
        throw new ErrorResponse('Unauthorized. Only Admins can access this panel.', 403, 'UnauthorizedError')
    }

    const sessionToken = generateSessionToken()
    await Session.deleteMany({
        userId: user._id,
    })
    await Session.create({
        userId: user._id,
        token: sessionToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    })
    res.cookie('sessionToken', sessionToken, cookieOptions)

    return ApiResponse.success({ sessionToken }, 'Login successful').send(res)
})

export const currentAdmin = asyncHandler(async (req, res) => {
    return ApiResponse.success(req.user).send(res)
})
export const logoutAdmin = asyncHandler(async (req, res) => {
    const sessionToken = req.cookies.sessionToken
    await Session.deleteOne({ token: sessionToken })
    res.clearCookie('sessionToken', cookieOptions)
    return ApiResponse.success({}, 'Logout successful').send(res)
})

export const allUsers = asyncHandler(async (req, res) => {
    const { limit = 10, page = 1, q } = req.query
    const filter = {}
    if (q) {
        filter.$or = [
            { fullname: { $regex: q, $options: 'i' } },
            { email: { $regex: q, $options: 'i' } },
            { userType: { $regex: q, $options: 'i' } },
        ]
    }
    const totalDocs = await User.countDocuments(filter)
    const totalPages = Math.ceil(totalDocs / limit)
    const skip = (page - 1) * limit

    const users = await User.find(filter).skip(skip).limit(limit).select('-password').lean()
    return ApiResponse.success({ users, count: totalDocs, totalPages }, 'All User Fetched').send(res)
})
// for admin panel only

// Manage user roles and other activity
export const changeUserRole = asyncHandler(async (req, res) => {
    const { id, role } = req.query
    const user = await User.findById(id)
    if (!user) {
        throw new ErrorResponse('User not found', 404, 'UserNotFoundError')
    }
    user.role = role
    await user.save()
    return ApiResponse.success({}, 'User role changed successfully.').send(res)
})

export const allProfessionalsApplicants = asyncHandler(async (req, res) => {
    const { limit = 10, page = 1, q } = req.query
    const filter = {}
    if (q) {
        filter.$or = [
            { fullname: { $regex: q, $options: 'i' } },
            { email: { $regex: q, $options: 'i' } },
            { license: { $regex: q, $options: 'i' } },
            { city: { $regex: q, $options: 'i' } },
        ]
    }
    const totalDocs = await Professional.countDocuments(filter)
    const totalPages = Math.ceil(totalDocs / limit)
    const skip = (page - 1) * limit
    const professionals = await Professional.find(filter).skip(skip).limit(limit).lean()
    return ApiResponse.success(
        { professionals, count: totalDocs, totalPages },
        'All Professional Applicants Fetched',
    ).send(res)
})
// for admin only - approve or reject
export const updateProfessionalStatus = asyncHandler(async (req, res) => {
    const { id, action } = req.query

    if (!['approve', 'reject'].includes(action)) {
        throw new ErrorResponse('Invalid action. Must be either "approve" or "reject".', 400, 'InvalidActionError')
    }

    const professional = await Professional.findById(id)
    if (!professional) {
        throw new ErrorResponse('Professional applicant not found.', 404, 'NotFoundError')
    }

    professional.status = action === 'approve' ? 'approved' : 'rejected'
    if (action === 'approve') {
        await User.findByIdAndUpdate(professional.user, { userType: 'professional' })
    }
    await professional.save()

    return ApiResponse.success(
        {},
        `Professional applicant ${action === 'approve' ? 'approved' : 'rejected'} successfully.`,
    ).send(res)
})

// for users
export const changeEmailVerifyStatus = asyncHandler(async (req, res) => {
    const { id, action } = req.query
    await User.findByIdAndUpdate(id, { isEmailVerified: action })
    return ApiResponse.success({}, 'Email Verify status changed').send(res)
})

export const removeUserSession = asyncHandler(async (req, res) => {
    const { id } = req.params
    const allSessions = await Session.deleteMany({ userId: id })
    return ApiResponse.success({}, 'All sessions removed successfully').send(res)
})
