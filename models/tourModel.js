const mongoose = require('mongoose');
const slugify = require('slugify');
//const User = require('./userModel');

const tourSchema = new mongoose.Schema(
  {
    name: {
      required: [true, 'A tour must have a name'],
      type: String,
      unique: true,
      trim: true,
      maxlength: [
        40,
        'A tour name must have length less or equal to 40 characters',
      ],
      minLength: [
        10,
        'A tour name must have length greater or equal to 10 characters',
      ],
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
      enum: {
        values: ['easy', 'difficult', 'medium'],
        message: 'Difficulty must be one of : easy,difficult or medium',
      },
    },
    price: {
      required: [true, 'A tour must have a price'],
      type: Number,
    },
    ratingsAvg: {
      default: 4.5,
      type: Number,
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be below 5.0'],
    },
    ratingsQuantity: {
      default: 0,
      type: Number,
    },
    discount: {
      type: Number,
      validate: {
        validator: function (val) {
          // Not going to work on update , only on create and save
          return val < this.price;
        },
        message: 'Discount price ({VALUE}) should be less than regular price ',
      },
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
    startLocation: {
      //GeoJSON ==> long,lat
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number],
      description: String,
      address: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        description: String,
        address: String,
        day: Number,
      },
    ],
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

//Ddcument middleware , it runs before the save command or create command , but not insertMany or update
tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// embedding users in tour schema
// tourSchema.pre('save', async function (next) {
//   const guidesPromises = this.guides.map(async (id) => await User.findById(id));
//   this.guides = await Promise.all(guidesPromises);
//   next();
// });

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
