import { ApiResponse } from '../helpers/handlersHelper.js'
import { cookieOptions } from '../utils/sessionUtils.js'

const globalErrorHandler = (err, req, res, next) => {
    let statusCode = err.statusCode || 500
    let message = err.message || 'Server Error'

    // Mongoose errors
    if (err.name === 'CastError') {
        statusCode = 404
        message = 'Resource not found'
    }

    if (err.code === 11000) {
        statusCode = 400
        message = 'Duplicate field value entered'
    }

    if (err.name === 'ValidationError') {
        statusCode = 400
        message = Object.values(err.errors)
            .map((val) => val.message)
            .join(', ')
    }

    if (err.name === 'SessionExpiredError') {
        statusCode = 401
        message = 'Session expired. Please login again'
        res.clearCookie('sessionToken', cookieOptions)
    }

    if (err.name === 'InvalidSessionError') {
        statusCode = 401
        message = 'Invalid session. Please login again'
        res.clearCookie('sessionToken', cookieOptions)
    }

    if (err.name === 'CookieNotFoundError') {
        statusCode = 401
        message = 'Authentication required'
    }

    return ApiResponse.internalServerError(message, statusCode).send(res)
}

export default globalErrorHandler
