import config from "../config/config.js"
import AppError from "../utils/appError.js"
import jwt from "jsonwebtoken"

export const verifyToken = (req, res, next) => {
    const token = req.cookies.accessToken
    if (!token) {
        throw new AppError('El usuario esta inautenticado', 401)
    }
    try {
        const payload = jwt.verify(token, config.jwtSecretAccess)
        req.user = payload
        next()
    } catch (err) {
        next(err)
    }
}