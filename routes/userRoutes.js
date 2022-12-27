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

// Protects all routes after this middleware
router.use(authController.protect);

//------->> Update logged in/current user password
router.patch(
  '/updateMyPassword',

  authController.updatePassword
);

//------->> Update user data
router.patch('/updateMe', userController.updateMe);

//------->> Delete user
router.delete('/deleteMe', userController.deleteMe);

//-------->> Get own data
router.get('/me', userController.getMe, userController.getUser);

// Only admin can perform below actions
router.use(authController.restrictTo('admin'));
// ------>> User Routes
router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);
router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(authController.restrictTo('admin'), userController.deleteUser);

module.exports = router;
