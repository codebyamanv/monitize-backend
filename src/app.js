import path from 'path'
import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import helmet from 'helmet'
import morgan from 'morgan'
import asyncHandler from './utils/asyncHandler.js'
import globalErrorHandler from './middlewares/globalErrorHandler.js'
import baseRouter from './routes/base.routes.js'
import userRouter from './routes/user.routes.js'
import adminRouter from './routes/admin.routes.js'
import citiesRouter from './routes/cities.routes.js'
import rateLimit from 'express-rate-limit'
import professionalRouter from './routes/professional.routes.js'

const app = express()

app.use(
    cors({
        origin: [
            'http://localhost:3000',
            'http://localhost:4000',
            'https://monitize.vercel.app',
            'https://monitize-admin.vercel.app',
        ],
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
        credentials: true,
    }),
)

app.use(helmet())
app.use(morgan('dev'))
app.use(express.json({ limit: '16kb' }))
app.use(express.urlencoded({ extended: true }))

// serve static files
app.use((req, res, next) => {
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin')
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin')
    next()
})
app.use('/api/v1/uploads', express.static(path.join(process.cwd(), 'uploads')))
app.use(cookieParser())
app.use(
    rateLimit({
        windowMs: 15 * 60 * 1000,
        limit: 1000,
        message: { error: 'Too many requests.' },
        standardHeaders: 'draft-8',
        legacyHeaders: false,
    }),
)

// Enable this in production so this will prevent postman or any other client from making too many requests to the server, it allow only browsers to send requests

app.use((req, res, next) => {
    const referer = req.get('Referer')
    const origin = req.get('Origin')
    console.log({ referer, origin })
    const allowedDomains = [
        'http://localhost:3000',
        'http://localhost:4000',
        'https://monitize.vercel.app',
        'https://monitize-admin.vercel.app',
    ]
    const isAllowed = allowedDomains.some((domain) => origin?.startsWith(domain) || referer?.startsWith(domain))
    if (!isAllowed) {
        return res.status(403).json({ message: 'Invalid origin' })
    }
    next()
})

// add routes
app.use('/', baseRouter)
app.use('/api/v1/users', userRouter)
app.use('/api/v1/admin', adminRouter)
app.use('/api/v1/cities', citiesRouter)
app.use('/api/v1/professionals', professionalRouter)

// global error handler
app.all(
    '/*catchAll',
    asyncHandler(async (req, res, next) => {
        const error = new Error(`Route ${req.originalUrl} not found`)
        error.statusCode = 404
        next(error)
    }),
)

app.use(globalErrorHandler)
export { app }
