const express = require('express')
const Route = express.Router()
const transactionController = require('./transaction_controller')
const authMiddleware = require('../../../middleware/auth')

Route.post(
  '/transfer/:id',
  authMiddleware.authentication,
  authMiddleware.isUser,
  transactionController.createTransferById
)
Route.get(
  '/all/:id',
  authMiddleware.authentication,
  authMiddleware.isUser,
  transactionController.getAllTransferByIdFilter
)

module.exports = Route
