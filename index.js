import express from 'express'
import { Server } from 'socket.io'
import initializeSocket from './socket.js'
import http from 'node:http'
import config from './config/config.js'
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { connectDb } from './config/db.js'
import initializeRoutes from './routes/v1/index.js'
import { errorHandler } from './middlewares/errorHandler.js'
import AppError from './utils/appError.js'
import cookieParser from 'cookie-parser'
    
const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express()
const httpServer = http.createServer(app)
const io = new Server(httpServer, { 
    cors: { credentials: true }, 
    connectionStateRecovery: {} 
})

app.use(cookieParser())
app.use(express.json())
app.use(errorHandler)
initializeRoutes(app)

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/views/index.html')
})

app.use((req, res, next) => {
    next(new AppError('Ruta no encontrada', 404))
})

await connectDb()
initializeSocket(io)

httpServer.listen(config.port, () => {
    console.log(`Servidor corriendo en el puerto: ${config.port}`)
})