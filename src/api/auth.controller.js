'use strict';

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { usersRepository } = require('../entity/users.repository');

function createAccessToken(user) {
  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
    },
    process.env.JWT_ACCESS_SECRET || 'access_secret',
    { expiresIn: '15m' },
  );
}

function createRefreshToken(user) {
  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
    },
    process.env.JWT_REFRESH_SECRET || 'refresh_secret',
    { expiresIn: '7d' },
  );
}

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

async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: 'Email and password are required',
      });
    }

    const user = await usersRepository.getByEmail(email);

    if (!user) {
      return res.status(404).json({
        message: 'User not found',
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(400).json({
        message: 'Invalid password',
      });
    }

    if (user.activationToken !== null) {
      return res.status(403).json({
        message: 'Please activate your email',
      });
    }

    const accessToken = createAccessToken(user);
    const refreshToken = createRefreshToken(user);

    return res.status(200).json({
      message: 'Login successful',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
      accessToken,
      refreshToken,
    });
  } catch (error) {
    process.stderr.write(`${error}\n`);

    return res.status(500).json({
      message: 'Server error',
    });
  }
}

async function logout(req, res) {
  return res.status(200).json({
    message: 'Logout successful',
  });
}

module.exports = {
  authController: {
    register,
    activate,
    login,
    logout,
  },
};
