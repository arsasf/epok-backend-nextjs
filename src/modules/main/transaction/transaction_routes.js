const express = require('express')
const Route = express.Router()
const transactionController = require('./transaction_controller')
const authMiddleware = require('../../../middleware/auth')

Route.post(
  '/transfer/:id',
  authMiddleware.authentication,
  transactionController.createTransferById
)
Route.get(
  '/all/:id',
  authMiddleware.authentication,
  transactionController.getAllTransferByIdFilter
)
Route.get(
  '/all/transaction/transaction-debit',
  authMiddleware.authentication,
  transactionController.getAllTransferDebit
)

Route.get(
  '/all/transaction/transaction-kredit',
  authMiddleware.authentication,
  transactionController.getAllTransferKredit
)

Route.get(
  '/all/transaction/sum-debit',
  authMiddleware.authentication,
  transactionController.getSumAllTransferDebit
)

Route.get(
  '/all/transaction/sum-kredit',
  authMiddleware.authentication,
  transactionController.getSumAllTransferKredit
)

module.exports = Route
