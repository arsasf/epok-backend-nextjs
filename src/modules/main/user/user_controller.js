const helper = require('../../../helpers/wrapper')
const userModel = require('./user_model')
const redis = require('redis')
const client = redis.createClient()
const nodemailer = require('nodemailer')
require('dotenv').config()

module.exports = {
  getUserById: async (req, res) => {
    try {
      const { id } = req.params
      const result = await userModel.getUserById(id)
      if (result.length === 0) {
        return helper.response(res, 404, `data by id ${id} not found !`, null)
      }
      delete result[0].password_worker

      client.setex(`getUserById:${id}`, 3600, JSON.stringify(result))

      return helper.response(res, 200, 'Succes get data !', result)
    } catch (error) {
      // console.log(error)
      return helper.response(res, 400, 'Bad Request', error)
    }
  },
  updatePin: async (req, res) => {
    try {
      const { id } = req.params
      const { userPin } = req.body
      const checkUser = await userModel.getUserById(id)
      if (checkUser.length > 0) {
        if (checkUser[0].user_pin === 0 || checkUser[0].user_status === '0') {
          const setData = {
            user_status: '1',
            user_pin: userPin
          }
          const result = await userModel.updateUser(setData, id)
          const userUpdated = await userModel.getUserById(id)
          console.log(userUpdated)
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
            from: `"E-Pok Team" <${process.env.SMTP_EMAIL}>`,
            to: userUpdated[0].user_email,
            subject: 'E-Pok Team - Info PIN',
            html: `<p>
                        <p>
                          <b>Hello ${userUpdated[0].user_name}, <br/> Welcome to E-Pok. Please don't share your pin to anyone!</b>
                        </p>
                        <p>
                          PIN : ${userUpdated[0].user_pin}
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
            'Succes update PIN, check your PIN in Email !',
            result
          )
        } else if (checkUser[0].user_pin !== 0) {
          const setData = {
            user_status: '1',
            user_pin: userPin
          }
          const result = await userModel.updateUser(setData, id)
          const userUpdated = await userModel.getUserById(id)
          console.log(userUpdated)
          console.log(userUpdated[0].user_name)
          console.log(process.env.SMTP_EMAIL, process.env.SMTP_PASSWORD)
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
            from: `"E-Pok Team" <${process.env.SMTP_EMAIL}>`,
            to: userUpdated[0].user_email,
            subject: 'E-Pok Team - Info PIN',
            html: `<p>
                        <p>
                          <b>Hello ${userUpdated[0].user_name}, <br/> Please don't share your pin to anyone!</b>
                        </p>
                        <p>
                          PIN : ${userUpdated[0].user_pin}
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
            'Succes update PIN, check your PIN in Email !',
            result
          )
        }
      }
      return helper.response(res, 404, ' user not found!')
    } catch (error) {
      console.log(error)
      return helper.response(res, 400, 'Bad Request', error)
    }
  }
}
