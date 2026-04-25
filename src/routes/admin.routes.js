import { Router } from 'express'
import { accessController } from '../middlewares/AuthMiddleware.js'
import { multerUpload } from '../utils/multer.js'
import {
    adminLogin,
    allProfessionalsApplicants,
    allUsers,
    changeEmailVerifyStatus,
    changeUserRole,
    currentAdmin,
    logoutAdmin,
    removeUserSession,
    updateProfessionalStatus,
} from '../controllers/admin.controller.js'

const adminRouter = Router()
adminRouter.post('/login', adminLogin)
adminRouter.get('/current-admin', accessController('user', 'admin'), currentAdmin)
adminRouter.post('/logout', accessController('user', 'admin'), logoutAdmin)
adminRouter.get('/all-users', accessController('user', 'admin'), allUsers)

// for admin panel only

adminRouter.patch('/change-user-role', accessController('admin'), changeUserRole)

adminRouter.get('/professionals', accessController('user', 'admin'), allProfessionalsApplicants)
adminRouter.patch('/update-professional-status', accessController('admin'), updateProfessionalStatus)
adminRouter.patch('/update-email-verify-status', accessController('admin'), changeEmailVerifyStatus)

adminRouter.delete('/user-sessions/:id', accessController('admin'), removeUserSession)

export default adminRouter
