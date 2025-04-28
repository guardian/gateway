import { randomMailosaurEmail } from '../../support/commands/testUser';

describe('Change email', () => {
	it('change email flow successful', () => {
		cy.createTestUser({
			isUserEmailValidated: true,
		}).then(({ idapiUserId }) => {
			const timeRequestWasMade = new Date();
			const newEmail = randomMailosaurEmail();

			// Updating the user's email address sends them
			// an email with a link to confirm the change
			cy.updateTestUser(idapiUserId, {
				primaryEmailAddress: newEmail,
			});

			cy.checkForEmailAndGetDetails(
				newEmail,
				timeRequestWasMade,
				/change-email\/([^"]*)/,
			).then(({ token }) => {
				cy.visit(`/change-email/${token}`);
				cy.contains('Success! Your email address has been updated.');
			});
		});
	});

	it('change email flow unsuccessful', () => {
		cy.visit(`/change-email/bad_token`);
		cy.contains(
			'The email change link you followed has expired or was invalid.',
		);
	});
});
