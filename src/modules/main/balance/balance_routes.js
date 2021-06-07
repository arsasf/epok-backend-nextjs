const express = require('express')
const Route = express.Router()
const balanceController = require('./balance_controller')
const authMiddleware = require('../../../middleware/auth')

Route.get(
  '/:id',
  authMiddleware.authentication,
  authMiddleware.isUser,
  balanceController.getBalanceById
)
Route.post(
  '/:id',
  authMiddleware.authentication,
  authMiddleware.isUser,
  balanceController.createBalanceById
)
Route.patch(
  '/:id',
  authMiddleware.authentication,
  authMiddleware.isUser,
  balanceController.updateBalanceById
)

module.exports = Route
