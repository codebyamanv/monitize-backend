import { Router } from 'express'
import { addTestimonial, allTestimonials, deleteTestimonial } from '../controllers/testimonial.controller.js'
import { accessController } from '../middlewares/authMiddleware.js'
import { multerUpload } from '../utils/multer.js'

const testimonialRouter = Router()

// public routes
testimonialRouter.get('/', allTestimonials)
// admin only routes
testimonialRouter.use(accessController('admin'))
testimonialRouter.post('/', multerUpload.single('testimonial_image'), addTestimonial)
testimonialRouter.delete('/:id', deleteTestimonial)

export default testimonialRouter
