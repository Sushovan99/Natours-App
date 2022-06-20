const mongoose = require('mongoose');

// 3rd party validating package
const validator = require('validator');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please tell us your name!'],
  },
  email: {
    type: String,
    required: [true, 'Please provide your email!'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email!'],
  },
  photo: String,
  password: {
    type: String,
    required: [true, 'Please provide a password!'],
    minlength: [8, 'Must have minimum 8 characters!'],
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password!'],
  },
});

const User = mongoose.model('User', userSchema);

module.exports = User;