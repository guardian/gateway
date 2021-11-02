import React, { createRef, useEffect, useRef } from 'react';
import { Button } from '@guardian/src-button';
import { Routes } from '@/shared/model/Routes';
import { PageTitle } from '@/shared/model/PageTitle';
import { Header } from '@/client/components/Header';
import { Nav } from '@/client/components/Nav';
import { Footer } from '@/client/components/Footer';
import { CsrfFormField } from '@/client/components/CsrfFormField';
import { Terms } from '@/client/components/Terms';
import { SocialButtons } from '@/client/components/SocialButtons';
import { border, space } from '@guardian/src-foundations';
import { css } from '@emotion/react';
import { from } from '@guardian/src-foundations/mq';
import { MainGrid } from '../layouts/MainGrid';
import { gridItemSignInAndRegistration } from '../styles/Grid';
import { Divider } from '@guardian/source-react-components-development-kitchen';
import { CaptchaErrors } from '@/shared/model/Errors';
import useRecaptcha, {
  RecaptchaElement,
} from '@/client/lib/hooks/useRecaptcha';
import { DetailedRecaptchaError } from '@/client/components/DetailedRecaptchaError';
import locations from '@/client/lib/locations';
import { EmailInput } from '@/client/components/EmailInput';

export type RegistrationProps = {
  returnUrl?: string;
  email?: string;
  refValue?: string;
  refViewId?: string;
  recaptchaSiteKey?: string;
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

export const Registration = ({
  returnUrl = '',
  refValue = '',
  refViewId = '',
  email = '',
  recaptchaSiteKey = '',
}: RegistrationProps) => {
  const returnUrlQuery = `returnUrl=${encodeURIComponent(returnUrl)}`;
  const refUrlQuery = `ref=${encodeURIComponent(refValue)}`;
  const refViewIdUrlQuery = `refViewId=${encodeURIComponent(refViewId)}`;
  const registrationUrlQueryParams = [
    returnUrl ? returnUrlQuery : '',
    refValue ? refUrlQuery : '',
    refViewId ? refViewIdUrlQuery : '',
  ];
  const registrationUrlQueryParamString = registrationUrlQueryParams
    .filter((param) => param !== '')
    .join('&');

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
  }, [token]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    executeCaptcha();
  };

  return (
    <>
      <Header />
      <Nav
        tabs={[
          {
            displayText: PageTitle.SIGN_IN,
            linkTo: Routes.SIGN_IN,
            isActive: false,
          },
          {
            displayText: PageTitle.REGISTRATION,
            linkTo: Routes.REGISTRATION,
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
          action={`${Routes.REGISTRATION}?${registrationUrlQueryParamString}`}
          ref={registerFormRef}
          onSubmit={handleSubmit}
        >
          <RecaptchaElement id="register-recaptcha" />
          <CsrfFormField />
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
        <SocialButtons returnUrl={returnUrl} />
      </MainGrid>
      <Footer />
    </>
  );
};
