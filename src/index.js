const express = require('express')
require('dotenv').config()
const morgan = require('morgan')
const cors = require('cors')
const xss = require('xss-clean')
const helmet = require('helmet')
const compression = require('compression')
const bodyParser = require('body-parser')
const routerNavigation = require('./routes')
// const socket = require('socket.io')

const app = express()
const port = process.env.DB_PORT

app.use(morgan('dev'))
app.use(cors())
app.options('*', cors())
app.use(xss())
app.use(helmet())
app.use(compression())
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
// parse application/json
app.use(bodyParser.json())
app.use('/backend4/api/v1', routerNavigation)
app.use('/backend4/api', express.static('src/uploads'))

// ====================================
// const server = require('http').createServer(app)
// const io = socket(server, {
//   cors: {
//     origin: '*'
//   },
//   path: '/backend3/socket.io'
// })
// io.on('connection', (socket) => {
//   console.log('Socket.io Connect!')
//   // globalMessage = pesan yg dikirim k semua chat
//   socket.on('globalMessage', (data) => {
//     console.log(data)
//     io.emit('chatMessage', data)
//   })

//   socket.on('privateMessage', (data) => {
//     console.log(data)
//     socket.emit('chatMessage', data)
//   })
//   // broadcastMessage
//   socket.on('broadcastMessage', (data) => {
//     console.log(data)
//     socket.emit('chatMessage', data)
//   })
//   // =====================================
//   socket.on('joinRoom', (data) => {
//     console.log(data)
//     if (data.oldRoom) {
//       socket.leave(data.oldRoom)
//     }
//     socket.join(data.room)
//     socket.broadcast.to(data.room).emit('chatMessage', {
//       username: 'BOT',
//       message: `${data.username} joined chat `
//     })
//   })
//   socket.on('roomMessage', (data) => {
//     io.to(data.room).emit('chatMessage', data)
//   })
// })

// ====================================

app.listen(port, () => {
  console.log(`Express app is listen on port ${port} !`)
})
