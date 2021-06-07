const connection = require('../../../config/mysql')

module.exports = {
  getBalanceById: (id) => {
    return new Promise((resolve, reject) => {
      connection.query(
        'SELECT * FROM balance WHERE user_id = ?',
        id,
        (error, result) => {
          !error ? resolve(result) : reject(new Error(error))
        }
      )
    })
  },
  addBalanceById: (setData) => {
    console.log(setData)
    return new Promise((resolve, reject) => {
      connection.query(
        'INSERT INTO balance SET ?',
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
  updateBalanceById: (setData, id) => {
    console.log(setData, id)
    return new Promise((resolve, reject) => {
      connection.query(
        'UPDATE balance SET ? WHERE user_id = ?',
        [setData, id],
        (error, result) => {
          if (!error) {
            const newResult = {
              id: id,
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
  updateTransactionById: (setData, id) => {
    console.log(setData, id)
    return new Promise((resolve, reject) => {
      connection.query(
        'UPDATE transaction SET ? WHERE transaction_id = ?',
        [setData, id],
        (error, result) => {
          if (!error) {
            const newResult = {
              id: id,
              ...setData
            }
            resolve(newResult)
          } else {
            reject(new Error(error))
          }
        }
      )
    })
  }
}
