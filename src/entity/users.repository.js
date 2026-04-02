'use strict';

const { db } = require('../utils/db');

function create(name, email, password, activationToken = null) {
  return db.user.create({
    data: {
      name,
      email,
      password,
      activationToken,
    },
  });
}

function getByEmail(email) {
  return db.user.findUnique({
    where: { email },
  });
}

function activate(email) {
  return db.user.update({
    where: { email },
    data: {
      activationToken: null,
    },
  });
}

module.exports = {
  usersRepository: {
    create,
    getByEmail,
    activate,
  },
};
