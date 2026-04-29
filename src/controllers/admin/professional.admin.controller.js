import { Professional, User } from '../../helpers/modelHelper.js'
import { ApiResponse, asyncHandler, ErrorResponse } from '../../helpers/handlersHelper.js'

export const allProfessionalsApplicants = asyncHandler(async (req, res) => {
    const { limit = 10, page = 1, q } = req.query
    const filter = {}
    if (q) {
        filter.$or = [
            { fullname: { $regex: q, $options: 'i' } },
            { email: { $regex: q, $options: 'i' } },
            { license: { $regex: q, $options: 'i' } },
            { city: { $regex: q, $options: 'i' } },
        ]
    }
    const totalDocs = await Professional.countDocuments(filter)
    const totalPages = Math.ceil(totalDocs / limit)
    const skip = (page - 1) * limit
    const professionals = await Professional.find(filter).skip(skip).limit(limit).lean()
    return ApiResponse.success(
        { professionals, count: totalDocs, totalPages },
        'All Professional Applicants Fetched',
    ).send(res)
})
// for admin only - approve or reject
export const updateProfessionalStatus = asyncHandler(async (req, res) => {
    const { id, action } = req.query

    if (!['approve', 'reject'].includes(action)) {
        throw new ErrorResponse('Invalid action. Must be either "approve" or "reject".', 400, 'InvalidActionError')
    }

    const professional = await Professional.findById(id)
    if (!professional) {
        throw new ErrorResponse('Professional applicant not found.', 404, 'NotFoundError')
    }

    professional.status = action === 'approve' ? 'approved' : 'rejected'
    if (action === 'approve') {
        await User.findByIdAndUpdate(professional.user, { userType: 'professional' })
    }
    await professional.save()

    return ApiResponse.success(
        {},
        `Professional applicant ${action === 'approve' ? 'approved' : 'rejected'} successfully.`,
    ).send(res)
})
