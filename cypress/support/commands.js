// ***********************************************
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

const MOCKING_ENDPOINT = 'localhost:9000/mock';

Cypress.Commands.add('idapiMock', (status, body) => {
  const getMockOptions = (status, body = {}) => ({
    headers: {
      'Content-Type': 'application/json',
      'x-status': status,
    },
    method: 'POST',
    body: JSON.stringify(body),
    url: MOCKING_ENDPOINT,
  });

  cy.request(getMockOptions(status, body));
});

Cypress.Commands.add('idapiMockPurge', () => {
  cy.request(MOCKING_ENDPOINT + '/purge');
});
