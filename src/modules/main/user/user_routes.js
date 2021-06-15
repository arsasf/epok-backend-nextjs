const express = require('express')
const Route = express.Router()
const userController = require('./user_controller')
const authMiddleware = require('../../../middleware/auth')
const {
  getUserByIdRedis,
  clearDataUserRedis
} = require('../../../middleware/redis')
const uploadFile = require('../../../middleware/uploads')

Route.get(
  '/',
  authMiddleware.authentication,
  getUserByIdRedis,
  userController.getAllUser
)
Route.get(
  '/:id',
  authMiddleware.authentication,
  getUserByIdRedis,
  userController.getUserById
)
Route.patch('/update-pin/:id', clearDataUserRedis, userController.updatePin)
Route.patch(
  '/update/password/:id',
  authMiddleware.authentication,
  clearDataUserRedis,
  userController.updatePasswordUser
)
Route.patch(
  '/update/profile/user/:id',
  authMiddleware.authentication,
  clearDataUserRedis,
  userController.updateProfileUser
)
Route.patch(
  '/update/profile/user/image/:id',
  authMiddleware.authentication,
  uploadFile,
  clearDataUserRedis,
  userController.updateImageUser
)
Route.patch(
  '/delete/profile/user/image-profile/:id',
  authMiddleware.authentication,
  uploadFile,
  clearDataUserRedis,
  userController.deleteImageUser
)
module.exports = Route
