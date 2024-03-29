const mongoose = require('mongoose');
const slugify = require('slugify');

const schemaOptions = {
  // Options for enabling virtual fields/properties
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
};

// Create a tourSchema with mongoose
const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
      // .trim() -> Removes empty white space at the beginning & at the end of the String
      trim: true,
      // Both maxLength & minLength are String validators
      maxLength: [40, 'A tour name must have at most 40 characters'],
      minLength: [10, 'A tour must have at least 10 characters'],
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
      // enum -> This validator is only for Strings
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty is either: easy, medium or difficult',
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.6,
      // min & max validators are used on numbers & also on Dates
      max: [5, 'Ratings must be less than or equal to 5'],
      min: [1, 'Ratings must be greater than or equal to 1'],
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price'],
    },
    priceDiscount: {
      type: Number,
      // Custom validator
      validate: {
        // validator takes in a function that has access to the priceDiscount value
        validator: function (val) {
          // 'this' only has access to current doc on NEW document creation. We don't have access to 'this' keyword when we're updating document.
          return this.price > val;
        },
        message: 'Discount price({VALUE}) must be less than actual price',
      },
    },
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
    secretTour: {
      type: Boolean,
      default: false,
    },
    startLocation: {
      // GeoJSON
      type: {
        type: String,
        // The default GeoJSON type is Point & the other is Polygon or Lines
        default: 'Point',
        // Making it the only possible GeoJSON type
        enum: ['Point'],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    guides: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  schemaOptions
);

// Single field index
// tourSchema.index({ price: 1 });

// Compound index
tourSchema.index({ price: 1, ratingsAverage: -1 });
tourSchema.index({ slug: 1 });

// Creating Virtual Properties
tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

// Virutal Populate. Here, "reviews" is the name of the virtual field that we're assigning
tourSchema.virtual('reviews', {
  ref: 'Review', // Name of the model that we want to reference
  foreignField: 'tour', // In our review model, we have a field called 'Tour.' And so this is where the ID of the tour is being stored.And so that's why here, in this foreign field,we specify that name of that fieldin order to connect these two models
  localField: '_id', // Here, we specify where that ID is stored inside this current Tour Model.
});

// DOCUMENT MIDDLEWARE:
// .pre() -> runs only before .save() & .create() not on any other CRUD methods.
tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// QUERY MIDDLEWARE:
// .pre('find') -> run before the .find() query search
tourSchema.pre(/^find/, function (next) {
  this.startTime = Date.now();
  // This will hide the tour that has secretTour: true
  this.find({ secretTour: { $ne: true } });
  next();
});

tourSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangedAt',
  });
  next();
});

tourSchema.post(/^find/, function (_doc, next) {
  console.log(`Time taken: ${Date.now() - this.startTime}ms`);
  next();
});

// AGGERGATION MIDDLEWARE:
tourSchema.pre('aggregate', function (next) {
  // this.pipeline() returns the aggregation pipeline array
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
  console.log(this.pipeline());
  next();
});

// Create a Tour Model using the tourSchema
const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
