export const authCookieResponse = {
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
    expiresAt: 2592000, // 30 days in seconds
  },
};

export const setAuthCookies = () => {
  cy.setCookie('GU_U', 'FAKE_GU_U');
  cy.setCookie('SC_GU_U', 'FAKE_SC_GU_U');
  cy.setCookie('SC_GU_LA', 'FAKE_SC_GU_LA');
};
