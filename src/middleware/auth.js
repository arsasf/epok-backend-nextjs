const helper = require('../helpers/wrapper')
const jwt = require('jsonwebtoken')

module.exports = {
  authentication: (req, res, next) => {
    // console.log('PROSES AUTHENTICATON MIDDLEWARE RUNNING')
    let token = req.headers.authorization
    if (token) {
      token = token.split(' ')[1]
      jwt.verify(token, 'RAHASIA', (error, result) => {
        if (
          (error && error.name === 'JsonWebTokenError') ||
          (error && error.name === 'TokenExpiredError')
        ) {
          return helper.response(res, 403, error.message)
        } else {
          req.decodeToken = result
          console.log('\nAunthentication is success')
          next()
        }
      })
    } else {
      return helper.response(res, 403, 'Please login first!')
    }
  },
  isUser: (req, res, next) => {
    let token = req.headers.authorization

    if (token) {
      token = token.split(' ')[1]
      jwt.verify(token, 'RAHASIA', (error, result) => {
        if (
          (error && error.name === 'JsonWebTokenError') ||
          (error && error.name === 'TokenExpiredError')
        ) {
          return helper.response(res, 403, error.message)
        } else {
          req.decodeToken = result
          if (req.decodeToken.user_id) {
            next()
          } else {
            return helper.response(res, 403, 'Youre not a user !')
          }
        }
      })
    } else {
      return helper.response(res, 403, 'Please login first !')
    }
  }
}
