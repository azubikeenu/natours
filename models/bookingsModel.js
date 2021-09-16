const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  tour: {
    type: mongoose.Schema.ObjectId,
    ref: 'Tour',
    required: ['A booking must have a tour id '],
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: ['A booking must have a user id '],
  },
  price: {
    type: Number,
    required: ['A booking must have a price'],
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },

  paid: {
    type: Boolean,
    default: true,
  },
});

bookingSchema.pre(/^find/, function (next) {
  this.populate('user').populate('tour');
  next();
});

module.exports = mongoose.model('Bookings', bookingSchema);
