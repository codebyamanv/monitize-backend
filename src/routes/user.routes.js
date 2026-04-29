import { Router } from 'express'
import {
    register,
    login,
    logout,
    currentUser,
    changeAvatar,
    verifyEmail,
    emailVerificationAfterRegister,
    logoutFromAllSessions,
} from '../controllers/user.controller.js'
import { accessController } from '../middlewares/authMiddleware.js'
import { multerUpload } from '../utils/multer.js'

const userRouter = Router()

// public routes
userRouter.route('/').post(register)
userRouter.post('/login', login)
userRouter.post('/send-email-verification', emailVerificationAfterRegister)
userRouter.route('/verify-email').patch(verifyEmail)

// user only routes

// admin only routes

// admin and user routes
userRouter.use(accessController('user', 'admin'))
userRouter.get('/current-user', currentUser)
userRouter.patch('/avatar', multerUpload.single('avatar'), changeAvatar)
userRouter.post('/logout', logout)
userRouter.delete('/logout-all-sessions', logoutFromAllSessions)
export default userRouter
