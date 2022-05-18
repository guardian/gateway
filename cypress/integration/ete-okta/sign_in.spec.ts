import * as SignIn from '../ete/sign_in/sign_in.shared';

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
});
