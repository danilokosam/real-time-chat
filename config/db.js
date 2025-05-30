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

        await pool.query(`CREATE TABLE IF NOT EXISTS Chats (
            id SERIAL PRIMARY KEY,
            name VARCHAR(50) NOT NULL,
            user1 INTEGER NOT NULL,
            user2 INTEGER NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user1) REFERENCES Users(id),
            FOREIGN KEY (user2) REFERENCES Users(id)
        )`)
        console.log('Se creo la tabla Chats')

        await pool.query(`
            DO $$
            BEGIN
                IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'estado_mensaje') THEN
                    CREATE TYPE estado_mensaje AS ENUM ('Enviado', 'Recibido', 'Leido');
                END IF;
            END$$;
        `)

        await pool.query(`CREATE TABLE IF NOT EXISTS Messages (
            id SERIAL PRIMARY KEY,
            chat_id INTEGER NOT NULL,
            message TEXT NOT NULL,
            state_message estado_mensaje NOT NULL DEFAULT 'Enviado',
            send_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            sender INTEGER NOT NULL,
            receiver INTEGER NOT NULL,
            FOREIGN KEY (chat_id) REFERENCES Chats(id),
            FOREIGN KEY (sender) REFERENCES Users(id),
            FOREIGN KEY (receiver) REFERENCES Users(id)
        )`)
        console.log('Se creo la tabla Messages')
    } catch (err) {
        throw new AppError('Algo fallo', 500)
    }
}