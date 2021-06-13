const helper = require('../../helpers/wrapper')
const bcrypt = require('bcrypt')
const authModel = require('./auth_model')
const jwt = require('jsonwebtoken')
const nodemailer = require('nodemailer')
require('dotenv').config()

module.exports = {
  register: async (req, res) => {
    // console.log('register running')
    // console.log(req.body)
    try {
      const {
        userFirstName,
        userLastName,
        userPhone,
        userEmail,
        userPassword
      } = req.body
      const salt = bcrypt.genSaltSync(10)
      const encryptPassword = bcrypt.hashSync(userPassword, salt)
      console.log(`Before encrypt = ${userPassword}`)
      console.log(`after encrypt = ${encryptPassword}`)
      const checkEmailUser = await authModel.getDataUser(userEmail)
      console.log(checkEmailUser)
      if (checkEmailUser.length === 0) {
        const setData = {
          user_first_name: userFirstName,
          user_last_name: userLastName,
          user_phone_number: userPhone,
          user_email: userEmail,
          user_password: encryptPassword
        }
        const result = await authModel.register(setData)
        delete result.user_password
        // console.log(result)
        // console.log(process.env.SMTP_EMAIL, process.env.SMTP_PASSWORD)
        const transporter = nodemailer.createTransport({
          host: 'smtp.gmail.com',
          port: 587,
          secure: false, // true for 465, false for other ports
          auth: {
            user: process.env.SMTP_EMAIL,
            pass: process.env.SMTP_PASSWORD
          }
        })
        const mailOptions = {
          from: `Epok Team <${process.env.SMTP_EMAIL}>`,
          to: userEmail,
          subject: 'Epok Team - Activation Email',
          html: `<p>
                      <p>
                        <b>Hello ${userFirstName} ${userLastName}, <br/> Welcome to Epok. Click button for get link veification!</b>
                      </p>
                      <p>
                        <a href='http://localhost:3000/auth/verify/${result.id}'>Click !</>
                      </p>
                    </p>`
        }
        await transporter.sendMail(mailOptions, function (error, info) {
          if (error) {
            console.log(error)
            return helper.response(res, 400, 'Email not send !')
          } else {
            console.log('Email sent:' + info.response)
          }
        })
        return helper.response(
          res,
          200,
          'Success Register User, Please check your email to activation!',
          result
        )
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
  verify: async (req, res) => {
    try {
      const { hash } = req.params
      if (hash.length > 0) {
        const result = await authModel.verifyRegister(hash)
        return helper.response(res, 200, 'Success Verifikasi !', result)
      } else {
        return helper.response(res, 404, 'Data Not Found')
      }
    } catch (error) {
      return helper.response(res, 408, 'Bad Request', error)
    }
  },
  login: async (req, res) => {
    try {
      const { userEmail, userPassword } = req.body
      console.log(userEmail)
      const checkEmailUser = await authModel.getDataConditions(userEmail)
      if (checkEmailUser.length > 0) {
        /* PIN was Filled */
        if (checkEmailUser[0].user_pin !== 0) {
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
          // PIN NOT FILL
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
  }
}
