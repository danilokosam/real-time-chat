import * as jwt from "jsonwebtoken"
import AppError from "../utils/appError.js"
import { SECRET_ACCESS_TOKEN } from "../utils/constants"

export const authHandler = (req, res, next) => {
    const accessToken = req.cookies?.accessToken
    if (!accessToken) {
        throw new AppError("Unhautorized", 401)
    }
    try {
        const payload = jwt.verify(accessToken, SECRET_ACCESS_TOKEN)
        req.user = payload
        next()
    } catch (err) {
        next(err)
    }
}