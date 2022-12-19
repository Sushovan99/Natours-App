// 3rd party package/modules
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');

// User modules/packages
const userRouter = require('./routes/userRoutes');
const tourRouter = require('./routes/tourRoutes');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

const app = express();

// *----- GLOBAL MIDDLEWARES ----*

// Set Security HTTP Headers
app.use(helmet());

// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Limit requests from same IP
const limiter = rateLimit({
  windowMs: 30 * 60 * 1000, // Time frame for which requests are checked/remembered. Here, 30 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  mesage: 'Too many requests, from this IP please try again after 15min',
});
app.use('/api', limiter);

// Body parser middleware -> parses .json() body content to JavaScript Object
app.use(express.json({ limit: '10kb' })); // limit -> limits the amount of data that can be send to server through body

// Serving static files
app.use(express.static(`${__dirname}/public`));

// Defining a property inside our own middleware
app.use((req, res, next) => {
  req.currentTime = new Date().toISOString();
  next();
});

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
