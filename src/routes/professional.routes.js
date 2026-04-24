import { Router } from 'express'
import { allProfessionals, professionalDetails, registerProfessional } from '../controllers/professional.controller.js'
import { accessController } from '../middlewares/AuthMiddleware.js'
import { multerUpload } from '../utils/multer.js'
import { allProfessionalsApplicants } from '../controllers/admin.controller.js'

const professionalRouter = Router()

professionalRouter.post(
    '/',
    accessController('user', 'admin'),
    multerUpload.fields([
        { name: 'professional_avatar', maxCount: 1 },
        { name: 'kyc_document', maxCount: 1 },
        { name: 'license_document', maxCount: 1 },
    ]),
    registerProfessional,
)
// allProfessionals.get
professionalRouter.get('/', allProfessionals)
professionalRouter.get('/professional-details/:id', professionalDetails)

export default professionalRouter
