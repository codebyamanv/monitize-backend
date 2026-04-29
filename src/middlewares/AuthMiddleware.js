import { Session, User } from '../helpers/modelHelper.js'
import { asyncHandler, ErrorResponse } from '../helpers/handlersHelper.js'
import { cookieOptions } from '../utils/sessionUtils.js'

export const accessController = (...allowedRoles) => {
    return asyncHandler(async (req, res, next) => {
        let sessionToken

        if (req.cookies && req.cookies.sessionToken) {
            sessionToken = req.cookies.sessionToken
        } else if (req.headers.authorization) {
            const authHeader = req.headers.authorization

            if (authHeader.startsWith('Bearer ')) {
                sessionToken = authHeader.substring(7)
            } else {
                sessionToken = authHeader
            }
        }

        if (!sessionToken) {
            res.clearCookie('sessionToken', cookieOptions)
            return next(new ErrorResponse('Login to continue', 401, 'CookieNotFoundError'))
        }

        const session = await Session.findOne({ token: sessionToken }).lean()

        if (!session) {
            res.clearCookie('sessionToken', cookieOptions)
            return next(new ErrorResponse('Invalid session. Please log in again', 401, 'InvalidSessionError'))
        }

        if (session.expiresAt < new Date()) {
            await Session.deleteOne({ _id: session._id })
            res.clearCookie('sessionToken', cookieOptions)
            return next(new ErrorResponse('Your session has expired. Please log in again', 401, 'SessionExpiredError'))
        }

        const user = await User.findById(session.userId)
            .populate('professionalAccount')
            .select('-password -emailVerificationToken -emailVerificationExpires -__v')
            .lean()

        if (!user) {
            res.clearCookie('sessionToken', cookieOptions)
            return next(new ErrorResponse('Invalid Credentials', 401, 'InvalidCredentialsError'))
        }

        if (!allowedRoles.includes(user.role)) {
            return next(new ErrorResponse("You don't have permission.", 403))
        }

        req.user = user
        next()
    })
}
