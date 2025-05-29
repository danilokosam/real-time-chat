import cookie from "cookie"
import AppError from "./utils/appError.js"
import jwt from "jsonwebtoken"
import config from "./config/config.js"

const initializeSocket = (io) => {
    io.use((socket, next) => {
        const cookieString = socket.handshake.headers.cookie
        if (!cookieString) {
            return next(new AppError('El usuario no esta autenticado', 401))
        }
        const parsedCookies = cookie.parse(cookieString)
        const token = parsedCookies.accessToken
        if (!token) {
            return next(new AppError('El usuario no esta autenticado', 401))
        }
        try {
            const payload = jwt.verify(token, config.jwtSecretAccess)
            socket.user = payload
            next()
        } catch (err) {
            return next(new AppError('No se pudo autenticar el usuario', 401))
        }
    })
    
    const users = new Map()

    io.on('connection', (socket) => {
        console.log('Usuario conectado')
        users.set(socket.user.username, socket.id)
        console.log(users)

        socket.on('typing', () => {
            io.emit('typing', 'Alguien esta escribiendo')
        })
        socket.on('chatMessage', (msg) => {
            const date = new Date().toDateString()
            io.emit('chatMessage', { message: msg, date })
        })
        socket.on('disconnect', () => {
            console.log('Usuario desconectado')
        })    
    })
}

export default initializeSocket