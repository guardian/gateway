/// <reference types="cypress" />

const ChangePasswordPage = require('../support/pages/change_password_page');
const { get } = require('http');

const MOCKING_ENDPOINT = 'localhost:9000/mock';

const getMockOptions = (status, body = {}) => ({
  headers: {
    'Content-Type': 'application/json',
    "x-status": status,
  },
  method: 'POST',
  body: JSON.stringify(body),
  url: MOCKING_ENDPOINT, 
});

describe('Password change flow', () => {
  const page =  new ChangePasswordPage();

  before(() => {
    cy.request(MOCKING_ENDPOINT + '/purge');
  });
  
  context('An expired/invalid token is used', () => {
    it('shows a resend password page', () => {
      const fakeToken = 'abcde';
      cy.request(getMockOptions(500, {
        status: 'error',
        errors: [
          {
            message: 'Invalid token'
          }
        ]
      }));
      page.goto(fakeToken);
    });
  });

  context.skip('Passwords do not match');
  context.skip('Enter password is left blank')
  context.skip('Enter and Confirm passwords left blank');
  context.skip('Valid password entered');
  context.skip('General IDAPI failure');

});
