// 3rd party package/modules
const express = require('express');
const morgan = require('morgan');

// User modules/packages
const userRouter = require('./routes/userRoutes');
const tourRouter = require('./routes/tourRoutes');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

const app = express();

// *----- MIDDLEWARES ----*
// Body parser middleware -> parses .json() body content to JavaScript Object
app.use(express.json());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Defining a property inside our own middleware
app.use((req, res, next) => {
  req.currentTime = new Date().toISOString();
  next();
});

// Serving static files
app.use(express.static(`${__dirname}/public`));

// *----- ROUTES ----*
// Mounting routers (Since, tourRouter & userRouter are middlewares we use app.use)
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

// Handling all Unhandled Routes
app.all('*', (req, res, next) => {
  next(new AppError(`Cannot not find ${req.originalUrl} on this server`, 404));
});

// Global Error Handling middleware
app.use(globalErrorHandler);

// Exporting our Express "app"
module.exports = app;
