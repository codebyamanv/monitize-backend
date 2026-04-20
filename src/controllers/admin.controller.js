import Session from '../models/session.model.js'
import User from '../models/user.model.js'
import ApiResponse from '../utils/apiResponse.js'
import asyncHandler from '../utils/asyncHandler.js'
import ErrorResponse from '../utils/errorResponse.js'

export const allUsers = asyncHandler(async (req, res) => {
    const users = await User.find()
    return ApiResponse.success({ users }, 'All User Fetched').send(res)
})
