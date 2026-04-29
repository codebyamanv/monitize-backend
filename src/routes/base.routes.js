import { Router } from 'express'

const baseRouter = Router()

baseRouter.get('/', (req, res) => {
    res.send('Monitize Server Started...')
})

export default baseRouter
