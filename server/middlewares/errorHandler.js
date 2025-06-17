import AppError from "../utils/appError.js"

export const errorHandler = (err, req, res, next) => {
    if (err instanceof AppError) {
        return res.status(err.statusCode).json({ message: err.message })
    }
    return res.status(500).json({ message: 'Internal Server Error' })
}