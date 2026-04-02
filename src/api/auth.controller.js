'use strict';

const bcrypt = require('bcrypt');
const { usersRepository } = require('../entity/users.repository');

async function register(req, res) {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: 'All fields are required',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: 'Password must be at least 6 characters',
      });
    }

    const existingUser = await usersRepository.getByEmail(email);

    if (existingUser) {
      return res.status(400).json({
        message: 'Email already exists',
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const activationToken = Math.random().toString(36).slice(2);

    const user = await usersRepository.create(
      name,
      email,
      hashedPassword,
      activationToken,
    );

    process.stdout.write(`Activation token for ${email}: ${activationToken}\n`);

    return res.status(201).json({
      message: 'User created. Check console for activation token',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    process.stderr.write(`${error}\n`);

    return res.status(500).json({
      message: 'Server error',
    });
  }
}

async function activate(req, res) {
  try {
    const { email, activationToken } = req.body;

    if (!email || !activationToken) {
      return res.status(400).json({
        message: 'Email and activationToken are required',
      });
    }

    const user = await usersRepository.getByEmail(email);

    if (!user) {
      return res.status(404).json({
        message: 'User not found',
      });
    }

    if (user.activationToken !== activationToken) {
      return res.status(400).json({
        message: 'Invalid activation token',
      });
    }

    await usersRepository.activate(email);

    return res.status(200).json({
      message: 'Account activated successfully',
    });
  } catch (error) {
    process.stderr.write(`${error}\n`);

    return res.status(500).json({
      message: 'Server error',
    });
  }
}

module.exports = {
  authController: {
    register,
    activate,
  },
};
