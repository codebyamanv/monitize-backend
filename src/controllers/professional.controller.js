import fs from 'node:fs/promises'
import { Professional, User, Booking } from '../helpers/modelHelper.js'
import { ApiResponse, asyncHandler, ErrorResponse } from '../helpers/handlersHelper.js'
import { registerProfessionalValidator } from '../validators/professionalValidator.js'

export const registerProfessional = asyncHandler(async (req, res) => {
    // Extract files safely
    const files = req.files || {}

    const kycPath = files.kyc_document?.[0]?.path
    const licensePath = files.license_document?.[0]?.path
    const avatarPath = files.professional_avatar?.[0]?.path

    // 🔁 Helper to cleanup uploaded files
    const cleanupFiles = async () => {
        const paths = [kycPath, licensePath, avatarPath]
        await Promise.all(
            paths.map((p) =>
                fs.unlink(p).catch((e) => {
                    console.log(e)
                }),
            ),
        )
    }

    // 🚫 Role validation (fail fast)
    if (req.user.role === 'professional') {
        await cleanupFiles()
        throw new ErrorResponse('You already have a professional account', 400, 'InvalidRequestError')
    }

    if (req.user.role === 'admin') {
        await cleanupFiles()
        throw new ErrorResponse('Admin cannot register as a professional', 400, 'InvalidRequestError')
    }

    // 📂 File validation
    if (!kycPath || !licensePath || !avatarPath) {
        await cleanupFiles()
        throw new ErrorResponse('All documents (KYC, License, Avatar) are required', 400, 'InvalidRequestError')
    }

    // 🧪 Body validation
    const result = registerProfessionalValidator.safeParse(req.body)

    if (!result.success) {
        await cleanupFiles()
        const zodError = result.error.errors.map((err) => err.message).join(', ')
        throw new ErrorResponse(zodError, 400, 'ValidationError')
    }

    const data = result.data

    // check if user already registered as pro with same email or license
    const existingProAccount = await Professional.findOne({ $or: [{ email: data.email }, { license: data.license }] })
    if (existingProAccount) {
        await cleanupFiles()
        throw new ErrorResponse('Email or License already registered', 400)
    }

    const formattedSpecialization = data.specialization.split(',').map((s) => s.trim())

    // 💾 Create professional
    const pro = await Professional.create({
        user: req.user._id,
        ...data,
        specialization: formattedSpecialization,
        professional_avatar: avatarPath.replace(/\\/g, '/'),
        license_document: licensePath.replace(/\\/g, '/'),
        kyc_document: kycPath.replace(/\\/g, '/'),
    })

    // 🔗 Link to user
    await User.findByIdAndUpdate(req.user._id, {
        professionalAccount: pro._id,
    })

    return ApiResponse.success({}, 'Professional registration request submitted successfully.').send(res)
})

export const allProfessionals = asyncHandler(async (req, res) => {
    const { limit = 10, page = 1, q } = req.query
    const filter = {}
    if (q) {
        filter.$or = [{ fullname: { $regex: q, $options: 'i' } }]
    }
    const totalDocs = await Professional.countDocuments(filter)
    const totalPages = Math.ceil(totalDocs / limit)
    const skip = (page - 1) * limit

    const professionals = await Professional.find({ status: 'approved', ...filter })
        .skip(skip)
        .limit(limit)
        .select('fullname bio professional_avatar profession specialization city')
        .lean()
    return ApiResponse.success({ professionals, totalPages, totalDocs }, 'All Professionals Fetched').send(res)
})

export const professionalDetails = asyncHandler(async (req, res) => {
    const professional = await Professional.findById(req.params.id)
        .select('fullname bio professional_avatar profession specialization city license experience createdAt')
        .lean()
    const visiblePart = professional.license.slice(-3)
    const maskedPart = '*'.repeat(professional.license.length - 3)
    professional.license = maskedPart + visiblePart
    return ApiResponse.success(professional, 'Professional Details Fetched').send(res)
})

export const bookProfessional = asyncHandler(async (req, res) => {
    const { professionalId } = req.body
    const professional = await Professional.findById(professionalId).select('_id').lean()
    if (!professional) {
        throw new ErrorResponse('Professional not found', 404, 'ProfessionalNotFoundError')
    }
    const result = await Booking.create({ ...req.body, professional: req.body.professionalId, user: req.user._id })

    return ApiResponse.success(professional, 'Booking Successful. Professional will contact you soon').send(res)
})

export const allProfessionalBookings = asyncHandler(async (req, res) => {
    const { limit = 10, page = 1, q } = req.query
    const filter = {}
    if (q) {
        filter.$or = [{ fullname: { $regex: q, $options: 'i' } }]
    }
    const totalDocs = await Booking.countDocuments({ ...filter, professional: req.user.professionalAccount })
    const totalPages = Math.ceil(totalDocs / limit)
    const skip = (page - 1) * limit
    const bookings = await Booking.find({ ...filter, professional: req.user.professionalAccount })
        .skip(skip)
        .limit(limit)
        .select('')
        .lean()
    return ApiResponse.success({ bookings, totalPages, totalDocs }, 'All Bookings Fetched').send(res)
})
