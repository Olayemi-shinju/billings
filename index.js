import express from 'express'
import dotenv from 'dotenv'
import cookieParse from 'cookie-parser'
import { connectDB } from './db/connectDB.js'
const PORT = process.env.PORT || 5000
const CLIENT_URL = process.env.CLIENT_URL
import authROute from './routes/auth.route.js'
import cors from 'cors'
const app = express();
dotenv.config();
app.use(express.json());
app.use(cookieParse());
connectDB()
app.use(express.json())
// app.use(cors())

const corOpt = {
    origin: CLIENT_URL || ['http://localhost:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
}

// const corOpt = {
//     origin: process.env.CLIENT_URL || ['http://localhost:3000'],
//     methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
// }


app.use(cors(corOpt))

app.use('/api/v1', authROute)
app.listen(PORT, ()=>console.log(`Server running on port ${PORT}`))