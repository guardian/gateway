/// <reference types="cypress" />

const ms = require('ms');

const authCookieResponse = {
  cookies: {
    values: [
      {
        key: 'GU_U',
        value: 'FAKE_GU_U',
      },
      {
        key: 'SC_GU_LA',
        value: 'FAKE_SC_GU_LA',
        sessionCookie: true,
      },
      {
        key: 'SC_GU_U',
        value: 'FAKE_SC_GU_U',
      },
    ],
    expiresAt: ms('30d') * 1000,
  },
};

module.exports = {
  authCookieResponse,
};
