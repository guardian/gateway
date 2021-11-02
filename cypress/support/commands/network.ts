declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      network: typeof network;
    }
  }
}

// Adds a command that allows you to emulate going offline.
// Usage: `cy.network({ offline: true });`

/**
 * Allows you to emulate going offline.
 * Usage: `cy.network({ offline: true });`
 * @param options Option to toggle the offline state.
 */
export const network = (options: { offline: boolean }) => {
  Cypress.automation('remote:debugger:protocol', {
    command: 'Network.enable',
  });

  Cypress.automation('remote:debugger:protocol', {
    command: 'Network.emulateNetworkConditions',
    params: {
      offline: options.offline,
      latency: 0,
      downloadThroughput: -1,
      uploadThroughput: -1,
      connectionType: 'none',
    },
  });
};
