import { generateAccessToken, generateRefreshToken } from "../utils/generateTokens.js";
import { pool } from "../config/db.js";
import { hash, compare } from 'bcrypt'
import AppError from "../utils/appError.js";
import jwt from "jsonwebtoken";
import config from "../config/config.js";

export const register = async (userData) => {
    const userAlreadyExists = await pool.query('SELECT * FROM Users WHERE email = $1', [userData.email])
    if (userAlreadyExists.rows[0]) {
        throw new AppError('El usuario ya existe', 409)
    }
    const passwordEncrypt = await hash(userData.password, 10)
    const newUser = { ...userData }
    const result = await pool.query('INSERT INTO Users (username, email, password) VALUES ($1, $2, $3)', [newUser.username, newUser.email, passwordEncrypt])
    return { message: 'Registro exitoso' }
}

export const login = async (email, password) => {
    const user = await pool.query('SELECT * FROM Users WHERE email = $1', [email])
    const foundUser = user.rows[0]
    if (!foundUser) {
        throw new AppError('Credenciales incorrectas', 401)
    }
    const isMatch = await compare(password, foundUser.password)
    if (!isMatch) {
        throw new AppError('Credenciales incorrectas', 401)
    }
    const userPublic = { ...foundUser }
    delete userPublic.password
    delete userPublic.refresh_token

    const accessToken = generateAccessToken({ id: userPublic.id, username: userPublic.username })
    const refreshToken = generateRefreshToken({ id: userPublic.id, username: userPublic.username })

    await pool.query('UPDATE Users SET refresh_token = $1 WHERE id = $2', [refreshToken, userPublic.id])

    return { user: userPublic, accessToken, refreshToken }
}

export const logout = async (id) => {
    const userExists = await pool.query('SELECT * FROM Users WHERE id = $1', [id])
    const foundUser = userExists.rows[0]
    if (!foundUser) {
        throw new AppError('El usuario no esta autenticado', 401)
    }
    await pool.query('UPDATE Users SET refresh_token = null')
    return { message: 'Logout exitoso' }
}

export const refresh = async (refreshToken) => {
    try {
        const payload = jwt.verify(refreshToken, config.jwtSecretRefresh)
    } catch (err) {
        throw new AppError('Jwt ha expirado o no funciona', 401)
    }
    
    const user = await pool.query('SELECT * FROM Users WHERE refresh_token = $1', [refreshToken])
    const foundUser = user.rows[0]
    if (!foundUser) {
        throw new AppError('El usuario no esta autenticado', 401)
    }
    const accessToken = generateAccessToken({ id: foundUser.id, username: foundUser.username })
    const newRefreshToken = generateRefreshToken({ id: foundUser.id, username: foundUser.username })
    await pool.query('UPDATE Users SET refresh_token = $1 WHERE id = $2', [newRefreshToken, foundUser.id])
    return { accessToken, newRefreshToken }
}

export const getUser = async (id) => {
    const user = await pool.query('SELECT * FROM Users WHERE id = $1', [id])
    const foundUser = user.rows[0]
    if (!foundUser) {
        throw new AppError('El usuario no esta autenticado', 401)
    }
    delete foundUser.password
    delete foundUser.refresh_token

    return foundUser
}