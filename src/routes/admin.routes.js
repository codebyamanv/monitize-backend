import { Router } from 'express'
import { accessController } from '../middlewares/AuthMiddleware.js'
import { multerUpload } from '../utils/multer.js'
import { allUsers } from '../controllers/admin.controller.js'

const adminRouter = Router()
adminRouter.get('/all-users', accessController('user', 'admin'), allUsers)

export default adminRouter
