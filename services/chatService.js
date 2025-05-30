import { pool } from "../config/db.js"
import AppError from "../utils/appError.js"

export const verifyChatExists = async (chatId, userId) => {
    const chat = await pool.query('SELECT * FROM Chats WHERE id = $1 AND (user1 = $2 OR user2 = $2)', [chatId, userId])
    const foundChat = chat.rows[0]
    if (!foundChat) {
        throw new AppError('El chat no existe', 404)
    }
    return foundChat
}

export const createChat = async (chatData) => {
    try {
        const user2Id = await pool.query(`SELECT * FROM Users WHERE username = $1`, [chatData.user2])
        if (!user2Id.rows[0]) {
            throw new AppError('El usuario no existe', 404)
        }
        const chat = await pool.query(`SELECT * FROM Chats WHERE (user1 = $1 OR user1 = $2) AND (user2 = $1 OR user2 = $2)`, [chatData.user1, user2Id.rows[0].id])
        if (chat.rows[0]) {
            throw new AppError('El chat ya existe', 409)
        }
        const newChat = await pool.query(`INSERT INTO Chats (name, user1, user2) VALUES ($1, $2, $3) RETURNING id`, [chatData.user2, chatData.user1, user2Id.rows[0].id])
        return { message: 'Chat creado correctamente', chatId: newChat.rows[0].id }
    } catch (err) {
        throw new AppError('El chat no se pudo crear', 500)
    }
}

export const sendMessage = async (data) => {
    try {
        const { message, userId, chatId, usernameReceiver } = data
        if (!message || message.length > 1000) {
            throw new AppError('El mensaje no es valido', 404)
        }
        const userReceiver = await pool.query(`SELECT id FROM Users WHERE username = $1`, [usernameReceiver])
        if (!userReceiver.rows[0]) {
            throw new AppError('El receptor no existe', 404);
        }
        const newMessage = await pool.query(`INSERT INTO Messages (chat_id, message, sender, receiver) VALUES ($1, $2, $3, $4)`, [chatId, message, userId, userReceiver.rows[0].id])
        return { message }
    } catch (err) {
        throw new AppError('No se pudo enviar el mensaje', 500)
    }
}

export const getAllChats = async (userId) => {
    try {
        const chats = await pool.query(`SELECT 
                c.id, 
                c.name, 
                c.user1, 
                c.user2,
                u1.username as user1_username,
                u2.username as user2_username
            FROM Chats c
            JOIN Users u1 ON c.user1 = u1.id
            JOIN Users u2 ON c.user2 = u2.id
            WHERE (c.user1 = $1 OR c.user2 = $1)`, [userId])
        if (chats.rows.length === 0) {
            return { message: 'No tienes chats actualmente' }
        }
        return chats.rows
    } catch (err) {
        throw new AppError('Hubo un error repentino', 500)
    }
}

export const getMessagesChat = async (chatId, limit, offset) => {
    const messagesChat = await pool.query(`
        SELECT m.*, u_sender.username as sender_username, u_receiver.username as receiver_username 
        FROM Messages m 
        JOIN Users u_sender ON m.sender = u_sender.id 
        JOIN Users u_receiver ON m.receiver = u_receiver.id 
        WHERE m.chat_id = $1 
        ORDER BY m.send_at ASC 
        LIMIT $2 OFFSET $3 `, [chatId, limit, offset])
    if (messagesChat.rows.length === 0) {
        return { message: 'Este chat no tiene mensajes' }
    }
    return messagesChat.rows
}