const helper = require('../../../helpers/wrapper')
const balanceModel = require('./balance_model')

module.exports = {
  getBalanceById: async (req, res) => {
    try {
      const { id } = req.params
      const result = await balanceModel.getBalanceById(id)
      if (result.length <= 0) {
        const setData = {
          user_id: id,
          balance: 100000
        }
        const result = await balanceModel.addBalanceById(setData)
        return helper.response(res, 200, 'success add first balance', result)
      } else {
        return helper.response(res, 200, 'success get balance by Id', result)
      }
    } catch (error) {
      console.log(error)
      return helper.response(res, 400, 'Bad Request', error)
    }
  },
  createBalanceById: async (req, res) => {
    try {
      const { id } = req.params
      let { balance } = req.body
      balance = balance || 0
      const result = await balanceModel.getBalanceById(id)
      balance = parseInt(balance)
      console.log(balance)
      if (result[0].user_id === id) {
        if (balance !== 0) {
          const setData = {
            user_id: id,
            balance: 100000
          }
          const resultBalance = await balanceModel.addBalanceById(setData)
          return helper.response(res, 200, 'success add balance', resultBalance)
        } else {
          return helper.response(
            res,
            404,
            'Please input saldo to add balance',
            []
          )
        }
      } else {
        return helper.response(
          res,
          400,
          'sorry you can not access, just for first member',
          []
        )
      }
    } catch (error) {
      console.log(error)
      return helper.response(res, 400, 'Bad Request', error)
    }
  },
  updateBalanceById: async (req, res) => {
    try {
      const { id } = req.params
      let { balance } = req.body
      balance = balance || 0
      const result = await balanceModel.getBalanceById(id)
      console.log(result)
      balance = parseInt(balance)
      if (result.length > 0) {
        const setData = {
          user_id: result[0].user_id,
          balance: result[0].balance + balance,
          balance_updated_at: new Date(Date.now())
        }
        const resultBalance = await balanceModel.updateBalanceById(setData, id)
        console.log('update balance receiver id', resultBalance)
        return helper.response(res, 200, 'success add balance', resultBalance)
      } else {
        return helper.response(res, 400, 'User Not found', [])
      }
    } catch (error) {
      console.log(error)
      return helper.response(res, 400, 'Bad Request', error)
    }
  }
}

// SELECT MONTH(transfer_created_at) AS month, SUM(transaction_amount) AS total from transaction JOIN balance ON balance.user_id = transaction.transaction_sender_id WHERE balance.user_id = 1 GROUP BY MONTH(transaction_created_at)
// SELECT MONTH(transaction_created_at) AS month, SUM(transaction_amount ) AS total from transaction JOIN balance ON balance.user_id = transaction.transaction_receiver_id WHERE balance.user_id = 1 GROUP BY MONTH(transaction_created_at)
