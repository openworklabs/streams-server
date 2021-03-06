const path = require('path')
const express = require('express')
const session = require('express-session')
const cors = require('cors')
const morgan = require('morgan')
const compression = require('compression')
const mongoose = require('mongoose')
const initEventsUpdater = require('./events')
const PORT = process.env.PORT || 3001
require('dotenv').config({ path: __dirname + '/.env' })

const app = express()
module.exports = app

const createApp = async () => {
  // logging middleware
  app.use(morgan('dev'))

  // cors middleware
  app.use(cors())

  // body parsing middleware
  app.use(express.json())

  app.use(express.urlencoded({ extended: true }))

  // compression middleware
  app.use(compression())

  // express sessions
  app.use(
    session({
      secret: 'my best friend is Cody',
      resave: true,
      saveUninitialized: true
    })
  )

  app.use('/api/v0', require('./routes'))

  // any remaining requests with an extension (.js, .css, etc.) send 404
  app.use((req, res, next) => {
    if (path.extname(req.path).length) {
      const err = new Error('Not found')
      err.status = 404
      next(err)
    } else {
      next()
    }
  })

  // error handling endware
  app.use((err, req, res, next) => {
    console.error(err)
    console.error(err.stack)
    res.status(err.status || 500).send(err.message || 'Internal server error.')
  })
}

const startListening = () => {
  app.listen(PORT, () => console.log(`Mixing it up on port ${PORT}`))
}

const startDb = () => {
  mongoose.connect('mongodb://localhost/streamsDB', { useNewUrlParser: true })
  const db = mongoose.connection
  db.on('error', console.error.bind(console, 'connection error:'))
  db.once('open', async () => {
    await createApp()
    await startListening()
  })
}

async function bootApp() {
  initEventsUpdater()
  await startDb()
}
// This evaluates as true when this file is run directly from the command line,
// i.e. when we say 'node server/index.js' (or 'nodemon server/index.js', or 'nodemon server', etc)
// It will evaluate false when this module is required by another module - for example,
// if we wanted to require our app in a test spec
if (require.main === module) {
  bootApp()
} else {
  createApp()
}
