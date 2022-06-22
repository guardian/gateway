import React, { createRef, useEffect, useRef } from 'react';
import { css } from '@emotion/react';
import { MainGrid } from '@/client/layouts/MainGrid';
import { Header } from '@/client/components/Header';
import { Footer } from '@/client/components/Footer';
import { PasswordInput } from '@/client/components/PasswordInput';
import { Nav, TabType } from '@/client/components/Nav';
import { Button, Link } from '@guardian/source-react-components';
import { CsrfFormField } from '@/client/components/CsrfFormField';
import { Terms } from '@/client/components/Terms';
import { SocialButtons } from '@/client/components/SocialButtons';
import { gridItemSignInAndRegistration } from '@/client/styles/Grid';
import { from, textSans, border, space } from '@guardian/source-foundations';
import { Divider } from '@guardian/source-react-components-development-kitchen';
import { CaptchaErrors, SignInErrors } from '@/shared/model/Errors';
import { EmailInput } from '@/client/components/EmailInput';
import { buildUrlWithQueryParams } from '@/shared/lib/routeUtils';
import { QueryParams } from '@/shared/model/QueryParams';
import { DetailedRecaptchaError } from '@/client/components/DetailedRecaptchaError';
import useRecaptcha, {
  RecaptchaElement,
} from '@/client/lib/hooks/useRecaptcha';
import locations from '@/shared/lib/locations';
import { RefTrackingFormFields } from '@/client/components/RefTrackingFormFields';
import { trackFormFocusBlur, trackFormSubmit } from '@/client/lib/ophan';
import { logger } from '@/client/lib/clientSideLogger';

export type SignInProps = {
  queryParams: QueryParams;
  email?: string;
  error?: string;
  recaptchaSiteKey: string;
  // The register tab is hidden on the /reauthenticate version of the sign-in
  // page, but displayed on the vanilla /signin version.
  displayRegisterTab: boolean;
};

const passwordInput = css`
  margin-top: ${space[2]}px;

  ${from.mobileMedium} {
    margin-top: ${space[3]}px;
  }
`;

const resetPassword = css`
  ${textSans.small()}
`;

const signInButton = css`
  width: 100%;
  justify-content: center;
  margin-top: ${space[5]}px;
  ${from.mobileMedium} {
    margin-top: 16px;
  }
`;

const divider = css`
  /* Undoes the negative margin */
  margin-bottom: 0;
  margin-top: ${space[4]}px;
  ${from.mobileMedium} {
    margin-top: ${space[6]}px;
  }
  :before,
  :after {
    content: '';
    flex: 1 1;
    border-bottom: 1px solid ${border.secondary};
    margin: 8px;
  }
`;

const Links = ({ children }: { children: React.ReactNode }) => (
  <div
    css={css`
      margin-top: ${space[2]}px;
      ${from.tablet} {
        margin-top: 6px;
      }
    `}
  >
    {children}
  </div>
);

const getErrorContext = (error: string | undefined) => {
  if (error === SignInErrors.ACCOUNT_ALREADY_EXISTS) {
    return (
      <>
        We cannot sign you in with your social account credentials. Please enter
        your account password below to sign in.
      </>
    );
  }
};

const showSocialButtons = (
  error: string | undefined,
  queryParams: QueryParams,
) => {
  if (error !== SignInErrors.ACCOUNT_ALREADY_EXISTS) {
    return (
      <>
        <Divider
          spaceAbove="loose"
          displayText="or continue with"
          cssOverrides={divider}
        />
        <SocialButtons queryParams={queryParams} />
      </>
    );
  } else {
    return (
      // force a minimum bottom margin if social buttons are not present
      <span
        css={css`
          display: inline-block;
          height: 60px;
          ${from.desktop} {
            height: ${space[24]}px;
          }
        `}
      />
    );
  }
};

// TODO: migrate to use the MainForm component
export const SignIn = ({
  email,
  error: pageLevelError,
  queryParams,
  recaptchaSiteKey,
  displayRegisterTab,
}: SignInProps) => {
  const formTrackingName = 'sign-in';
  const signInFormRef = createRef<HTMLFormElement>();
  const recaptchaElementRef = useRef<HTMLDivElement>(null);
  const captchaElement = recaptchaElementRef.current ?? 'signin-recaptcha';
  const { clientId } = queryParams;
  const isJobs = clientId === 'jobs';
  const {
    token,
    error: recaptchaError,
    expired,
    requestCount,
    executeCaptcha,
  } = useRecaptcha(recaptchaSiteKey, captchaElement);

  // We want to show a more detailed reCAPTCHA error if
  // the user has requested a check more than once.
  const recaptchaCheckFailed = recaptchaError || expired;
  if (recaptchaCheckFailed) {
    logger.info('Recaptcha check failed');
  }

  const showErrorContext = recaptchaCheckFailed && requestCount > 1;
  const reCaptchaErrorMessage = showErrorContext
    ? CaptchaErrors.RETRY
    : CaptchaErrors.GENERIC;
  const reCaptchaErrorContext = showErrorContext ? (
    <DetailedRecaptchaError />
  ) : undefined;

  // Form is only submitted when a valid recaptcha token is returned.
  useEffect(() => {
    const registerFormElement = signInFormRef.current;
    if (token) {
      registerFormElement?.submit();
    }
  }, [signInFormRef, token]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    trackFormSubmit(formTrackingName);
    executeCaptcha();
  };

  const signInTab: TabType = {
    displayText: 'Sign in',
    queryParams: queryParams,
    linkTo: '/signin',
    isActive: true,
  };

  const registerTab: TabType = {
    displayText: 'Register',
    queryParams: queryParams,
    linkTo: '/register',
    isActive: false,
  };

  const tabs: TabType[] = displayRegisterTab
    ? [signInTab, registerTab]
    : [signInTab];

  return (
    <>
      <Header />
      <Nav tabs={tabs} />
      <MainGrid
        gridSpanDefinition={gridItemSignInAndRegistration}
        errorOverride={
          recaptchaCheckFailed ? reCaptchaErrorMessage : pageLevelError
        }
        errorContext={
          reCaptchaErrorContext
            ? reCaptchaErrorContext
            : getErrorContext(pageLevelError)
        }
        errorReportUrl={showErrorContext ? locations.REPORT_ISSUE : undefined}
      >
        <form
          method="post"
          action={buildUrlWithQueryParams('/signin', {}, queryParams)}
          ref={signInFormRef}
          onSubmit={handleSubmit}
          onFocus={(e) => trackFormFocusBlur(formTrackingName, e, 'focus')}
          onBlur={(e) => trackFormFocusBlur(formTrackingName, e, 'blur')}
        >
          <RecaptchaElement id="signin-recaptcha" />
          <CsrfFormField />
          <RefTrackingFormFields />
          <EmailInput defaultValue={email} />
          <div css={passwordInput}>
            <PasswordInput label="Password" autoComplete="current-password" />
          </div>
          <Links>
            <Link
              href={buildUrlWithQueryParams('/reset-password', {}, queryParams)}
              cssOverrides={resetPassword}
            >
              Reset password
            </Link>
          </Links>
          <Terms isJobs={isJobs} />
          <Button css={signInButton} type="submit" data-cy="sign-in-button">
            Sign in
          </Button>
        </form>
        {showSocialButtons(pageLevelError, queryParams)}
      </MainGrid>
      <Footer />
    </>
  );
};
