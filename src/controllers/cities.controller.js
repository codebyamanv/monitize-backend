import Cities from '../models/cities.model.js'
import asyncHandler from '../utils/asyncHandler.js'
import ApiResponse from '../utils/apiResponse.js'
export const getCities = asyncHandler(async (req, res) => {
    const cities = await Cities.find({ country_name: req.query.country }).select('name').lean()
    return ApiResponse.success(cities).send(res)
})
