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

//------->> Update logged in/current user password
router.patch(
  '/updateMyPassword',
  authController.protect,
  authController.updatePassword
);

//------->> Update user data
router.patch('/updateMe', authController.protect, userController.updateMe);

//------->> Delete user
router.delete('/deleteMe', authController.protect, userController.deleteMe);

//-------->> Get own data
router.get(
  '/me',
  authController.protect,
  userController.getMe,
  userController.getUser
);

// ------>> User Routes
router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);
router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(
    authController.protect,
    authController.restrictTo('admin'),
    userController.deleteUser
  );

module.exports = router;
