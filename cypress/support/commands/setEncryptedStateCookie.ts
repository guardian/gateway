import { encrypt } from '../../../src/server/lib/crypto';
import { EncryptedState } from '../../../src/shared/model/EncryptedState';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      setEncryptedStateCookie: typeof setEncryptedStateCookie;
    }
  }
}

/**
 * Set the mvtId cookie
 * @param str Value to set the mvtId cookie to
 */
export const setEncryptedStateCookie = (state: EncryptedState) => {
  const encrypted = encrypt(
    JSON.stringify(state),
    Cypress.env('ENCRYPTION_SECRET_KEY'),
  );
  return cy.setCookie('GU_GATEWAY_STATE', encrypted, {
    log: true,
  });
};
