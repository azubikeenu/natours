const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is a required field'],
  },
  email: {
    type: String,
    required: [true, 'Email is a required field'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email'],
  },
  photo: String,
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minLength: 8,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password'],
    validate: {
      validator: function (val) {
        // this is only going to work on save or create and not update
        return this.password === val;
      },
      message: 'Passwords dont match ',
    },
  },
  passwordChangedAt: Date,
});

// prehook onSave
userSchema.pre('save', async function (next) {
  //only run when the password is modified
  if (!this.isModified('password')) return next();
  // hash the password
  this.password = await bcrypt.hash(this.password, 12);
  //prevent the peristence of password
  this.passwordConfirm = undefined;
  next();
});

//creating an instance method (This is avaliable to all user documents)
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.hasChangedPassword = function (JWTTimeStamp) {
  if (this.passwordChangedAt) {
    const changedTimeStamp = (this.passwordChangedAt.getTime() / 1000) * 1;
    return JWTTimeStamp < changedTimeStamp;
  }
  return false;
};

module.exports = mongoose.model('User', userSchema);
