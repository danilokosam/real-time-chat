import { generateAccessToken, generateRefreshToken } from '../utils/generateJwtTokens.js'
import * as jwt from 'jsonwebtoken'
import AppError from '../utils/appError.js'
import UserModel from '../models/User.js'
import * as bcrypt from 'bcrypt'
import { SECRET_REFRESH_TOKEN } from '../utils/constants.js'

export const login = async (username, password) => {
    const user = await UserModel.where({ username })
    if (!user) {
        throw new AppError('The user not found', 404)
    }
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
        throw new AppError('Incorrect Credentials', 401)
    }
    const accessToken = generateAccessToken({ id: user.userID, username: user.username })
    const refreshToken = generateRefreshToken({ id: user.userID, username: user.username })

    return { accessToken, refreshToken }
}

export const register = async (userData) => {
    const userAlreadyExists = await UserModel.where({ username: userData.username })
    if (userAlreadyExists) {
        throw new AppError('The user already exists', 404)
    }
    // Validate username
    if (
        userData.username.length < 3 ||
        userData.username.length > 20 ||
        !/^[a-zA-Z0-9 ]+$/.test(userData.username)
    ) {
        throw new AppError('Invalid Username', 400)
    }
    const newUserID = uuidv4();
    const newSessionToken = uuidv4();
    const hashPassword = await bcrypt.hash(userData.password, 10)
    const newUser = {
        ...userData,
        password: hashPassword,
        sessionToken: newSessionToken,
        userID: newUserID 
    }

    await UserModel.create(newUser)

    return { message: 'User created' }
}

export const logout = async (refreshToken) => {
    const user = await UserModel.where({ refreshToken })
    if (!user) {
        throw new AppError('Unhautorized', 401)
    }
    try {
        jwt.verify(refreshToken, SECRET_REFRESH_TOKEN)
    } catch (error) {
        throw new AppError('The JWT expired', 404)
    }
    await UserModel.findOneAndUpdate({ refreshToken }, null)
    return { message: 'Logout succesfully' }
}