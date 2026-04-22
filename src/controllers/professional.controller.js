import Professional from '../models/professional.model.js'
import User from '../models/user.model.js'
import ApiResponse from '../utils/apiResponse.js'
import asyncHandler from '../utils/asyncHandler.js'
import ErrorResponse from '../utils/errorResponse.js'
import { registerProfessionalValidator } from '../validators/professionalValidator.js'

export const registerProfessional = asyncHandler(async (req, res) => {
    const { success, data, error } = registerProfessionalValidator.safeParse(req.body)
    if (!success) {
        const zodError = JSON.parse(error)
            .map((err) => err.message)
            .join(', ')
        throw new ErrorResponse(zodError, 400, 'ValidationError')
    }
    const { specialization } = data
    const formattedSpecialization = specialization.split(',').map((spec) => spec.trim())
    const file = req.file
    const professional_avatar = file.path.replace(/\\/g, '/')

    const pro = await Professional.create({
        user: req.user._id,
        ...data,
        specialization: formattedSpecialization,
        professional_avatar,
    })

    await User.findOneAndUpdate(
        { _id: req.user._id },
        {
            professionalAccount: pro._id,
        },
        { new: true },
    )
    return ApiResponse.success({}, 'Professional registration request submitted successfully.').send(res)
})
