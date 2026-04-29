import { Router } from 'express'
import {
    allProfessionalBookings,
    allProfessionals,
    bookProfessional,
    professionalDetails,
    registerProfessional,
} from '../controllers/professional.controller.js'
import { accessController } from '../middlewares/authMiddleware.js'
import { multerUpload } from '../utils/multer.js'

const professionalRouter = Router()

// public routes
professionalRouter.get('/', allProfessionals)
professionalRouter.get('/professional-details/:id', professionalDetails)

// user only routes
professionalRouter.use(accessController('user'))
professionalRouter.post('/bookings', bookProfessional)
professionalRouter.get('/bookings', allProfessionalBookings)
professionalRouter.post(
    '/',
    multerUpload.fields([
        { name: 'professional_avatar', maxCount: 1 },
        { name: 'kyc_document', maxCount: 1 },
        { name: 'license_document', maxCount: 1 },
    ]),
    registerProfessional,
)

// admin only routes
// professionalRouter.use(accessController('admin'))

// admin and user routes
// professionalRouter.use(accessController('user', 'admin'))

export default professionalRouter
