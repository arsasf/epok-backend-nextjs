const helper = require('../helpers/wrapper')
const jwt = require('jsonwebtoken')

module.exports = {
  authentication: (req, res, next) => {
    // console.log('PROSES AUTHENTICATON MIDDLEWARE RUNNING')
    let token = req.headers.authorization
    console.log(token)
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
      console.log('false, token not found')
      return helper.response(res, 403, 'Please login first!')
    }
  },
  isUser: (req, res, next) => {
    if (JSON.stringify(req.decodeToken.user_id) === req.params.id) {
      console.log(`=====> Welcome User ${req.decodeToken.user_name} ! <=====`)
      next()
    } else {
      return helper.response(
        res,
        403,
        'Sorry, you can not access this account!'
      )
    }
  }
}
