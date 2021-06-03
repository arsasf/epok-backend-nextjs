const express = require('express')
const Route = express.Router()
const userController = require('./user_controller')
const authMiddleware = require('../../../middleware/auth')
const {
  getUserByIdRedis,
  clearDataUserRedis
} = require('../../../middleware/redis')

Route.get(
  '/:id',
  authMiddleware.authentication,
  getUserByIdRedis,
  userController.getUserById
)
Route.patch(
  '/:id',
  authMiddleware.authentication,
  clearDataUserRedis,
  userController.updatePin
)

module.exports = Route
