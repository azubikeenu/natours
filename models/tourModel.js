const mongoose = require('mongoose');

const tourSchema = new mongoose.Schema({
  name: {
    required: [true, 'A tour must have a name'],
    type: String,
    unique: true,
  },
  price: {
    required: [true, 'A tour must have a price'],
    type: Number,
  },
  rating: {
    default: 4.5,
    type: Number,
  },
});

module.exports = mongoose.model('Tour', tourSchema);
