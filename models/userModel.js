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

module.exports = mongoose.model('User', userSchema);
