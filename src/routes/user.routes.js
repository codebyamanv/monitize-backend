import { Router } from 'express'
import { register, login, logout, currentUser, changeAvatar, verifyEmail } from '../controllers/user.controller.js'
import { accessController } from '../middlewares/AuthMiddleware.js'
import { multerUpload } from '../utils/multer.js'

const userRouter = Router()
userRouter.route('/').post(register)
userRouter.route('/verify-email').patch(verifyEmail)
userRouter.get('/current-user', accessController('user', 'admin'), currentUser)
userRouter.post('/login', login)
userRouter.patch('/avatar', accessController('user', 'admin'), multerUpload.single('avatar'), changeAvatar)
userRouter.post('/logout', accessController('user', 'admin'), logout)
export default userRouter
