const helper = require('../../helpers/wrapper')
const bcrypt = require('bcrypt')
const authModel = require('./auth_model')
const jwt = require('jsonwebtoken')

module.exports = {
  register: async (req, res) => {
    console.log('register running')
    console.log(req.body)
    try {
      const { userName, userEmail, userPassword } = req.body
      const salt = bcrypt.genSaltSync(10)
      const encryptPassword = bcrypt.hashSync(userPassword, salt)
      console.log(`Before encrypt = ${userPassword}`)
      console.log(`after encrypt = ${encryptPassword}`)
      const checkEmailUser = await authModel.getDataUser(userEmail)
      console.log(checkEmailUser)
      if (checkEmailUser.length === 0) {
        const setData = {
          user_name: userName,
          user_email: userEmail,
          user_password: encryptPassword
        }
        const result = await authModel.register(setData)
        delete result.user_password
        return helper.response(res, 200, 'Success Register User', result)
      } else {
        return helper.response(
          res,
          409,
          'Your Email was resgistered, duplicated data !'
        )
      }
    } catch (error) {
      console.log(error)
      return helper.response(res, 408, 'Bad Request', error)
    }
  },
  login: async (req, res) => {
    try {
      const { userEmail, userPassword } = req.body
      console.log(userEmail)
      const checkEmailUser = await authModel.getDataConditions(userEmail)
      if (checkEmailUser.length > 0) {
        console.log(checkEmailUser[0].user_pin)
        if (checkEmailUser[0].user_pin !== 0) {
          console.log(true, checkEmailUser[0].user_pin)
          const checkPassword = bcrypt.compareSync(
            userPassword,
            checkEmailUser[0].user_password
          )
          if (checkPassword) {
            const payload = checkEmailUser[0]
            delete payload.user_password
            const token = jwt.sign({ ...payload }, 'RAHASIA', {
              expiresIn: '24h'
            })

            const result = { ...payload, token }
            return helper.response(res, 200, 'Success login !', result)
          } else {
            return helper.response(res, 400, 'Wrong Password !', [])
          }
        } else if (checkEmailUser[0].user_pin === 0) {
          const checkPassword = bcrypt.compareSync(
            userPassword,
            checkEmailUser[0].user_password
          )
          if (checkPassword) {
            const payload = checkEmailUser[0]
            delete payload.user_password
            const token = jwt.sign({ ...payload }, 'RAHASIA', {
              expiresIn: '24h'
            })
            const result = { ...payload, token }
            return helper.response(
              res,
              200,
              'Please Input PIN for secure your account !',
              result
            )
          } else {
            return helper.response(res, 400, 'Wrong Password !', [])
          }
        }
      } else {
        return helper.response(res, 404, 'Email/ Account Not registered', [])
      }
    } catch (error) {
      console.log(error)
      return helper.response(res, 408, 'Bad Request', error)
    }
  },
  verify: async (req, res) => {
    try {
      const { id } = req.params
      if (id.length > 0) {
        const result = await authModel.verifyRegister(id)
        return helper.response(res, 200, 'Success Verifikasi !', result)
      } else {
        return helper.response(res, 404, 'Data Not Found')
      }
    } catch (error) {
      return helper.response(res, 408, 'Bad Request', error)
    }
  },

  updatePasswordUser: async (req, res) => {
    try {
      const { id } = req.params
      const { userNewPassword, userConfirmPassword } = req.body
      switch (userNewPassword) {
        case undefined:
          return helper.response(
            res,
            404,
            'Update Failed, Please Input New Password'
          )
        case '':
          return helper.response(
            res,
            404,
            'Update Failed, Please Input New Password'
          )
        default:
          break
      }
      switch (userConfirmPassword) {
        case undefined:
          return helper.response(
            res,
            404,
            'Update Failed, Please Input Confirm Password'
          )
        case '':
          return helper.response(
            res,
            404,
            'Update Failed, Please Input Confirm Password'
          )
        default:
          break
      }
      const salt = bcrypt.genSaltSync(10)
      const encryptPassword = bcrypt.hashSync(userNewPassword, salt)
      console.log(`Before encrypt = ${userNewPassword}`)
      console.log(`after encrypt = ${encryptPassword}`)
      if (userNewPassword !== userConfirmPassword) {
        return helper.response(
          res,
          403,
          'New Password and Confirm Password are different, please check again!'
        )
      } else {
        const setData = {
          user_password: encryptPassword
        }
        const result = await authModel.updateData(setData, id)
        delete result.user_password
        console.log('Sucess Update New Password !')
        return helper.response(res, 200, 'Success Update New Password', result)
      }
    } catch (error) {
      return helper.response(res, 408, 'Bad Request', error)
    }
  }
}
