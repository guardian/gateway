import React from 'react';
import { TextInput } from '@guardian/src-text-input';
import { Button } from '@guardian/src-button';
import { Routes } from '@/shared/model/Routes';
import { PageTitle } from '@/shared/model/PageTitle';
import { Main } from '@/client/layouts/Main';
import { Header } from '@/client/components/Header';
import { Nav } from '@/client/components/Nav';
import { Footer } from '@/client/components/Footer';
import { PageBox } from '@/client/components/PageBox';
import { PageBody } from '@/client/components/PageBody';
import { CsrfFormField } from '@/client/components/CsrfFormField';
import { Divider } from '@/client/components/Divider';
import { Terms } from '@/client/components/Terms';
import { SocialButtons } from '@/client/components/SocialButtons';
import { button, textInput } from '@/client/styles/Shared';
import { css } from '@emotion/react';
import { space } from '@guardian/src-foundations';
import useRecaptcha, { RecaptchaElement } from '../lib/hooks/useRecaptcha';
import { CaptchaErrors } from '@/shared/model/Errors';

type Props = {
  returnUrl?: string;
  email?: string;
  recaptchaSiteKey?: string;
  refVal?: string;
  refViewId?: string;
};

const termsSpacing = css`
  margin-bottom: ${space[6]}px;
`;

export const Registration = ({
  returnUrl = '',
  refVal = '',
  refViewId = '',
  email = '',
  recaptchaSiteKey = '',
}: Props) => {
  const registerFormRef = React.createRef<HTMLFormElement>();
  const recaptchaElementRef = React.useRef<HTMLDivElement>(null);

  const returnUrlQuery = `returnUrl=${encodeURIComponent(returnUrl)}`;
  const refUrlQuery = `ref=${encodeURIComponent(refVal)}`;
  const refViewIdUrlQuery = `refViewId=${encodeURIComponent(refViewId)}`;

  const registrationUrlQueryParams = [
    returnUrl ? returnUrlQuery : '',
    refVal ? refUrlQuery : '',
    refViewId ? refViewIdUrlQuery : '',
  ];

  const registrationUrlQueryParamString = registrationUrlQueryParams
    .filter((param) => param !== '')
    .join('&');

  const captchaElement = recaptchaElementRef.current ?? 'register-recaptcha';
  const { token, error, expired, executeCaptcha } = useRecaptcha(
    recaptchaSiteKey,
    captchaElement,
  );

  const recaptchaCheckSuccessful = !error && !expired;

  // Form is only submitted when a valid recaptcha token is returned.
  React.useEffect(() => {
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

      <Main
        errorOverride={
          recaptchaCheckSuccessful ? undefined : CaptchaErrors.GENERIC
        }
      >
        <PageBox>
          <PageBody>
            <form
              method="post"
              action={`${Routes.REGISTRATION}?${registrationUrlQueryParamString}`}
              ref={registerFormRef}
              onSubmit={handleSubmit}
            >
              <CsrfFormField />
              <RecaptchaElement
                ref={recaptchaElementRef}
                id="register-recaptcha"
              />
              <TextInput
                css={textInput}
                label="Email"
                name="email"
                type="email"
                defaultValue={email}
              />
              <div css={termsSpacing}>
                <Terms />
              </div>
              <Button css={button} type="submit" data-cy="register-button">
                Register
              </Button>
            </form>
            <Divider
              size="fit"
              spaceAbove="loose"
              displayText="or continue with"
            />
            <SocialButtons returnUrl={returnUrl} />
          </PageBody>
        </PageBox>
      </Main>
      <Footer />
    </>
  );
};
