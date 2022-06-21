const express = require('express');

const userController = require('../controllers/userController');

const authController = require('../controllers/authController');

// userRouter middleware
const router = express.Router();

//------>> Signup route
router.post('/signup', authController.signup);

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
