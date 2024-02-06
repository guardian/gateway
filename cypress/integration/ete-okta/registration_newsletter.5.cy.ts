import { GEOLOCATION_CODES } from '../../support/geolocation';

// saturday edition geolocation tests
describe('Saturday Edition Geolocation', () => {
	it('should show the Saturday Edition newsletter for GB', () => {
		// Intercept the geolocation header and set it to GB to show Saturday Edition.
		cy.intercept(`https://${Cypress.env('BASE_URI')}/**/*`, (req) => {
			// eslint-disable-next-line functional/immutable-data
			req.headers['x-gu-geolocation'] = GEOLOCATION_CODES.GB;
		});
		cy.enableCMP();
		cy.visit(`/register/email`);
		cy.acceptCMP();
		cy.contains('Saturday Edition').should('exist');

		cy.createTestUser({
			isUserEmailValidated: true,
		}).then(({ emailAddress, finalPassword }) => {
			cy.visit(
				`/signin?returnUrl=${encodeURIComponent(
					`https://${Cypress.env('BASE_URI')}/welcome/google`,
				)}`,
			);
			cy.get('input[name=email]').type(emailAddress);
			cy.get('input[name=password]').type(finalPassword);
			cy.get('[data-cy="main-form-submit-button"]').click();
			cy.url().should('include', '/welcome/google');
			cy.contains('Saturday Edition').should('exist');
		});
	});
	it('should show the Saturday Edition newsletter for EU', () => {
		// Intercept the geolocation header and set it to FR to show Saturday Edition.
		cy.intercept(`https://${Cypress.env('BASE_URI')}/**/*`, (req) => {
			// eslint-disable-next-line functional/immutable-data
			req.headers['x-gu-geolocation'] = GEOLOCATION_CODES.EUROPE;
		});
		cy.enableCMP();
		cy.visit(`/register/email`);
		cy.acceptCMP();
		cy.contains('Saturday Edition').should('exist');

		cy.createTestUser({
			isUserEmailValidated: true,
		}).then(({ emailAddress, finalPassword }) => {
			cy.visit(
				`/signin?returnUrl=${encodeURIComponent(
					`https://${Cypress.env('BASE_URI')}/welcome/google`,
				)}`,
			);
			cy.get('input[name=email]').type(emailAddress);
			cy.get('input[name=password]').type(finalPassword);
			cy.get('[data-cy="main-form-submit-button"]').click();
			cy.url().should('include', '/welcome/google');
			cy.contains('Saturday Edition').should('exist');
		});
	});
	it('should show the Saturday Edition newsletter for ROW', () => {
		// Intercept the geolocation header and set it to ROW to show Saturday Edition.
		cy.intercept(`https://${Cypress.env('BASE_URI')}/**/*`, (req) => {
			// eslint-disable-next-line functional/immutable-data
			req.headers['x-gu-geolocation'] = GEOLOCATION_CODES.OTHERS;
		});
		cy.enableCMP();
		cy.visit(`/register/email`);
		cy.acceptCMP();
		cy.contains('Saturday Edition').should('exist');

		cy.createTestUser({
			isUserEmailValidated: true,
		}).then(({ emailAddress, finalPassword }) => {
			cy.visit(
				`/signin?returnUrl=${encodeURIComponent(
					`https://${Cypress.env('BASE_URI')}/welcome/google`,
				)}`,
			);
			cy.get('input[name=email]').type(emailAddress);
			cy.get('input[name=password]').type(finalPassword);
			cy.get('[data-cy="main-form-submit-button"]').click();
			cy.url().should('include', '/welcome/google');
			cy.contains('Saturday Edition').should('exist');
		});
	});
	it('should not show the Saturday Edition newsletter for US', () => {
		// Intercept the geolocation header and set it to US to show Saturday Edition.
		cy.intercept(`https://${Cypress.env('BASE_URI')}/**/*`, (req) => {
			// eslint-disable-next-line functional/immutable-data
			req.headers['x-gu-geolocation'] = GEOLOCATION_CODES.AMERICA;
		});
		cy.enableCMP();
		cy.visit(`/register/email`);
		cy.acceptCMP();
		cy.contains('Saturday Edition').should('not.exist');

		cy.createTestUser({
			isUserEmailValidated: true,
		}).then(({ emailAddress, finalPassword }) => {
			cy.visit(
				`/signin?returnUrl=${encodeURIComponent(
					`https://${Cypress.env('BASE_URI')}/welcome/google`,
				)}`,
			);
			cy.get('input[name=email]').type(emailAddress);
			cy.get('input[name=password]').type(finalPassword);
			cy.get('[data-cy="main-form-submit-button"]').click();
			cy.url().should('include', '/welcome/google');
			cy.contains('Saturday Edition').should('not.exist');
		});
	});
	it('should not show the Saturday Edition newsletter for AU', () => {
		// Intercept the geolocation header and set it to US to show Saturday Edition.
		cy.intercept(`https://${Cypress.env('BASE_URI')}/**/*`, (req) => {
			// eslint-disable-next-line functional/immutable-data
			req.headers['x-gu-geolocation'] = GEOLOCATION_CODES.AUSTRALIA;
		});
		cy.enableCMP();
		cy.visit(`/register/email`);
		cy.acceptCMP();
		cy.contains('Saturday Edition').should('not.exist');

		cy.createTestUser({
			isUserEmailValidated: true,
		}).then(({ emailAddress, finalPassword }) => {
			cy.visit(
				`/signin?returnUrl=${encodeURIComponent(
					`https://${Cypress.env('BASE_URI')}/welcome/google`,
				)}`,
			);
			cy.get('input[name=email]').type(emailAddress);
			cy.get('input[name=password]').type(finalPassword);
			cy.get('[data-cy="main-form-submit-button"]').click();
			cy.url().should('include', '/welcome/google');
			cy.contains('Saturday Edition').should('not.exist');
		});
	});
});
