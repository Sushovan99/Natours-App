const mongoose = require('mongoose');

const bcrypt = require('bcryptjs');

const crypto = require('crypto');

// 3rd party validating package
const validator = require('validator');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please tell us your name!'],
    // validate: [validator.isAlpha, 'Provide a valid name'],
  },
  email: {
    type: String,
    required: [true, 'Please provide your email!'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email!'],
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'lead-guide', 'guide'],
    default: 'user',
  },
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
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
  photo: String,
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
});

//  MONGOOSE MIDDLEWARES & HOOKS

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

//  Update passwordChangedAt property if password is modified or changed
userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

userSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });
  return next();
});

// CUSTOM INSTANCE METHODS

// We define methods on the methods Object & these methods are available after creating an instance of the Model
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimeStamp) {
  if (this.passwordChangedAt) {
    const changedPasswordTimeStamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimeStamp < changedPasswordTimeStamp;
  }

  // FALSE means password NOT changed
  return false;
};

// Instance method to generate password reset token
userSchema.methods.createPasswordResetToken = function () {
  // 1) Generate a random token
  const resetToken = crypto.randomBytes(32).toString('hex');

  // 2) Hashing the 'passwordResetToken' before saving it.
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // 3) Creating an expiry time for the reset token (Here, it is 10min)
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  console.log({ resetToken }, this.passwordResetToken);

  // 4) Returning the reset token
  return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
