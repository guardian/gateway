import { setMvtId } from '../../support/commands/setMvtId';
import {
  randomMailosaurEmail,
  randomPassword,
} from '../../support/commands/testUser';
import CommunicationsPage from '../../support/pages/onboarding/communications_page';
import NewslettersPage from '../../support/pages/onboarding/newsletters_page';
import ReviewPage from '../../support/pages/onboarding/review_page';
import YourDataPage from '../../support/pages/onboarding/your_data_page';

describe('Onboarding flow', () => {
  beforeEach(() => {
    // Intercept the external redirect page.
    // We just want to check that the redirect happens, not that the page loads.
    cy.intercept('GET', 'https://m.code.dev-theguardian.com/', (req) => {
      req.reply(200);
    });
    setMvtId('0');
  });

  context('Full flow', () => {
    it('goes through the full flow, opt in all consents/marketing, preserve returnUrl', () => {
      const returnUrl =
        'https%3A%2F%2Fm.code.dev-theguardian.com%2Ftravel%2F2019%2Fdec%2F18%2Ffood-culture-tour-bethlehem-palestine-east-jerusalem-photo-essay';
      const unregisteredEmail = randomMailosaurEmail();

      cy.visit(`/register?returnUrl=${returnUrl}`);

      const timeRequestWasMade = new Date();
      cy.get('input[name=email]').type(unregisteredEmail);
      cy.get('[data-cy="main-form-submit-button"]').click();

      cy.contains('Check your email inbox');
      cy.contains(unregisteredEmail);
      cy.contains('Resend email');
      cy.contains('Change email address');

      cy.checkForEmailAndGetDetails(
        unregisteredEmail,
        timeRequestWasMade,
        /welcome\/([^"]*)/,
      ).then(({ body, token }) => {
        expect(body).to.have.string('Complete registration');
        cy.enableCMP();
        cy.setCookie('GU_geo_country', 'FR');

        cy.visit(`/welcome/${token}`);
        cy.acceptCMP();

        cy.contains('Save and continue');

        cy.get('input[name=password]').type(randomPassword());

        cy.get('[data-cy="change-password-button"]').click();

        cy.url().should('include', CommunicationsPage.URL);
        cy.url().should('include', `returnUrl=${returnUrl}`);

        CommunicationsPage.backButton().should('not.exist');
        CommunicationsPage.allCheckboxes().should('not.be.checked');
        CommunicationsPage.allCheckboxes().click({ multiple: true });

        CommunicationsPage.saveAndContinueButton().click();

        cy.url().should('include', NewslettersPage.URL);
        cy.url().should('include', `returnUrl=${returnUrl}`);

        NewslettersPage.backButton()
          .should('have.attr', 'href')
          .and('include', CommunicationsPage.URL);

        NewslettersPage.allCheckboxes()
          .should('not.be.checked')
          .click({ multiple: true });

        NewslettersPage.saveAndContinueButton().click();

        cy.url().should('include', YourDataPage.URL);
        cy.url().should('include', `returnUrl=${returnUrl}`);

        YourDataPage.backButton()
          .should('have.attr', 'href')
          .and('include', NewslettersPage.URL);

        YourDataPage.personalisedAdvertisingOptInInput().should(
          'not.be.checked',
        );

        YourDataPage.personalisedAdvertisingOptInSwitch().click();
        YourDataPage.marketingOptInSwitch().should('be.checked');
        YourDataPage.personalisedAdvertisingOptInInput().should('be.checked');

        YourDataPage.saveAndContinueButton().click();

        cy.url().should('include', ReviewPage.URL);
        cy.url().should('include', `returnUrl=${returnUrl}`);

        ReviewPage.backButton().should('not.exist');
        ReviewPage.saveAndContinueButton().should('not.exist');

        // contains opted in newsletters
        cy.contains('Down to Earth');
        cy.contains('The Long Read');
        cy.contains('First Edition');

        // contains consents
        cy.contains(ReviewPage.CONTENT.SUPPORTER_CONSENT);
        cy.contains(ReviewPage.CONTENT.PROFILING_CONSENT);
        cy.contains(ReviewPage.CONTENT.PERSONALISED_ADVERTISING_CONSENT);

        // does not contain messaging encouraging user to consider other newsletters
        cy.contains(ReviewPage.CONTENT.NO_NEWSLETTERS_TITLE).should(
          'not.exist',
        );

        ReviewPage.returnButton()
          .should('have.attr', 'href')
          .and('include', decodeURIComponent(returnUrl));

        ReviewPage.returnButton().click();

        cy.url().should('include', decodeURIComponent(returnUrl));
      });
    });

    it('goes through full fow, opt out of all consents/newsletters, preserve returnUrl', () => {
      const returnUrl =
        'https%3A%2F%2Fm.code.dev-theguardian.com%2Ftravel%2F2019%2Fdec%2F18%2Ffood-culture-tour-bethlehem-palestine-east-jerusalem-photo-essay';
      const unregisteredEmail = randomMailosaurEmail();

      cy.visit(`/register?returnUrl=${returnUrl}`);

      const timeRequestWasMade = new Date();
      cy.get('input[name=email]').type(unregisteredEmail);
      cy.get('[data-cy="main-form-submit-button"]').click();

      cy.contains('Check your email inbox');
      cy.contains(unregisteredEmail);
      cy.contains('Resend email');
      cy.contains('Change email address');

      cy.checkForEmailAndGetDetails(
        unregisteredEmail,
        timeRequestWasMade,
        /welcome\/([^"]*)/,
      ).then(({ body, token }) => {
        expect(body).to.have.string('Complete registration');
        cy.enableCMP();
        cy.setCookie('GU_geo_country', 'FR');

        cy.visit(`/welcome/${token}`);
        cy.acceptCMP();

        cy.contains('Save and continue');

        cy.get('input[name=password]').type(randomPassword());

        cy.get('[data-cy="change-password-button"]').click();

        cy.url().should('include', CommunicationsPage.URL);
        cy.url().should('include', `returnUrl=${returnUrl}`);

        CommunicationsPage.backButton().should('not.exist');
        CommunicationsPage.allCheckboxes().should('not.be.checked');

        CommunicationsPage.saveAndContinueButton().click();

        cy.url().should('include', NewslettersPage.URL);
        cy.url().should('include', `returnUrl=${returnUrl}`);

        NewslettersPage.backButton()
          .should('have.attr', 'href')
          .and('include', CommunicationsPage.URL);

        NewslettersPage.allCheckboxes().should('not.be.checked');

        NewslettersPage.saveAndContinueButton().click();

        cy.url().should('include', YourDataPage.URL);
        cy.url().should('include', `returnUrl=${returnUrl}`);

        YourDataPage.backButton()
          .should('have.attr', 'href')
          .and('include', NewslettersPage.URL);

        YourDataPage.personalisedAdvertisingOptInInput().should(
          'not.be.checked',
        );
        YourDataPage.marketingOptInSwitch().should('be.checked');

        YourDataPage.marketingOptInSwitch().click({ force: true });

        YourDataPage.marketingOptInSwitch().should('not.be.checked');
        YourDataPage.personalisedAdvertisingOptInInput().should(
          'not.be.checked',
        );

        YourDataPage.saveAndContinueButton().click();

        cy.url().should('include', ReviewPage.URL);
        cy.url().should('include', `returnUrl=${returnUrl}`);

        ReviewPage.backButton().should('not.exist');
        ReviewPage.saveAndContinueButton().should('not.exist');

        // contains opted in newsletters
        cy.contains('Down to Earth').should('not.exist');
        cy.contains('The Long Read').should('not.exist');
        cy.contains('First Edition').should('not.exist');

        // contains consents
        cy.contains(ReviewPage.CONTENT.SUPPORTER_CONSENT).should('not.exist');
        cy.contains(ReviewPage.CONTENT.PROFILING_CONSENT).should('not.exist');
        cy.contains(ReviewPage.CONTENT.PERSONALISED_ADVERTISING_CONSENT).should(
          'not.exist',
        );

        // contains messaging encouraging user to consider other newsletters
        cy.contains(ReviewPage.CONTENT.NO_NEWSLETTERS_TITLE).should('exist');

        ReviewPage.returnButton()
          .should('have.attr', 'href')
          .and('include', decodeURIComponent(returnUrl));

        ReviewPage.returnButton().click();

        cy.url().should('include', decodeURIComponent(returnUrl));
      });
    });
  });
});
