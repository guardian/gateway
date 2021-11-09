declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      setMvtId: typeof setMvtId;
    }
  }
}

/**
 * Set the mvtId cookie
 * @param str Value to set the mvtId cookie to
 */
export const setMvtId = (str: string) => {
  return cy.setCookie('GU_mvt_id', str, {
    log: true,
  });
};
