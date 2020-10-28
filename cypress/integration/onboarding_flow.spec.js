/* eslint-disable @typescript-eslint/no-var-requires */
/// <reference types="cypress" />

describe('Onboarding flow', () => {
  beforeEach(() => {
    cy.idapiMockPurge();
  });

  context('Full flow', () => {
    // it(
    //   'goes through full flow, opt in all consents/newsletters, preserve returnUrl',
    // );
    // it(
    //   'goes through full flow, opt out all consents/newsletters, preserve returnUrl',
    // );
    // it(
    //   'goes through full flow, opt in some consents/newsletters, default returnUrl',
    // );
  });

  context('Login middleware', () => {
    // it('no sc_gu_u cookie, redirect to login page');
    // it('no sc_gu_la cookie, redirect to login page');
    // it('email not validated, go to verify email page');
    // it('recently validated, go to consents flow');
    // it('not recently validated, go to login page');
    // it('generic idapi error');
  });

  context('Newsletters page', () => {
    // it('correct newsletters shown for uk, none checked by default');
    // it('correct newsletters shown for us, none checked by default');
    // it('correct newsletters shown for aus, none checked by default');
    // it('correct newsletters shown for row/default, none checked by default');
    // it(
    //  'navigate back to newsletters page after saving will preserve newsletters'
    // );
    // it(
    //  'navigate back to newsletters page after will let you change and save selections'
    // );
    // it('generic idapi error');
  });

  context('Contact options page', () => {
    // it('shows correct contact options, none checked by default');
    // it(
    //  'navigate back to contact options page after saving will preserve consents'
    // );
    // it(
    //  'navigate back to contact options page after saving will let you change and save selections'
    // );
    // it('generic idapi error');
  });

  context('Your data page', () => {
    // it('correct consent shown');
    // it('generic idapi error');
  });

  context('Review page', () => {
    // it('correct options shown based on user consent/newsletter selections');
    // it('default return url link');
    // it('query parameter based return url link');
    // it('generic idapi error');
  });
});
