const mongoose = require('mongoose')
const { Schema } = mongoose

const eventSchema = new Schema({
  app: String,
  streamID: String,
  data: Object,
  parent: String,
  createdAt: String
})

module.exports = mongoose.model('Events', eventSchema)
