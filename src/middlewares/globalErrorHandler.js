import { cookieOptions } from '../utils/sessionUtils.js'

const globalErrorHandler = (err, req, res, next) => {
    let error = { ...err }
    error.message = err.message

    // Log error for debugging
    console.error(err)

    // Mongoose bad ObjectId
    if (err.name === 'CastError') {
        const message = 'Resource not found'
        error = { message, statusCode: 404 }
    }

    // Mongoose duplicate key
    if (err.code === 11000) {
        const message = 'Duplicate field value entered'
        error = { message, statusCode: 400 }
    }

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const message = Object.values(err.errors).map((val) => val.message)
        console.log(message)
        error = { message, statusCode: 400 }
    }

    // Cookie-related errors
    if (err.name === 'CookieParseError') {
        const message = 'Invalid cookie format. Please clear cookies and try again'
        error = { message, statusCode: 400 }
    }

    // Session/Cookie authentication errors
    if (err.name === 'SessionExpiredError') {
        const message = 'Your session has expired. Please log in again'
        error = { message, statusCode: 401 }
        // Clear the expired cookie
        res.clearCookie('sessionToken', cookieOptions)
    }

    if (err.name === 'InvalidSessionError') {
        const message = 'Invalid session. Please log in again'
        error = { message, statusCode: 401 }
        // Clear the invalid cookie
        res.clearCookie('sessionToken', cookieOptions)
    }

    if (err.name === 'CookieNotFoundError') {
        const message = 'Authentication required. Please log in'
        error = { message, statusCode: 401 }
    }

    res.status(error.statusCode || 500).json({
        success: false,
        error: {
            message: error.message || 'Server Error',
            ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
        },
    })
}

export default globalErrorHandler
