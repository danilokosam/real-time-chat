import jwt from 'jsonwebtoken'
import config from '../config/config.js'

export const generateAccessToken = (payload) => {
    return jwt.sign(payload, config.jwtSecretAccess, { expiresIn: '15m' })
}

export const generateRefreshToken = (payload) => {
    return jwt.sign(payload, config.jwtSecretRefresh, { expiresIn: '7d' })
}