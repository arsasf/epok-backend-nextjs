const connection = require('../../config/mysql')

module.exports = {
  register: (data) => {
    return new Promise((resolve, reject) => {
      connection.query('INSERT INTO user SET?', data, (error, result) => {
        console.log(error)
        if (!error) {
          const newResult = {
            id: result.insertId,
            ...data
          }
          resolve(newResult)
        } else {
          reject(new Error(error))
        }
      })
    })
  },

  getDataConditions: (data) => {
    console.log(data)
    return new Promise((resolve, reject) => {
      connection.query(
        'SELECT * FROM user WHERE user_email = ?',
        data,
        (error, result) => {
          console.log(error)
          !error ? resolve(result) : reject(new Error(error))
        }
      )
    })
  },

  getDataUser: (userEmail) => {
    return new Promise((resolve, reject) => {
      connection.query(
        'SELECT user.user_email FROM user where user_email = ?',
        userEmail,
        (error, result) => {
          !error ? resolve(result) : reject(new Error(error))
        }
      )
    })
  },
  verifyRegister: (hash) => {
    return new Promise((resolve, reject) => {
      connection.query(
        'UPDATE user set user_status = "1" where user_status = "0" AND user_id = ?',
        hash,
        (error, result) => {
          if (!error) {
            const newResult = {
              id: hash
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
