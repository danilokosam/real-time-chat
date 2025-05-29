import config from "../config/config.js"

class AppError extends Error {
    constructor(message, statusCode) {
        super(message)
        this.statusCode = statusCode
        this.name = this.constructor.name
        if (config.environment !== 'development') {
            this.stack = undefined
        }
    }
}

export default AppError