/// <reference types='cypress' />

const PageResetPassword = require('../support/pages/reset_password_page');
const PageResetSent = require('../support/pages/reset_sent_page');

describe('Password reset flow', () => {
  const page = new PageResetPassword();

  before(() => {
    cy.idapiMockPurge();
  });

  beforeEach(function () {
    cy.fixture('users').as('users');
    page.goto();
  });

  context('Valid email already exits', () => {
    it('successfully submits the request', function () {
      const { email } = this.users.validEmail;
      cy.idapiMock(200);
      page.submitEmailAddress(email);
      cy.contains(PageResetSent.CONTENT.CONFIRMATION);
    });
  });

  context(`Email doesn't exist`, () => {
    it('shows a message saying the email address does not exist', function () {
      const { email } = this.users.emailNotRegistered;
      cy.idapiMock(404, {
        status: 'error',
        errors: [{ message: 'Not found' }],
      });
      page.submitEmailAddress(email);
      cy.contains(PageResetPassword.CONTENT.ERRORS.NO_ACCOUNT);
    });
  });

  context('Email field is left blank', () => {
    it('displays a message saying an email address is needed', () => {
      cy.idapiMock(500, {
        status: 'error',
        errors: [{ message: 'Required field missing' }],
      });
      page.clickResetPassword();
      cy.contains(PageResetPassword.CONTENT.ERRORS.NO_EMAIL);
    });
  });

  // This is a lot of tests. May not need to test them all. This is also not a comprehensive test, just one email pattern for each provider.
  [
    {
      name: 'Gmail',
      inboxLink: 'https://mail.google.com/mail',
      testEmail: 'test@gmail.com',
    },
    {
      name: 'Yahoo!',
      inboxLink: 'https://mail.yahoo.com',
      testEmail: 'test@yahoomail.com',
    },
    {
      name: 'BT Mail',
      inboxLink: 'https://www.bt.com/email',
      testEmail: 'test@btinternet.com',
    },
    {
      name: 'AOL Mail',
      inboxLink: 'https://mail.aol.com/',
      testEmail: 'test@aol.com',
    },
    {
      name: 'Outlook',
      inboxLink: 'https://outlook.live.com/',
      testEmail: 'test@outlook.com',
    },
  ].forEach((emailProvider) => {
    context(`An ${emailProvider.name} email client is specified`, () => {
      it('links to the web email client', () => {
        const email = emailProvider.testEmail;
        cy.idapiMock(200);
        page.submitEmailAddress(email);
        cy.contains(`Go to your ${emailProvider.name} inbox`).should(
          'have.attr',
          'href',
          `${emailProvider.inboxLink}`,
        );
      });
    });
  });

  context('General IDAPI failure', () => {
    it('displays a generic error message', () => {
      cy.idapiMock(500);
      page.clickResetPassword();
      cy.contains(PageResetPassword.CONTENT.ERRORS.GENERIC);
    });
  });
});
