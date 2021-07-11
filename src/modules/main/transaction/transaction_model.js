const connection = require('../../../config/mysql')
const midtransClient = require('midtrans-client')

module.exports = {
  addTransactionById: (setData) => {
    console.log(setData)
    return new Promise((resolve, reject) => {
      connection.query(
        'INSERT INTO transaction SET ?',
        setData,
        (error, result) => {
          // !error ? resolve({id: result.inserId, ...setData}) : reject(new Error(error))
          if (!error) {
            const newResult = {
              id: result.insertId,
              ...setData
            }
            resolve(newResult)
          } else {
            reject(new Error(error))
          }
        }
      )
    })
  },
  getDataAllTransaction: () => {
    return new Promise((resolve, reject) => {
      connection.query('SELECT * FROM transaction', (error, result) => {
        !error ? resolve(result) : reject(new Error(error))
        // console.log(error)
      })
    })
  },
  getDataCount: (id, { filter }) => {
    console.log(id, { filter })
    return new Promise((resolve, reject) => {
      connection.query(
        `SELECT COUNT(*) AS total FROM transaction JOIN user ON user.user_id = transaction.transaction_receiver_id WHERE transaction.transaction_sender_id = ? AND ${filter} `,
        id,
        (error, result) => {
          !error ? resolve(result[0].total) : reject(new Error(error))
          // console.log(error)
        }
      )
    })
  },
  getAllTransferByIdFilter: (id) => {
    return new Promise((resolve, reject) => {
      connection.query(
        `SELECT * FROM transaction JOIN user ON user.user_id = transaction.transaction_receiver_id WHERE transaction.transaction_sender_id = ${id} OR transaction.transaction_receiver_id = ${id} ORDER BY transaction.transaction_id DESC`,
        (error, result) => {
          !error ? resolve(result) : reject(new Error(error))
        }
      )
    })
  },
  getAllTransferDebit: (day, id) => {
    return new Promise((resolve, reject) => {
      connection.query(
        `SELECT SUM(transaction_debit) AS total, WEEKDAY(transaction_created_at) AS day FROM transaction WHERE WEEK(transaction_created_at) = WEEK(now()) AND WEEKDAY(transaction_created_at) = ${day} AND transaction_receiver_id = ${id}`,
        (error, result) => {
          console.log(result)
          !error ? resolve(result) : reject(new Error(error))
        }
      )
    })
  },
  getAllTransferKredit: (day, id) => {
    return new Promise((resolve, reject) => {
      connection.query(
        `SELECT SUM(transaction_kredit) AS total, WEEKDAY(transaction_created_at) AS day FROM transaction WHERE WEEK(transaction_created_at) = WEEK(now()) AND WEEKDAY(transaction_created_at) = ${day} AND transaction_sender_id = ${id}  `,
        (error, result) => {
          console.log(result)
          !error ? resolve(result) : reject(new Error(error))
        }
      )
    })
  },
  getAllTransferDebitByWeek: (id) => {
    return new Promise((resolve, reject) => {
      connection.query(
        `SELECT SUM(transaction_debit) AS total FROM transaction WHERE WEEK(transaction_created_at) = WEEK(now()) AND  transaction_receiver_id = ${id}`,
        (error, result) => {
          !error ? resolve(result) : reject(new Error(error))
        }
      )
    })
  },
  getAllTransferKreditByWeek: (id) => {
    return new Promise((resolve, reject) => {
      connection.query(
        `SELECT SUM(transaction_kredit) AS total FROM transaction WHERE WEEK(transaction_created_at) = WEEK(now()) AND transaction_sender_id = ${id} `,
        (error, result) => {
          !error ? resolve(result) : reject(new Error(error))
        }
      )
    })
  },
  postOrderMidtrans: ({ orderId, orderAmount }) => {
    return new Promise((resolve, reject) => {
      const snap = new midtransClient.Snap({
        isProduction: false,
        serverKey: 'SB-Mid-server-cQ2SdW4dl4T4ETGWBbXzM6BS',
        clientKey: 'SB-Mid-client-Br8qu0hv-PGs4oyU'
      })
      const parameter = {
        transaction_details: {
          order_id: orderId,
          gross_amount: orderAmount
        },
        credit_card: {
          secure: true
        }
      }
      snap
        .createTransaction(parameter)
        .then((transaction) => {
          // transaction token
          const transactionToken = transaction.token
          console.log('transaction:', transaction)
          console.log('transactionToken:', transactionToken)
          resolve(transaction.redirect_url)
        })
        .catch((error) => {
          console.log(error)
          reject(error)
        })
    })
  }
}
