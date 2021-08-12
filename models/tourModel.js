const mongoose = require('mongoose');
const slugify = require('slugify');

const tourSchema = new mongoose.Schema(
  {
    name: {
      required: [true, 'A tour must have a name'],
      type: String,
      unique: true,
      trim: true,
    },
    slug: String,
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
    secretTour: Boolean,
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

//Ddcument middleware , it runs before the save command or create command , but not insertMany
tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// tourSchema.pre('save', function (next) {
//   console.log('Saving Tour');
//   next();
// });

// tourSchema.post('save', function (doc, next) {
//   console.log(doc);
//   next();
// });

//Query Middleware

tourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } });
  this.start = Date.now();
  next();
});
tourSchema.post(/^find/, function (doc, next) {
  this.find({ secretTour: { $ne: true } });
  console.log(`Query took ${Date.now() - this.start} milliseconds`);
  next();
});

// Aggregation Middleware

tourSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
  next();
});

// using virtual properties
tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

module.exports = mongoose.model('Tour', tourSchema);
