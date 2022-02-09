import * as SignIn from './sign_in.shared';

describe('Sign in flow, Okta disabled', () => {
  context('Terms and Conditions links', () => {
    it(...SignIn.linksToTheGoogleTermsOfServicePage());
    it(...SignIn.linksToTheGooglePrivacyPolicyPage());
    it(...SignIn.linksToTheGuardianTermsAndConditionsPage());
    it(...SignIn.linksToTheGuardianPrivacyPolicyPage());
    it(
      ...SignIn.linksToTheGuardianJobsTermsAndConditionsPageWhenJobsClientIdSet(),
    );
    it(...SignIn.linksToTheGuardianJobsPrivacyPolicyPageWhenJobsClientIdSet());
  });
  it(...SignIn.persistsTheClientIdWhenNavigatingAway());
  it(...SignIn.appliesFormValidationToEmailAndPasswordInputFields());
  it(...SignIn.showsAMessageWhenCredentialsAreInvalid());
  it(...SignIn.correctlySignsInAnExistingUser());
  it(...SignIn.navigatesToResetPassword());
  it(...SignIn.navigatesToRegistration());
  it(...SignIn.respectsTheReturnUrlQueryParam());
  it(...SignIn.redirectsCorrectlyForSocialSignIn());
  it(...SignIn.removesEncryptedEmailParameterFromQueryString());
  it(
    ...SignIn.removesEncryptedEmailParameterAndPreservesAllOtherValidParameters(),
  );
  it(
    ...SignIn.showsAnErrorMessageAndInformationParagraphWhenAccountLinkingRequiredErrorParameterIsPresent(),
  );
  it(
    ...SignIn.doesNotDisplaySocialButtonsWhenAccountLinkingRequiredErrorParameterIsPresent(),
  );
  it(
    ...SignIn.showsRecaptchaErrorsWhenTheUserTriesToSignInOfflineAndAllowsSignInWhenBackOnline(),
  );
});
