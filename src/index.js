'use strict';

const express = require('express');

const app = express();

const { authRouter } = require('./api/auth.router');

app.use(express.json());
app.use('/auth', authRouter);

app.get('/', (req, res) => {
  res.send('Auth app works');
});

const PORT = 3000;

app.listen(PORT, () => {
  process.stdout.write(`Server is running on http://localhost:${PORT}\n`);
});
