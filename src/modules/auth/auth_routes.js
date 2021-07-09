const express = require('express')
// const { isUser } = require('../../middleware/auth')
const Route = express.Router()

const { register, login, verify, logout } = require('./auth_controller')

Route.post('/login', login)
Route.post('/register', register)
Route.get('/verify/:hash', verify)
Route.patch('/logout/:id', logout)

module.exports = Route
