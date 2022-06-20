import * as SignIn from '../shared/sign_in.shared';

describe('Sign in flow, Okta enabled', () => {
  beforeEach(() => {
    SignIn.beforeEach();
  });

  context('Terms and Conditions links', () => {
    it(...SignIn.linksToTheGoogleTermsOfServicePage(true));
    it(...SignIn.linksToTheGooglePrivacyPolicyPage(true));
    it(...SignIn.linksToTheGuardianTermsAndConditionsPage(true));
    it(...SignIn.linksToTheGuardianPrivacyPolicyPage(true));
    it(
      ...SignIn.linksToTheGuardianJobsTermsAndConditionsPageWhenJobsClientIdSet(
        true,
      ),
    );
    it(
      ...SignIn.linksToTheGuardianJobsPrivacyPolicyPageWhenJobsClientIdSet(
        true,
      ),
    );
  });

  it(...SignIn.persistsTheClientIdWhenNavigatingAway(true));
  it(...SignIn.appliesFormValidationToEmailAndPasswordInputFields(true));
  it(...SignIn.showsAMessageWhenCredentialsAreInvalid(true));
  it(...SignIn.correctlySignsInAnExistingUser(true));
  it(...SignIn.navigatesToResetPassword(true));
  it(...SignIn.navigatesToRegistration(true));
  it(...SignIn.respectsTheReturnUrlQueryParam(true));
  it(...SignIn.removesEncryptedEmailParameterFromQueryString(true));
  it(
    ...SignIn.removesEncryptedEmailParameterAndPreservesAllOtherValidParameters(
      true,
    ),
  );
  it(
    ...SignIn.showsRecaptchaErrorsWhenTheUserTriesToSignInOfflineAndAllowsSignInWhenBackOnline(
      true,
    ),
  );
  it(...SignIn.redirectsToOptInPrompt());
  it(...SignIn.hitsAccessTokenRateLimitAndRecoversTokenAfterTimeout(true));

  it(...SignIn.redirectsCorrectlyForSocialSignIn(true));
  it(
    ...SignIn.showsAnErrorMessageAndInformationParagraphWhenAccountLinkingRequiredErrorParameterIsPresent(
      true,
    ),
  );
  it(
    ...SignIn.doesNotDisplaySocialButtonsWhenAccountLinkingRequiredErrorParameterIsPresent(
      true,
    ),
  );

  it('sets emailValidated flag on oauth callback', () => {
    // this is a specific test case for new user registrations in Okta
    // In Okta new social registered users are added to the GuardianUser-EmailValidated group
    // by default, but the custom emailValidated field is not defined/set to false
    // this causes problems in legacy code, where the emailValidated flag is not set but the group is
    // so we need to set the flag to true when the user is added to the group
    // we do this on the oauth callback route /oauth/authorization-code/callback
    // where we update the user profile with the emailValidated flag if the user is in the GuardianUser-EmailValidated group but the emailValidated is falsy

    // This test checks this behaviour by first getting a user into this state
    // i.e user.profile.emailValidated = false, and user groups has GuardianUser-EmailValidated

    // first we have to get the id of the GuardianUser-EmailValidated group
    cy.findEmailValidatedOktaGroupId().then((groupId) => {
      // next we create a test user
      cy.createTestUser({}).then(({ emailAddress, finalPassword }) => {
        // we get the user profile object from Okta
        cy.getTestOktaUser(emailAddress).then((user) => {
          const { id, profile } = user;
          // check the user profile has the emailValidated flag set to false
          expect(profile.emailValidated).to.be.false;
          // next check the user groups
          cy.getOktaUserGroups(id).then((groups) => {
            // make sure the user is not in the GuardianUser-EmailValidated group
            const group = groups.find((g) => g.id === groupId);
            expect(group).not.to.exist;

            // and add them to the group if this is the case
            cy.addOktaUserToGroup(id, groupId);

            // at this point the user is in the correct state
            // so we attempt to sign them in
            cy.visit(
              `/signin?returnUrl=${encodeURIComponent(
                `https://${Cypress.env('BASE_URI')}/consents`,
              )}&useOkta=true`,
            );
            cy.get('input[name=email]').type(emailAddress);
            cy.get('input[name=password]').type(finalPassword);
            cy.get('[data-cy="sign-in-button"]').click();
            cy.url().should('include', '/consents');

            // at this point the oauth callback route will have run, so we can recheck the user profile to see if the emailValidated flag has been set
            cy.getTestOktaUser(id).then((user) => {
              const { profile } = user;
              expect(profile.emailValidated).to.be.true;
            });

            // and the user should also be in the group
            cy.getOktaUserGroups(id).then((groups) => {
              const group = groups.find((g) => g.id === groupId);
              expect(group).to.exist;
            });
          });
        });
      });
    });
  });
});
