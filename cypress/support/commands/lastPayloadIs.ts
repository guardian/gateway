/**
 * @jest-environment jsdom
 */

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      lastPayloadIs: typeof lastPayloadIs;
    }
  }
}

/**
 * Make an assertion that the last payload is equal to the expected value.
 * @param expectedPayload Expect the last payload to be equal to this value.
 * @returns A chainable cypress command.
 */
export const lastPayloadIs = (expectedPayload: Array<object>) => {
  return cy
    .request(Cypress.env('mockingEndpoint') + '/payload')
    .then((response) => {
      expect(response.body).to.deep.equal(expectedPayload);
    });
};
