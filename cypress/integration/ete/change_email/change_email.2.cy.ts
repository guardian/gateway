import { randomMailosaurEmail } from '../../../support/commands/testUser';

describe('Change email', () => {
  it('change email flow successful', () => {
    cy.createTestUser({
      isUserEmailValidated: true,
    }).then(({ cookies }) => {
      // SC_GU_U is required for the cy.updateTestUser
      const scGuU = cookies.find((cookie) => cookie.key === 'SC_GU_U');
      if (!scGuU) throw new Error('SC_GU_U cookie not found');
      cy.setCookie('SC_GU_U', scGuU?.value);

      const timeRequestWasMade = new Date();

      const newEmail = randomMailosaurEmail();

      cy.updateTestUser({
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
