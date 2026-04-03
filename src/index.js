'use strict';

require('dotenv').config();

const express = require('express');

const app = express();

const { authRouter } = require('./api/auth.router');
const { authMiddleware } = require('./middleware/auth.middleware');

app.use(express.json());
app.use('/auth', authRouter);

app.get('/', (req, res) => {
  res.send('Auth app works');
});

app.get('/profile', authMiddleware, (req, res) => {
  return res.status(200).json({
    message: 'Profile доступний',
    user: req.user,
  });
});

const PORT = 3000;

app.listen(PORT, () => {
  process.stdout.write(`Server is running on http://localhost:${PORT}\n`);
});
