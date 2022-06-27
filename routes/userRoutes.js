const express = require('express');

const userController = require('../controllers/userController');

const authController = require('../controllers/authController');

// userRouter middleware
const router = express.Router();

//------>> Signup route
router.post('/signup', authController.signup);

//------>> Login route
router.post('/login', authController.login);

//------>> Forgot Password route
router.post('/forgotPassword', authController.forgotPassword);

//------>> Reset Password route
router.patch('/resetPassword/:resetToken', authController.resetPassword);

// ------>> User Routes
router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);
router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
