const helper = require('../../../helpers/wrapper')
const userModel = require('./user_model')
const redis = require('redis')
const client = redis.createClient()
const nodemailer = require('nodemailer')
require('dotenv').config()
const bcrypt = require('bcrypt')
const fs = require('fs')

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
  getAllUser: async (req, res) => {
    try {
      let { search, sort, page, limit } = req.query
      search = search || ''
      sort = sort || 'user_id ASC'
      page = page || 1
      limit = limit || 5
      page = parseInt(page)
      limit = parseInt(limit)
      const totalData = await userModel.getDataCount(search, {
        sort
      })
      const totalpage = Math.ceil(totalData / limit)
      const offset = page * limit - limit
      const pageInfo = {
        page,
        totalpage,
        limit,
        totalData
      }
      const result = await userModel.getDataAll(search, { sort }, limit, offset)
      return helper.response(res, 200, 'Success Get Data', result, pageInfo)
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
  },
  updatePasswordUser: async (req, res) => {
    try {
      const { id } = req.params
      const { userCurrentPassword, userNewPassword, userConfirmPassword } =
        req.body
      const checkPassword = await userModel.getUserById(id)
      const comparePassword = bcrypt.compareSync(
        userCurrentPassword,
        checkPassword[0].user_password
      )
      if (!comparePassword) {
        return helper.response(res, 400, 'Wrong Password !', [])
      } else {
        const salt = bcrypt.genSaltSync(10)
        const encryptPassword = bcrypt.hashSync(userNewPassword, salt)
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
          const result = await userModel.updateUser(setData, id)
          // send email
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
            to: checkPassword[0].user_email,
            subject: 'E-Pok Team - Change Password',
            html: `<p>
                        <p>
                          <b>Hello ${checkPassword[0].user_name}, <br/> your password was changed!</b>
                        </p>
                        <p>
                          New Password : ${userNewPassword}
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
          delete result.user_password
          console.log('Sucess Update New Password !')
          return helper.response(
            res,
            200,
            'Success Update New Password',
            result
          )
        }
      }
    } catch (error) {
      console.log(error)
      return helper.response(res, 408, 'Bad Request', error)
    }
  },
  updateProfileUser: async (req, res) => {
    try {
      const { id } = req.params
      const { userFirstName, userLastName, userEmail, userPhone } = req.body
      const setData = {
        user_first_name: userFirstName,
        user_last_name: userLastName,
        user_email: userEmail,
        user_phone_number: userPhone,
        user_updated_at: new Date(Date.now())
      }
      const result = await userModel.updateUser(setData, id)
      console.log('success update profile', result)
      return helper.response(res, 200, 'Succes update profile !', result)
    } catch (error) {
      console.log(error)
      return helper.response(res, 408, 'Bad Request', error)
    }
  },
  updateImageUser: async (req, res) => {
    try {
      const { id } = req.params
      const checkUser = await userModel.getUserById(id)
      if (checkUser.length > 0) {
        const image = req.file ? req.file.filename : ''
        console.log(image)
        if (image !== checkUser[0].image && image !== '') {
          console.log(true)
          const pathFile = 'src/uploads/' + checkUser[0].user_image
          console.log(pathFile)
          if (fs.existsSync(pathFile)) {
            console.log(true, pathFile)
            fs.unlink(pathFile, function (err) {
              if (err) throw err
              console.log(
                'Oldest Image Success Deleted',
                checkUser[0].user_image
              )
            })
          }
          console.log(true, 'image ada')
          const setData = {
            user_image: image,
            user_updated_at: new Date(Date.now())
          }
          const result = await userModel.updateUser(setData, id)
          console.log('success update profile', result)
          return helper.response(res, 200, 'Succes update image!', result)
        } else if (checkUser[0].user_image === '') {
          const setData = {
            user_image: '',
            user_updated_at: new Date(Date.now())
          }
          const result = await userModel.updateUser(setData, id)
          console.log('success update profile', result)
          return helper.response(res, 200, 'Succes update image!', result)
        } else {
          console.log(false, 'data same, cannot delete')
          return helper.response(res, 400, 'data same, cannot delete !')
        }
      } else {
        return helper.response(res, 404, 'User not found !', [])
      }
    } catch (error) {
      console.log(error)
      return helper.response(res, 408, 'Bad Request', error)
    }
  }
}
