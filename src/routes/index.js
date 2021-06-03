const express = require('express')
const Route = express.Router()
const authRouter = require('../modules/auth/auth_routes')
const userRouter = require('../modules/main/user/user_routes')

Route.use('/auth', authRouter)
Route.use('/user', userRouter)

module.exports = Route
