import { GEOLOCATION_CODES } from '../../support/geolocation';
import { RegistrationNewsletterDescriptions } from '../../support/newsletters';

// saturday edition geolocation tests
describe('Saturday Edition Geolocation', () => {
	it('should show the Saturday Edition newsletter for GB', () => {
		// Intercept the geolocation header and set it to GB to show Saturday Edition.
		cy.intercept(`https://${Cypress.env('BASE_URI')}/**/*`, (req) => {
			// eslint-disable-next-line functional/immutable-data
			req.headers['x-gu-geolocation'] = GEOLOCATION_CODES.GB;
		});
		cy.visit(`/register/email`);
		cy.contains('Saturday Edition').should('exist');
		cy.contains(RegistrationNewsletterDescriptions.saturdayEdition).should(
			'exist',
		);

		cy.createTestUser({
			isUserEmailValidated: true,
		}).then(({ emailAddress, finalPassword }) => {
			cy.visit(
				`/signin?returnUrl=${encodeURIComponent(
					`https://${Cypress.env('BASE_URI')}/welcome/google`,
				)}&usePasswordSignIn=true`,
			);
			cy.get('input[name=email]').type(emailAddress);
			cy.get('input[name=password]').type(finalPassword);
			cy.get('[data-cy="main-form-submit-button"]').click();
			cy.url().should('include', '/welcome/google');
			cy.contains('Saturday Edition').should('exist');
			cy.contains(RegistrationNewsletterDescriptions.saturdayEdition).should(
				'exist',
			);
		});
	});
	it('should show the Saturday Edition newsletter for EU', () => {
		// Intercept the geolocation header and set it to FR to show Saturday Edition.
		cy.intercept(`https://${Cypress.env('BASE_URI')}/**/*`, (req) => {
			// eslint-disable-next-line functional/immutable-data
			req.headers['x-gu-geolocation'] = GEOLOCATION_CODES.EUROPE;
		});
		cy.visit(`/register/email`);
		cy.contains('Saturday Edition').should('exist');
		cy.contains(RegistrationNewsletterDescriptions.saturdayEdition).should(
			'exist',
		);

		cy.createTestUser({
			isUserEmailValidated: true,
		}).then(({ emailAddress, finalPassword }) => {
			cy.visit(
				`/signin?returnUrl=${encodeURIComponent(
					`https://${Cypress.env('BASE_URI')}/welcome/google`,
				)}&usePasswordSignIn=true`,
			);
			cy.get('input[name=email]').type(emailAddress);
			cy.get('input[name=password]').type(finalPassword);
			cy.get('[data-cy="main-form-submit-button"]').click();
			cy.url().should('include', '/welcome/google');
			cy.contains('Saturday Edition').should('exist');
			cy.contains(RegistrationNewsletterDescriptions.saturdayEdition).should(
				'exist',
			);
		});
	});
	it('should show the Saturday Edition newsletter for ROW', () => {
		// Intercept the geolocation header and set it to ROW to show Saturday Edition.
		cy.intercept(`https://${Cypress.env('BASE_URI')}/**/*`, (req) => {
			// eslint-disable-next-line functional/immutable-data
			req.headers['x-gu-geolocation'] = GEOLOCATION_CODES.OTHERS;
		});
		cy.visit(`/register/email`);
		cy.contains('Saturday Edition').should('exist');
		cy.contains(RegistrationNewsletterDescriptions.saturdayEdition).should(
			'exist',
		);

		cy.createTestUser({
			isUserEmailValidated: true,
		}).then(({ emailAddress, finalPassword }) => {
			cy.visit(
				`/signin?returnUrl=${encodeURIComponent(
					`https://${Cypress.env('BASE_URI')}/welcome/google`,
				)}&usePasswordSignIn=true`,
			);
			cy.get('input[name=email]').type(emailAddress);
			cy.get('input[name=password]').type(finalPassword);
			cy.get('[data-cy="main-form-submit-button"]').click();
			cy.url().should('include', '/welcome/google');
			cy.contains('Saturday Edition').should('exist');
			cy.contains(RegistrationNewsletterDescriptions.saturdayEdition).should(
				'exist',
			);
		});
	});
	it('should show the US bundle for US', () => {
		// Intercept the geolocation header and set it to US to show Saturday Edition.
		cy.intercept(`https://${Cypress.env('BASE_URI')}/**/*`, (req) => {
			// eslint-disable-next-line functional/immutable-data
			req.headers['x-gu-geolocation'] = GEOLOCATION_CODES.AMERICA;
		});
		cy.visit(`/register/email`);
		cy.contains('Saturday Edition').should('not.exist');
		cy.contains('Weekend newsletters').should('exist');
		cy.contains(RegistrationNewsletterDescriptions.usBundle).should('exist');

		cy.createTestUser({
			isUserEmailValidated: true,
		}).then(({ emailAddress, finalPassword }) => {
			cy.visit(
				`/signin?returnUrl=${encodeURIComponent(
					`https://${Cypress.env('BASE_URI')}/welcome/google`,
				)}&usePasswordSignIn=true`,
			);
			cy.get('input[name=email]').type(emailAddress);
			cy.get('input[name=password]').type(finalPassword);
			cy.get('[data-cy="main-form-submit-button"]').click();
			cy.url().should('include', '/welcome/google');
			cy.contains('Saturday Edition').should('not.exist');
			cy.contains('Weekend newsletters').should('exist');
			cy.contains(RegistrationNewsletterDescriptions.usBundle).should('exist');
		});
	});
	it('should show the AU bundle for AU', () => {
		// Intercept the geolocation header and set it to US to show Saturday Edition.
		cy.intercept(`https://${Cypress.env('BASE_URI')}/**/*`, (req) => {
			// eslint-disable-next-line functional/immutable-data
			req.headers['x-gu-geolocation'] = GEOLOCATION_CODES.AUSTRALIA;
		});
		cy.visit(`/register/email`);
		cy.contains('Saturday Edition').should('not.exist');
		cy.contains('Saturday newsletters').should('exist');
		cy.contains(RegistrationNewsletterDescriptions.auBundle).should('exist');

		cy.createTestUser({
			isUserEmailValidated: true,
		}).then(({ emailAddress, finalPassword }) => {
			cy.visit(
				`/signin?returnUrl=${encodeURIComponent(
					`https://${Cypress.env('BASE_URI')}/welcome/google`,
				)}&usePasswordSignIn=true`,
			);
			cy.get('input[name=email]').type(emailAddress);
			cy.get('input[name=password]').type(finalPassword);
			cy.get('[data-cy="main-form-submit-button"]').click();
			cy.url().should('include', '/welcome/google');
			cy.contains('Saturday Edition').should('not.exist');
			cy.contains('Saturday newsletters').should('exist');
			cy.contains(RegistrationNewsletterDescriptions.auBundle).should('exist');
		});
	});
});

describe('Feast newsletter for Feast app', () => {
	it('should show the Feast newsletter if coming from feast ios', () => {
		cy.oktaGetApps('ios_feast_app').then(([app]) => {
			cy.visit(`/register/email?appClientId=${app.id}`);
			cy.contains('Feast newsletter').should('exist');
			cy.contains('Saturday Edition').should('not.exist');
			cy.contains('Weekend newsletters').should('not.exist');
			cy.contains('Saturday newsletters').should('not.exist');

			cy.createTestUser({
				isUserEmailValidated: true,
			}).then(({ emailAddress, finalPassword }) => {
				cy.visit(
					`/signin?returnUrl=${encodeURIComponent(
						`https://${Cypress.env('BASE_URI')}/welcome/google?appClientId=${app.id}`,
					)}&usePasswordSignIn=true`,
				);
				cy.get('input[name=email]').type(emailAddress);
				cy.get('input[name=password]').type(finalPassword);
				cy.get('[data-cy="main-form-submit-button"]').click();
				cy.url().should('include', '/welcome/google');
				cy.contains('Feast newsletter').should('exist');
				cy.contains('Saturday Edition').should('not.exist');
				cy.contains('Weekend newsletters').should('not.exist');
				cy.contains('Saturday newsletters').should('not.exist');
			});
		});
	});

	it('should show the Feast newsletter if coming from feast android', () => {
		cy.oktaGetApps('android_feast_app').then(([app]) => {
			cy.visit(`/register/email?appClientId=${app.id}`);
			cy.contains('Feast newsletter').should('exist');
			cy.contains('Saturday Edition').should('not.exist');
			cy.contains('Weekend newsletters').should('not.exist');
			cy.contains('Saturday newsletters').should('not.exist');

			cy.createTestUser({
				isUserEmailValidated: true,
			}).then(({ emailAddress, finalPassword }) => {
				cy.visit(
					`/signin?returnUrl=${encodeURIComponent(
						`https://${Cypress.env('BASE_URI')}/welcome/google?appClientId=${app.id}`,
					)}&usePasswordSignIn=true`,
				);
				cy.get('input[name=email]').type(emailAddress);
				cy.get('input[name=password]').type(finalPassword);
				cy.get('[data-cy="main-form-submit-button"]').click();
				cy.url().should('include', '/welcome/google');
				cy.contains('Feast newsletter').should('exist');
				cy.contains('Saturday Edition').should('not.exist');
				cy.contains('Weekend newsletters').should('not.exist');
				cy.contains('Saturday newsletters').should('not.exist');
			});
		});
	});
});

describe('Jobs newsletter for Jobs Site', () => {
	it('should show the Jobs newsletter and Saturday Edition newsletter if coming from Jobs site', () => {
		const clientId = 'jobs';
		cy.visit(`/register/email?clientId=${clientId}`);
		cy.contains('Guardian Jobs newsletter').should('exist');
		cy.contains('Saturday Edition newsletter').should('exist');
		cy.contains('Weekend newsletters').should('not.exist');
		cy.contains('Saturday newsletters').should('not.exist');

		cy.createTestUser({
			isUserEmailValidated: true,
		}).then(({ emailAddress, finalPassword }) => {
			cy.visit(
				`/signin?returnUrl=${encodeURIComponent(
					`https://${Cypress.env('BASE_URI')}/welcome/google?clientId=${clientId}`,
				)}&usePasswordSignIn=true`,
			);
			cy.get('input[name=email]').type(emailAddress);
			cy.get('input[name=password]').type(finalPassword);
			cy.get('[data-cy="main-form-submit-button"]').click();
			cy.url().should('include', '/welcome/google');
			cy.contains('Guardian Jobs newsletter').should('exist');
			cy.contains('Saturday Edition newsletter').should('exist');
			cy.contains('Weekend newsletters').should('not.exist');
			cy.contains('Saturday newsletters').should('not.exist');
		});
	});
});
