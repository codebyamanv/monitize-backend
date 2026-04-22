import { Router } from 'express'
import { getCities } from '../controllers/cities.controller.js'

const citiesRouter = Router()
citiesRouter.get('/', getCities)
export default citiesRouter
