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
import { button, form, textInput } from '@/client/styles/Shared';
import { css } from '@emotion/react';
import { space } from '@guardian/src-foundations';
import { RecaptchaElement, useRecaptcha } from '../static/recaptcha/recaptcha';

type Props = {
  returnUrl?: string;
  email?: string;
  recaptchaSiteKey?: string;
};

const termsSpacing = css`
  margin-bottom: ${space[4]}px;
`;

export const Registration = ({
  returnUrl = '',
  email = '',
  recaptchaSiteKey = '',
}: Props) => {
  const registerFormRef = React.createRef<HTMLFormElement>();
  const recaptchaElementRef = React.useRef<HTMLDivElement>(null);
  const returnUrlQuery = returnUrl
    ? `?returnUrl=${encodeURIComponent(returnUrl)}`
    : '';

  const { token, widgetId } = useRecaptcha(
    recaptchaSiteKey,
    recaptchaElementRef.current,
  );

  React.useEffect(() => {
    const registerFormElement = registerFormRef.current;
    if (token) {
      console.log('Token rcv: ', token);
      registerFormElement?.submit();
    }
  }, [token]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    window.grecaptcha.reset(widgetId);
    window.grecaptcha.execute(widgetId);
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

      <Main>
        <PageBox>
          <PageBody>
            <form
              css={form}
              method="post"
              action={`${Routes.REGISTRATION}${returnUrlQuery}`}
              ref={registerFormRef}
              onSubmit={handleSubmit}
            >
              <CsrfFormField />
              <RecaptchaElement ref={recaptchaElementRef} />
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
              size="full"
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
