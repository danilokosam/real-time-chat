import express from 'express'
import * as authController from '../../controllers/authController.js'
import { verifyToken } from '../../middlewares/authHandler.js'

const router = express.Router()

router.post('/register', authController.register)
router.post('/login', authController.login)
router.delete('/logout', verifyToken, authController.logout)
router.post('/refresh', authController.refresh)
router.get('/me', verifyToken, authController.me)

export default router