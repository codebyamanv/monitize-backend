import { Cities } from '../helpers/modelHelper.js'
import { ApiResponse, asyncHandler } from '../helpers/handlersHelper.js'
export const getCities = asyncHandler(async (req, res) => {
    const cities = await Cities.find({ country_name: req.query.country }).select('name').lean()
    return ApiResponse.success(cities).send(res)
})
