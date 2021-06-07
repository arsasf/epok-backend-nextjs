const connection = require('../../../config/mysql')

module.exports = {
  getDataCount: (search, { sort }) => {
    console.log(search, { sort })
    return new Promise((resolve, reject) => {
      connection.query(
        `SELECT COUNT(*) AS total FROM user WHERE user_phone_number LIKE "%"?"%" ORDER BY ${sort}`,
        search,
        (error, result) => {
          !error ? resolve(result[0].total) : reject(new Error(error))
          // console.log(error)
        }
      )
    })
  },
  getDataAll: (search, { sort }, limit, offset) => {
    return new Promise((resolve, reject) => {
      connection.query(
        `SELECT * FROM user WHERE user_phone_number LIKE "%"?"%" ORDER BY ${sort} LIMIT ? OFFSET ?`,
        [search, limit, offset],
        (error, result) => {
          !error ? resolve(result) : reject(new Error(error))
        }
      )
    })
  },
  getUserById: (id) => {
    return new Promise((resolve, reject) => {
      connection.query(
        'SELECT * FROM user WHERE user_id = ?',
        id,
        (error, result) => {
          !error ? resolve(result) : reject(new Error(error))
        }
      )
    })
  },

  updateUser: (setData, id) => {
    console.log(id, setData)
    return new Promise((resolve, reject) => {
      connection.query(
        'UPDATE user SET ? WHERE user_id = ?',
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
