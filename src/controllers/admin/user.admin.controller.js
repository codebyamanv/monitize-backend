import { Session, User } from '../../helpers/modelHelper.js'
import { ApiResponse, asyncHandler, ErrorResponse } from '../../helpers/handlersHelper.js'

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
