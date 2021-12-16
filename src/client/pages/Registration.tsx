import React, { createRef, useEffect, useRef } from 'react';
import { Button } from '@guardian/source-react-components';
import { PageTitle } from '@/shared/model/PageTitle';
import { Header } from '@/client/components/Header';
import { Nav } from '@/client/components/Nav';
import { Footer } from '@/client/components/Footer';
import { CsrfFormField } from '@/client/components/CsrfFormField';
import { Terms } from '@/client/components/Terms';
import { SocialButtons } from '@/client/components/SocialButtons';
import { border, space, from } from '@guardian/source-foundations';
import { css } from '@emotion/react';
import { MainGrid } from '../layouts/MainGrid';
import { gridItemSignInAndRegistration } from '../styles/Grid';
import { Divider } from '@guardian/source-react-components-development-kitchen';
import { CaptchaErrors } from '@/shared/model/Errors';
import useRecaptcha, {
  RecaptchaElement,
} from '@/client/lib/hooks/useRecaptcha';
import { DetailedRecaptchaError } from '@/client/components/DetailedRecaptchaError';
import locations from '@/shared/lib/locations';
import { EmailInput } from '@/client/components/EmailInput';
import { buildUrlWithQueryParams } from '@/shared/lib/routeUtils';
import { QueryParams } from '@/shared/model/QueryParams';
import { GeoLocation } from '@/shared/model/Geolocation';
import { RefTrackingFormFields } from '@/client/components/RefTrackingFormFields';

export type RegistrationProps = {
  returnUrl?: string;
  email?: string;
  recaptchaSiteKey: string;
  oauthBaseUrl: string;
  queryParams: QueryParams;
  geolocation?: GeoLocation;
};

const registerButton = css`
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

// TODO: migrate to use the MainForm component
export const Registration = ({
  returnUrl,
  email,
  recaptchaSiteKey,
  oauthBaseUrl,
  queryParams,
  geolocation,
}: RegistrationProps) => {
  const registerFormRef = createRef<HTMLFormElement>();
  const recaptchaElementRef = useRef<HTMLDivElement>(null);
  const captchaElement = recaptchaElementRef.current ?? 'register-recaptcha';

  const { token, error, expired, requestCount, executeCaptcha } = useRecaptcha(
    recaptchaSiteKey,
    captchaElement,
  );

  // We want to show a more detailed reCAPTCHA error if
  // the user has requested a check more than once.
  const recaptchaCheckFailed = error || expired;
  const showErrorContext = recaptchaCheckFailed && requestCount > 1;
  const reCaptchaErrorMessage = showErrorContext
    ? CaptchaErrors.RETRY
    : CaptchaErrors.GENERIC;
  const reCaptchaErrorContext = showErrorContext ? (
    <DetailedRecaptchaError />
  ) : undefined;

  // Form is only submitted when a valid recaptcha token is returned.
  useEffect(() => {
    const registerFormElement = registerFormRef.current;
    if (token) {
      registerFormElement?.submit();
    }
  }, [registerFormRef, token]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    executeCaptcha();
  };

  return (
    <>
      <Header geolocation={geolocation} />
      <Nav
        tabs={[
          {
            displayText: PageTitle.SIGN_IN,
            linkTo: '/signin',
            isActive: false,
          },
          {
            displayText: PageTitle.REGISTRATION,
            linkTo: '/register',
            isActive: true,
          },
        ]}
      />
      <MainGrid
        gridSpanDefinition={gridItemSignInAndRegistration}
        errorOverride={recaptchaCheckFailed ? reCaptchaErrorMessage : undefined}
        errorContext={reCaptchaErrorContext}
        errorReportUrl={showErrorContext ? locations.REPORT_ISSUE : undefined}
      >
        <form
          method="post"
          action={buildUrlWithQueryParams('/register', {}, queryParams)}
          ref={registerFormRef}
          onSubmit={handleSubmit}
        >
          <RecaptchaElement id="register-recaptcha" />
          <CsrfFormField />
          <RefTrackingFormFields />
          <EmailInput defaultValue={email} />
          <Terms />
          <Button css={registerButton} type="submit" data-cy="register-button">
            Register
          </Button>
        </form>
        <Divider
          spaceAbove="loose"
          displayText="or continue with"
          cssOverrides={divider}
        />
        <SocialButtons returnUrl={returnUrl} oauthBaseUrl={oauthBaseUrl} />
      </MainGrid>
      <Footer />
    </>
  );
};
