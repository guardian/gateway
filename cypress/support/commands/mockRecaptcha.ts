/**
 * @jest-environment jsdom
 */

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      mockRecaptcha: typeof mockRecaptcha;
    }
  }
}

/**

*/
export const mockRecaptcha = (shouldCheckFail = false) => {
  return cy.intercept(
    'GET',
    'https://www.google.com/recaptcha/api.js**',
    `
    (() => {
      let recaptchaOptions;
      window.grecaptcha = {
        render: (element, options) => (recaptchaOptions = options),
        reset: () => undefined,
        execute: () =>
          ${shouldCheckFail}
            ? recaptchaOptions?.['error-callback']()
            : recaptchaOptions?.callback('valid-token'),
        ready: (res) => res(),
      }
    })()
  `,
  );
};
