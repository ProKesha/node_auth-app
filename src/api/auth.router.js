'use strict';

const express = require('express');
const { authController } = require('./auth.controller');

const router = express.Router();

router.post('/register', authController.register);
router.post('/activate', authController.activate);
router.post('/login', authController.login);
router.post('/logout', authController.logout);

module.exports = {
  authRouter: router,
};
