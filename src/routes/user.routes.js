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
import { accessController } from '../middlewares/AuthMiddleware.js'
import { multerUpload } from '../utils/multer.js'

const userRouter = Router()
userRouter.route('/').post(register)
userRouter.route('/verify-email').patch(verifyEmail)
userRouter.get('/current-user', accessController('user', 'admin'), currentUser)
userRouter.post('/login', login)
userRouter.patch('/avatar', accessController('user', 'admin'), multerUpload.single('avatar'), changeAvatar)
userRouter.post('/send-email-verification', emailVerificationAfterRegister)
userRouter.post('/logout', accessController('user', 'admin'), logout)
userRouter.delete('/logout-all-sessions', accessController('user', 'admin'), logoutFromAllSessions)
export default userRouter
