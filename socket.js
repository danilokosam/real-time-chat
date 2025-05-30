import cookie from "cookie"
import AppError from "./utils/appError.js"
import jwt from "jsonwebtoken"
import config from "./config/config.js"
import * as chatService from "./services/chatService.js"

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

    io.on('connection', async (socket) => {
        
        console.log('Usuario conectado')
        users.set(socket.user.username, socket.id)
        socket.emit('allChats', await chatService.getAllChats(socket.user.id))

        socket.on('typing', () => {
            io.emit('typing', 'Alguien esta escribiendo')
        })
        socket.on('joinChat', async (chatId, limit, offset) => {
            try {
                const chatExists = await chatService.verifyChatExists(chatId, socket.user.id)
                if (!chatExists) {
                    throw new AppError('El chat no existe', 404)
                }
                const messagesChat = await chatService.getMessagesChat(chatId, limit, offset)
                socket.emit('messagesChat', messagesChat)
            } catch (err) {
                socket.emit('error_message', {
                    message: err.message || 'Internal Server Error'
                })
            }
        })
        socket.on('createChat', async (data) => {
            try {
                const chatData = {
                    user1: socket.user.id,
                    user2: data.user2
                }
                const newChat = await chatService.createChat(chatData)
                socket.emit('createChat', newChat)
            } catch (err) {
                socket.emit('error_message', {
                    message: err.message || 'Internal Server Error'
                })
            }
        })
        socket.on('sendMessage', async (msg, chatId, usernameReceiver) => {
            try {
                const messageData = { 
                    message: msg, 
                    userId: socket.user.id, 
                    chatId, 
                    usernameReceiver 
                }
                const newMessage = await chatService.sendMessage(messageData)
                const socketIdReceiver = users.get(usernameReceiver)
                if (!socketIdReceiver) {
                    throw new AppError('El usuario no esta autenticado', 401)
                }
                const date = new Date()
                if (socket.connected) {
                    io.to(socketIdReceiver).emit('sendMessage', { message: msg, date, usernameReceiver, usernameSender: socket.user.username })
                }
            } catch (err) {
                socket.emit('error_message', {
                    message: err.message || 'Internal Server Error'
                })
            }
        })
        socket.on('allChats', async () => {
            socket.emit('allChats', await chatService.getAllChats(socket.user.id))
        })
        socket.on('disconnect', () => {
            console.log('Usuario desconectado')
            users.delete(socket.user.username)
        })    
    })
}

export default initializeSocket