import fs from 'node:fs/promises'
import path from 'node:path'
import { Testimonial } from '../helpers/modelHelper.js'
import { ApiResponse, asyncHandler, ErrorResponse } from '../helpers/handlersHelper.js'

export const addTestimonial = asyncHandler(async (req, res) => {
    const file = req.file
    const avatar = file.path.replace(/\\/g, '/')
    await Testimonial.create({ ...req.body, avatar })
    return ApiResponse.success({}, 'Testimonial added successfully').send(res)
})

export const allTestimonials = asyncHandler(async (req, res) => {
    const count = await Testimonial.countDocuments()
    const testimonials = await Testimonial.find().lean()
    return ApiResponse.success({ testimonials, count }).send(res)
})

export const deleteTestimonial = asyncHandler(async (req, res) => {
    const { id } = req.params
    const result = await Testimonial.findByIdAndDelete(id)
    if (!result) {
        throw new ErrorResponse('Testimonial not found', 404, 'TestimonialNotFoundError')
    }
    const imagePath = path.join(process.cwd(), result.avatar)
    try {
        await fs.unlink(imagePath)
    } catch (err) {
        console.error('Error deleting avatar:', err.message)
    }
    return ApiResponse.success({}, 'Testimonial deleted successfully').send(res)
})
