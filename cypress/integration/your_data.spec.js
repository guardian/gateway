/// <reference types='cypress' />

const PageYourData = require('../support/pages/your_data_page');

describe('Your data page', () => {
  const page = new PageYourData();

  before(() => {
    cy.idapiMockPurge();
  });

  beforeEach(function () {
    page.goto();
  });

  context('Valid verification token', () => {
    it('displays the your data page', () => {
      const fakeSuccessResponse = {
        cookies: {
          values: [
            {
              key: 'GU_U',
              value: 'FAKE_VALUE_0',
            },
            {
              key: 'SC_GU_LA',
              value: 'FAKE_VALUE_1',
              sessionCookie: true,
            },
            {
              key: 'SC_GU_U',
              value: 'FAKE_VALUE_2',
            },
          ],
          expiresAt: 1,
        },
      };
      cy.idapiMock(200, fakeSuccessResponse);
      page.goto('abcde');
      cy.contains(PageYourData.CONTENT.PAGE_TITLE);
    });
  });
});
