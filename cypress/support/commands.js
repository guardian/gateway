// ***********************************************
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

const MOCKING_ENDPOINT = 'localhost:9000/mock';

Cypress.Commands.add('mockNext', (status, body) => {
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

Cypress.Commands.add('mockAll', (status, body, path) => {
  const getMockOptions = (status, body = {}) => {
    const payload = {
      body,
      path,
      status,
    };
    return {
      headers: {
        'Content-Type': 'application/json',
        'x-status': status,
      },
      method: 'POST',
      body: JSON.stringify(payload),
      url: MOCKING_ENDPOINT + '/permanent',
    };
  };

  cy.request(getMockOptions(status, body));
});

Cypress.Commands.add('mockPattern', (status, body, pattern) => {
  const getMockOptions = (status, body = {}) => {
    const payload = {
      body,
      pattern,
      status,
    };
    return {
      headers: {
        'Content-Type': 'application/json',
        'x-status': status,
      },
      method: 'POST',
      body: JSON.stringify(payload),
      url: MOCKING_ENDPOINT + '/permanent-pattern',
    };
  };

  cy.request(getMockOptions(status, body));
});

Cypress.Commands.add('lastPayloadIs', (expected) => {
  return cy.request(MOCKING_ENDPOINT + '/payload').then((response) => {
    expect(response.body).to.deep.equal(expected);
  });
});

Cypress.Commands.add('mockPurge', () => {
  cy.request(MOCKING_ENDPOINT + '/purge');
});

Cypress.Commands.add('setMvtId', (str) => {
  cy.setCookie('GU_mvt_id', str, {
    log: true,
  });
});
