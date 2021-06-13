const express = require('express')
// const { isUser } = require('../../middleware/auth')
const Route = express.Router()

const { register, login, verify } = require('./auth_controller')

Route.post('/login', login)
Route.post('/register', register)
Route.get('/verify/:hash', verify)

module.exports = Route
