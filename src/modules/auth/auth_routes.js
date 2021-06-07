const express = require('express')
// const { isUser } = require('../../middleware/auth')
const Route = express.Router()

const { register, login } = require('./auth_controller')

Route.post('/login', login)
Route.post('/register', register)

module.exports = Route
