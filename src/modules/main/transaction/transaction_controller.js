const helper = require('../../../helpers/wrapper')
const transactionModel = require('./transaction_model')
const userModel = require('../user/user_model')
const balanceModel = require('../balance/balance_model')

module.exports = {
  createTransferById: async (req, res) => {
    try {
      const { id } = req.params
      const { transactionReceiverId, transactionNote } = req.body
      let { transactionAmount, userPin, transactionType } = req.body
      const checkPinSenderId = await userModel.getUserById(id)
      userPin = parseInt(userPin)
      transactionAmount = parseInt(transactionAmount)
      transactionType = transactionType.toLowerCase()
      const balanceSenderId = await balanceModel.getBalanceById(id)
      const balanceReceiverId = await balanceModel.getBalanceById(
        transactionReceiverId
      )
      if (balanceSenderId[0].balance >= transactionAmount) {
        if (userPin === checkPinSenderId[0].user_pin) {
          if (transactionType === 'transfer') {
            const setDataTransactionSender = {
              transaction_sender_id: id,
              transaction_receiver_id: transactionReceiverId,
              transaction_debit: 0,
              transaction_kredit: transactionAmount,
              transaction_saldo: balanceSenderId[0].balance - transactionAmount,
              transaction_note: transactionNote,
              transaction_type: transactionType,
              transaction_status: '1'
            }
            const setDataTransactionReceiver = {
              transaction_sender_id: id,
              transaction_receiver_id: transactionReceiverId,
              transaction_debit: transactionAmount,
              transaction_kredit: 0,
              transaction_saldo:
                balanceReceiverId[0].balance + transactionAmount,
              transaction_note: transactionNote,
              transaction_type: transactionType,
              transaction_status: '1'
            }
            const setDataBalanceSender = {
              user_id: id,
              balance: setDataTransactionSender.transaction_saldo,
              balance_updated_at: new Date(Date.now())
            }
            const setDataBalanceReceiver = {
              user_id: transactionReceiverId,
              balance: setDataTransactionReceiver.transaction_saldo,
              balance_updated_at: new Date(Date.now())
            }
            await balanceModel.updateBalanceById(setDataBalanceSender, id)
            await balanceModel.updateBalanceById(
              setDataBalanceReceiver,
              transactionReceiverId
            )
            await transactionModel.addTransactionById(
              setDataTransactionReceiver
            )
            const result = await transactionModel.addTransactionById(
              setDataTransactionSender
            )
            console.log(result)
            return helper.response(res, 200, 'Transfer is success!', result)
          } else {
            const setDataTransactionSender = {
              transaction_sender_id: transactionReceiverId,
              transaction_receiver_id: id,
              transaction_debit: transactionAmount,
              transaction_kredit: 0,
              transaction_saldo: balanceSenderId[0].balance + transactionAmount,
              transaction_note: transactionNote,
              transaction_type: transactionType,
              transaction_status: '1'
            }
            const setDataBalanceSender = {
              user_id: id,
              balance: setDataTransactionSender.transaction_saldo,
              balance_updated_at: new Date(Date.now())
            }
            await balanceModel.updateBalanceById(setDataBalanceSender, id)
            const topup = await transactionModel.addTransactionById(
              setDataTransactionSender
            )
            console.log(topup)
            const dataPayment = {
              orderId: topup.id,
              orderAmount: topup.transaction_debit
            }
            const result = await transactionModel.postOrderMidtrans(dataPayment)
            return helper.response(res, 200, 'Please clik Continue', {
              redirectUrl: result
            })
          }
        } else {
          return helper.response(
            res,
            400,
            'Transfer was failed, Pin Not Match, Please Input Again!'
          )
        }
      } else {
        return helper.response(
          res,
          400,
          'Transfer was failed, Saldo not enough !'
        )
      }
    } catch (error) {
      console.log(error)
      return helper.response(res, 408, 'Bad Request', error)
    }
  },
  getAllTransferByIdFilter: async (req, res) => {
    try {
      const { id } = req.params
      const result = await transactionModel.getAllTransferByIdFilter(id)
      console.log(result)
      return helper.response(res, 200, 'Get data transfer by Id Filter', result)
    } catch (error) {
      console.log(error)
      return helper.response(res, 408, 'Bad Request', error)
    }
  },
  getAllTransferDebit: async (req, res) => {
    try {
      const id = req.decodeToken.user_id
      const days = [0, 1, 2, 3, 4, 5, 6]

      const totalPerDay = []
      for (const day of days) {
        const result = await transactionModel.getAllTransferDebit(day, id)
        totalPerDay.push(result)
      }
      return helper.response(
        res,
        200,
        'Success get data transfer debit by week',
        totalPerDay
      )
    } catch (error) {
      console.log(error)
      return helper.response(res, 408, 'Bad Request', error)
    }
  },
  getAllTransferKredit: async (req, res) => {
    try {
      const id = req.decodeToken.user_id
      const days = [0, 1, 2, 3, 4, 5, 6]

      const totalPerDay = []
      for (const day of days) {
        const result = await transactionModel.getAllTransferKredit(day, id)
        totalPerDay.push(result)
      }
      return helper.response(
        res,
        200,
        'Success get data transfer kredit by week',
        totalPerDay
      )
    } catch (error) {
      console.log(error)
      return helper.response(res, 408, 'Bad Request', error)
    }
  },
  getSumAllTransferDebit: async (req, res) => {
    try {
      const id = req.decodeToken.user_id

      const result = await transactionModel.getAllTransferDebitByWeek(id)
      return helper.response(
        res,
        200,
        'Success get data Sum transfer Debit by week',
        result
      )
    } catch (error) {
      console.log(error)
      return helper.response(res, 408, 'Bad Request', error)
    }
  },
  getSumAllTransferKredit: async (req, res) => {
    try {
      const id = req.decodeToken.user_id

      const result = await transactionModel.getAllTransferKreditByWeek(id)
      return helper.response(
        res,
        200,
        'Success get data Sum transfer Kredit by week',
        result
      )
    } catch (error) {
      console.log(error)
      return helper.response(res, 408, 'Bad Request', error)
    }
  },
  getAllTransaction: async (req, res) => {
    try {
      const result = await transactionModel.getDataAllTransaction()
      return helper.response(
        res,
        200,
        'Success get data Sum transfer Kredit by week',
        result
      )
    } catch (error) {
      console.log(error)
      return helper.response(res, 408, 'Bad Request', error)
    }
  }
}

// SELECT MONTH(transfer_created_at) AS month, SUM(transaction_amount) AS total from transaction JOIN balance ON balance.user_id = transaction.transaction_sender_id WHERE balance.user_id = 1 GROUP BY MONTH(transaction_created_at)
// SELECT MONTH(transaction_created_at) AS month, SUM(transaction_amount ) AS total from transaction JOIN balance ON balance.user_id = transaction.transaction_receiver_id WHERE balance.user_id = 1 GROUP BY MONTH(transaction_created_at)
