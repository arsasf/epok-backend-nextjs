const helper = require('../../../helpers/wrapper')
const userModel = require('./user_model')
const redis = require('redis')
const client = redis.createClient()

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
        if (checkUser[0].user_pin === 0) {
          const setData = {
            user_pin: userPin
          }
          const result = await userModel.updateUser(setData, id)
          return helper.response(res, 200, 'Succes update PIN !', result)
        }
      }
      return helper.response(res, 200, 'PIN was Filled !')
    } catch (error) {
      console.log(error)
      return helper.response(res, 400, 'Bad Request', error)
    }
  }
}
