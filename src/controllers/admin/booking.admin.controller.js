import { Session, Professional, User, Booking } from '../../helpers/modelHelper.js'
import { ApiResponse, asyncHandler, ErrorResponse } from '../../helpers/handlersHelper.js'

export const allBooking = asyncHandler(async (req, res) => {
    const { limit = 10, page = 1 } = req.query
    const skip = (page - 1) * limit
    const [count, bookings] = await Promise.all([
        Booking.countDocuments({}),
        Booking.find({})
            .populate([
                { path: 'user', select: 'fullname email userType' },
                { path: 'professional', select: 'fullname city email license profession' },
            ])
            .skip(skip)
            .limit(Number(limit))
            .lean(),
    ])

    return ApiResponse.success({ count, bookings }).send(res)
})
