const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({
  path: './config.env',
});

// Connecting DB
const DB = process.env.DB_CONNECT.replace(
  '<PASSWORD>',
  process.env.DB_PASSWORD
);
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('DB connected'));

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

// Create a document using Tour Model
const testTour = new Tour({
  name: 'The Forest Hiker',
  rating: 4.8,
  price: 478,
});

// Saving testTour to our DB (".save() returns a promise, so we consume it using .then()")
testTour
  .save()
  .then((doc) => {
    console.log(doc);
  })
  .catch((err) => console.log('ERROR 💥', err));

const app = require('./app');

// Starting server
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
