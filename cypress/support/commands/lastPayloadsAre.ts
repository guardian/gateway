/**
 * @jest-environment jsdom
 */

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      lastPayloadsAre: typeof lastPayloadsAre;
    }
  }
}

/**
 * Make an assertion that the last payload is equal to the expected value.
 * @param expectedPayloads Expect the last n payloads to be equal to these values.
 * @returns A chainable cypress command.
 */
export const lastPayloadsAre = (expectedPayloads: Array<object>) => {
  return cy
    .request(Cypress.env('mockingEndpoint') + '/payloads')
    .then((response) => {
      expect(response.body.slice(-expectedPayloads.length)).to.deep.equal(
        expectedPayloads,
      );
    });
};
