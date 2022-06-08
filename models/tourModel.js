const mongoose = require('mongoose');
const slugify = require('slugify');

// Create a tourSchema with mongoose
const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
      // .trim() -> Removes empty white space at the beginning & at the end of the String
      trim: true,
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a group size'],
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty'],
    },
    ratingsAverage: {
      type: Number,
      default: 4.6,
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price'],
    },
    priceDiscount: Number,
    summary: {
      type: String,
      trim: true,
      required: [true, 'A tour must have a summary'],
    },
    description: {
      type: String,
      trim: true,
    },
    // Cover image for our tour
    imageCover: {
      type: String,
      required: [true, 'A tour must have a cover image'],
    },
    // Contains array of different images
    images: [String],
    // A time stamp for tour creatiion
    createdAt: {
      type: Date,
      // Date.now() provides  current time in milliseconds, but MongoDB reformats it.
      default: Date.now(),
    },
    // Array containing starting dates of different tours
    startDates: [Date],
  },
  {
    // Options for enabling virtual fields/properties
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Creating Virtual Properties
tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

// DOCUMENT MIDDLEWARE:
// .pre() -> runs only before .save() & .create() not on any other CRUD methods.
tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

tourSchema.pre('save', function (next) {
  console.log('Will save document');
  next();
});

// .post() -> runs after .save() & .create().
tourSchema.post('save', function (doc, next) {
  console.log(doc);
  next();
});
// Create a Tour Model using the tourSchema
const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
