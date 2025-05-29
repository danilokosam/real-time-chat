import express from 'express'
import authRouter from './authRouter.js'

const initializeRoutes = (app) => {
    const router = express.Router()
    app.use('/api/v1', router)
    router.use('/auth', authRouter)
}

export default initializeRoutes