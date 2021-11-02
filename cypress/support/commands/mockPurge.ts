declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      mockPurge: typeof mockPurge;
    }
  }
}

/**
 * Purge all mocks
 * @return {Chainable<Element>}
 */
export const mockPurge = () => {
  return cy.request(Cypress.env('mockingEndpoint') + '/purge');
};
