'use strict';

const express = require('express');
const { authController } = require('./auth.controller');

const router = express.Router();

router.post('/register', authController.register);
router.post('/activate', authController.activate);

module.exports = {
  authRouter: router,
};
