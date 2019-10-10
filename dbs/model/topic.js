const { Schema, model } = require('mongoose')

const topicSchema = new Schema({
  __v: { type: Number, select: false },
  name: { type: String, required: true },
  avatar: { type: String },
  introduction: { type: String, select: false }
})

module.exports = model('Topic', topicSchema)