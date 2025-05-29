import { Pool } from 'pg'
import config from './config.js'
import AppError from '../utils/appError.js'

export const pool = new Pool({
    connectionString: config.dbUrl,
    maxUses: 10,
    ssl: {
        rejectUnauthorized: false
    }
})

pool.on('error', (err) => {
    throw new AppError('No se pudo conectar la base de datos', 503)
})

export const connectDb = async () => {
    await pool.connect()
    console.log('La base de datos se conecto conrrectamente')
    try {
        await pool.query(`CREATE TABLE IF NOT EXISTS Users (
            id SERIAL PRIMARY KEY,
            username VARCHAR(50) NOT NULL,
            email VARCHAR(100) NOT NULL UNIQUE,
            password VARCHAR(255) NOT NULL,
            refresh_token TEXT
        )`)
        console.log('Se creo la tabla Users')
    } catch (err) {
        throw new AppError('Algo fallo', 500)
    }
}