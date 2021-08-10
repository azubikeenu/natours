const mongoose = require('mongoose');

const tourSchema = new mongoose.Schema({
  name: {
    required: [true, 'A tour must have a name'],
    type: String,
    unique: true,
    trim: true,
  },
  duration: {
    type: Number,
    required: [true, ' A tour must have a duration'],
  },
  maxGroupSize: {
    type: Number,
    required: [true, ' A tour must have a group size'],
  },
  difficulty: {
    type: String,
    required: [true, 'should have a difficulty'],
  },
  price: {
    required: [true, 'A tour must have a price'],
    type: Number,
  },
  ratingsAvg: {
    default: 4.5,
    type: Number,
  },
  ratingsQuantity: {
    default: 0,
    type: Number,
  },
  discount: {
    type: Number,
  },
  summary: {
    type: String,
    trim: true,
    required: [true, 'a tour must have a description'],
  },
  description: {
    type: String,
    trim: true,
  },
  imageCover: {
    type: String,
    required: [true, 'a tour must have a cover image'],
  },
  images: {
    type: [String],
  },
  createdAt: {
    type: Date,
    default: Date.now(),
    select: false,
  },
  startDates: {
    type: [Date],
  },
});

module.exports = mongoose.model('Tour', tourSchema);
