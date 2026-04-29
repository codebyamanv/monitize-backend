import { Router } from 'express'
import { accessController } from '../middlewares/authMiddleware.js'
import { multerUpload } from '../utils/multer.js'

import { adminLogin, currentAdmin, logoutAdmin } from '../controllers/admin/auth.admin.controller.js'
import {
    allUsers,
    changeEmailVerifyStatus,
    changeUserRole,
    removeUserSession,
} from '../controllers/admin/user.admin.controller.js'
import {
    allProfessionalsApplicants,
    updateProfessionalStatus,
} from '../controllers/admin/professional.admin.controller.js'
import { allBooking } from '../controllers/admin/booking.admin.controller.js'

const adminRouter = Router()

// public routes
adminRouter.post('/login', adminLogin)

// admin only routes
adminRouter.use(accessController('admin'))
adminRouter.patch('/update-email-verify-status', changeEmailVerifyStatus)
adminRouter.delete('/user-sessions/:id', removeUserSession)
adminRouter.patch('/update-professional-status', updateProfessionalStatus)
adminRouter.patch('/change-user-role', changeUserRole)
adminRouter.get('/current-admin', currentAdmin)
adminRouter.post('/logout', logoutAdmin)
adminRouter.get('/all-users', allUsers)
adminRouter.get('/professionals', allProfessionalsApplicants)
adminRouter.get('/bookings', allBooking)

export default adminRouter
