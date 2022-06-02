const express = require('express');

const userController = require(`${__dirname}/../controllers/userController.js`);

// userRouter middleware
const userRouter = express.Router();

// ------>> User Routes
userRouter
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);
userRouter
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = userRouter;
