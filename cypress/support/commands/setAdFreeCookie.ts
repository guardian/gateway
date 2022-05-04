declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      setAdFreeCookie: typeof setAdFreeCookie;
      setDigitalSubscriberCookie: typeof setDigitalSubscriberCookie;
    }
  }
}

/**
 * Set the GU_AF1 cookie dropped by Support-Frontedn if a user as purchased a digital subscription.
 * Default expiry is Now + 1 day in millis
 * https://github.com/guardian/support-frontend/blob/728ff9fb6ef1e955d9b878c56a59392426f65db8/support-frontend/app/controllers/CreateSubscriptionController.scala#L156
 * @param expiryInDays when the cookie should expire (can also be in the past eg. -1)
 */
export const setAdFreeCookie = (expiryInDays = 1) => {
  const tz = Date.now() + 1000 * 60 * 60 * 24 * expiryInDays;
  return cy.setCookie('GU_AF1', tz.toString(), {
    log: true,
  });
};

export const setDigitalSubscriberCookie = (value = true) => {
  return cy.setCookie('gu_digital_subscriber', value.toString(), {
    log: true,
  });
};
