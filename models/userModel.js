const mongoose = require('mongoose');

const bcrypt = require('bcryptjs');

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
    // Do not send the password in the response when the client makes a request
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password!'],
    // This only works on CREATE & SAVE!!! (i.e Model.save() & Model.create())
    validate: {
      validator: function (el) {
        return el === this.password;
      },
      message: 'Passwords are not the same',
    },
  },
});

//  bcrypt.hash() is a asynchronous function & returns a promise.
userSchema.pre('save', async function (next) {
  // If the password is not modified we'll immediately go the next middleware
  if (!this.isModified('password')) return next();

  // 2nd argument of hash() is the CPU cost
  this.password = await bcrypt.hash(this.password, 12);

  // After verifying
  this.passwordConfirm = undefined;
  next();
});

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
