const { Schema, model } = require('mongoose')

const UserSchema = new Schema({
  name: { type: String, required: true },
  password: { type: String, required: true, select: false },
  __v: { type: Number, select: false }
})

module.exports = model('User', UserSchema)