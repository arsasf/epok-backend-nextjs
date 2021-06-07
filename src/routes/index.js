const express = require('express')
const Route = express.Router()
const authRouter = require('../modules/auth/auth_routes')
const userRouter = require('../modules/main/user/user_routes')
const transactionRouter = require('../modules/main/transaction/transaction_routes')
const balanceRouter = require('../modules/main/balance/balance_routes')

Route.use('/auth', authRouter)
Route.use('/user', userRouter)
Route.use('/balance', balanceRouter)
Route.use('/transaction', transactionRouter)

module.exports = Route
