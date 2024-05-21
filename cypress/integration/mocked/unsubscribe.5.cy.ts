import { injectAndCheckAxe } from '../../support/cypress-axe';

describe('Unsubscribe newsletter/marketing email', () => {
	beforeEach(() => {
		cy.mockPurge();
	});

	context('a11y checks', () => {
		it('Has no detectable a11y violations on unsubscribe complete page', () => {
			cy.mockNext(200);
			cy.visit(
				'/unsubscribe/newsletter/pushing-buttons%3A1000000%3A1677075570/token',
			);
			injectAndCheckAxe();
		});

		it('Has no detectable a11y violations on unsubscribe error page', () => {
			cy.mockNext(400);
			cy.visit(
				'/unsubscribe/newsletter/pushing-buttons%3A1000000%3A1677075570/token',
			);
			injectAndCheckAxe();
		});
	});

	context('unsubscribe flow', () => {
		it('should be able to unsubscribe from a newsletter', () => {
			cy.mockNext(200);
			cy.visit(
				'/unsubscribe/newsletter/pushing-buttons%3A1000000%3A1677075570/token',
			);
			cy.contains('You have been unsubscribed.');
		});

		it('should be able to unsubscribe from all marketing consents and newsletters', () => {
			cy.mockNext(200);
			cy.request('POST', '/unsubscribe-all/1000000%3A1677075570/token').then(
				(response) => {
					expect(response.status).to.eq(200);
				},
			);
		});

		it('should be able to unsubscribe from a marketing email', () => {
			cy.mockNext(200);
			cy.visit('/unsubscribe/marketing/supporter%3A1000000%3A1677075570/token');
			cy.contains('You have been unsubscribed.');
		});

		it('should be able to handle a unsubscribe error if emailType is not newsletter/marketing', () => {
			cy.visit('/unsubscribe/fake/supporter%3A1000000%3A1677075570/token');
			cy.contains('Unable to unsubscribe.');
		});

		it('should be able to handle a unsubscribe error if data is not valid', () => {
			cy.visit(
				'/unsubscribe/newsletter/pushing-buttons%3A1000000%3A16770755abc70/token',
			);
			cy.contains('Unable to unsubscribe.');

			cy.visit('/unsubscribe/newsletter/pushing-buttons%3A1000000%3A/token');
			cy.contains('Unable to unsubscribe.');

			cy.visit('/unsubscribe/newsletter/pushing-buttons-bad-data/token');
			cy.contains('Unable to unsubscribe.');
		});

		it('should be able to handle a unsubscribe error if api error', () => {
			cy.mockNext(400);
			cy.visit('/unsubscribe/fake/supporter%3A1000000%3A1677075570/token');
			cy.contains('Unable to unsubscribe.');
		});
	});
});
