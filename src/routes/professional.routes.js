import { Router } from 'express'
import { registerProfessional } from '../controllers/professional.controller.js'
import { accessController } from '../middlewares/AuthMiddleware.js'
import { multerUpload } from '../utils/multer.js'

const professionalRouter = Router()

professionalRouter.post(
    '/',
    accessController('user', 'admin'),
    multerUpload.single('professional_avatar'),
    registerProfessional,
)

export default professionalRouter
