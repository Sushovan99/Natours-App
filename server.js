const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Handling Uncaught Exception
process.on('uncaughtException', (err) => {
  console.log(err.name, err.message);
  console.log('UNCAUGHT EXCEPTION 💥. Shutting down...');
  process.exit(1);
});

dotenv.config({
  path: './config.env',
});

// Importing our Express App
const app = require('./app');

// Connecting DB
const DB = process.env.DB_CONNECT.replace(
  '<PASSWORD>',
  process.env.DB_PASSWORD
);

mongoose.set('strictQuery', true);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('DB connected'));

// Starting server
const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

// Handling Unhanlded Rejection
process.on('unhandledRejection', (err) => {
  console.log(err.name, err.message);
  console.log('UNHANLDED REJECTION 💥. Shutting down...');
  // For success exit-code = 0 & failure exit-code = 1
  server.close(() => {
    process.exit(1);
  });
});
