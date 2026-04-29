import { Session, User } from '../../helpers/modelHelper.js'
import { ApiResponse, asyncHandler, ErrorResponse } from '../../helpers/handlersHelper.js'
import { cookieOptions, generateSessionToken } from '../../utils/sessionUtils.js'
import { loginValidator, registerValidator } from '../../validators/authValidator.js'

export const adminLogin = asyncHandler(async (req, res) => {
    const { success, data, error } = loginValidator.safeParse(req.body)
    if (!success) {
        const zodError = JSON.parse(error)
            .map((err) => err.message)
            .join(', ')
        throw new ErrorResponse(zodError, 400, 'ValidationError')
    }

    const user = await User.findOne({ email: data.email })
    if (!user) {
        throw new ErrorResponse('Invalid credentials', 401, 'InvalidCredentialsError')
    }
    const isPasswordCorrect = await user.isPasswordCorrect(data.password)
    if (!isPasswordCorrect) {
        throw new ErrorResponse('Invalid credentials', 401, 'InvalidCredentialsError')
    }
    if (!user.isEmailVerified) {
        throw new ErrorResponse('Email not verified.', 403, 'EmailNotVerifiedError')
    }
    if (user.role !== 'admin') {
        throw new ErrorResponse('Unauthorized.', 403, 'UnauthorizedError')
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
