import {
    baseRouter,
    userRouter,
    adminRouter,
    citiesRouter,
    professionalRouter,
    testimonialRouter,
} from '../helpers/routeHelper.js'

export const routes = [
    { path: '/', router: baseRouter },
    { path: '/api/v1/users', router: userRouter },
    { path: '/api/v1/admin', router: adminRouter },
    { path: '/api/v1/cities', router: citiesRouter },
    { path: '/api/v1/professionals', router: professionalRouter },
    { path: '/api/v1/testimonials', router: testimonialRouter },
]

export const origin = [
    'http://localhost:3000',
    'http://localhost:3001',
    'https://test.monitize.co',
    'https://admin.monitize.co',
]
