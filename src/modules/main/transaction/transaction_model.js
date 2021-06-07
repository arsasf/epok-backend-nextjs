const connection = require('../../../config/mysql')

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
  getAllTransferByIdFilter: (id, { filter }, limit) => {
    console.log(id, filter)
    return new Promise((resolve, reject) => {
      connection.query(
        `SELECT * FROM transaction JOIN user ON user.user_id = transaction.transaction_receiver_id WHERE transaction.transaction_sender_id = ? AND ${filter} LIMIT ? `,
        [id, limit],
        (error, result) => {
          !error ? resolve(result) : reject(new Error(error))
        }
      )
    })
  }
}
