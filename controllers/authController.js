import * as authService from '../services/authService.js';
import config from '../config/config.js';

export const register = async (req, res, next) => {
    try {
        const userData = req.body
        const result = await authService.register(userData)
        return res.json(result)
    } catch (err) {
        next(err)
    }
}

export const login = async (req, res, next) => {
    try {
        const { email, password } = req.body
        const { accessToken, refreshToken, user } = await authService.login(email, password)
        return res.cookie('accessToken', accessToken, {
            httpOnly: true,
            sameSite: 'strict',
            secure: config.environment === 'development' ? false : true,
            maxAge: 1000 * 60 * 15,
        }).cookie('refreshToken', refreshToken, {
            httpOnly: true,
            sameSite: 'strict',
            maxAge: 1000 * 60 * 60 * 24 * 7,
            secure: config.environment === 'development' ? false : true,
        }).status(201).json(user)
    } catch (err) {
        next(err)
    }
}

export const logout = async (req, res, next) => {
    try {
        const { id } = req.user
        const logout = await authService.logout(id)
        return res.clearCookie('accessToken').clearCookie('refreshToken').json(logout)
    } catch (err) {
        next(err)
    }
}

export const refresh = async (req, res, next) => {
    try {
        const refreshToken = req.cookies.refreshToken
        const { accessToken, newRefreshToken } = await authService.refresh(refreshToken)
        return res.cookie('accessToken', accessToken, {
            httpOnly: true,
            sameSite: 'strict',
            secure: config.environment === 'development' ? false : true,
            maxAge: 1000 * 60 * 15,
        }).cookie('refreshToken', newRefreshToken, {
            httpOnly: true,
            sameSite: 'strict',
            maxAge: 1000 * 60 * 60 * 24 * 7,
            secure: config.environment === 'development' ? false : true,
        }).json({ message: 'Se ha refrescado con exito' })
    } catch (err) {
        next(err)
    }
}