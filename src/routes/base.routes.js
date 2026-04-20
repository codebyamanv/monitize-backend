import { Router } from 'express'

const baseRouter = Router()

baseRouter.get('/', (req, res) => {
    res.send('Server is running!')
})

export default baseRouter
