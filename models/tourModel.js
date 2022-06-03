const mongoose = require('mongoose');

// Create a tourSchema with mongoose
const tourSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A tour must have a name'],
    unique: true,
  },
  rating: {
    type: Number,
    default: 4.6,
  },
  price: {
    type: Number,
    required: [true, 'A tour must have a price'],
  },
});

// Create a Tour Model using the tourSchema
const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
