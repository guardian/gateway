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
import { Breakpoints } from '../models/Style';
import { brandLine, space } from '@guardian/src-foundations';
import { recaptchaReady } from '../static/recaptcha/recaptcha';

type Props = {
  returnUrl?: string;
  email?: string;
  recaptchaSiteKey?: string;
};

// Used to centre the nav tabs in line with the page content.
const centreTabRow = css`
  max-width: ${Breakpoints.TABLET}px;
  width: 100%;
  margin: 0 auto;
  border-left: 1px solid ${brandLine.primary};
`;

const termsSpacing = css`
  margin-bottom: ${space[4]}px;
`;

export const Registration = ({
  returnUrl = '',
  email = '',
  recaptchaSiteKey = '',
}: Props) => {
  const returnUrlQuery = returnUrl
    ? `?returnUrl=${encodeURIComponent(returnUrl)}`
    : '';

  React.useEffect(() => {
    const script = document.createElement('script');

    script.setAttribute(
      'src',
      'https://www.google.com/recaptcha/api.js?render=explicit',
    );

    script.setAttribute('async', '');
    script.setAttribute('defer', '');

    script.addEventListener('load', () => {
      window.grecaptcha.ready(() => {
        if (recaptchaReady()) {
          window.grecaptcha.render('recaptcha_registration', {
            sitekey: recaptchaSiteKey,
            size: 'invisible',
            callback: resolve,
          });
        }
      });
    });
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const resolve = (token: string) => {
    console.log('TOKEN', token);

    const registerFormElement = registerFormRef.current;
    if (token && registerFormElement) {
      registerFormElement.submit();
    }
  };

  const registerFormRef = React.createRef<HTMLFormElement>();
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (recaptchaReady()) {
      window.grecaptcha.execute();
    }
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
        tabRowStylesOverride={centreTabRow}
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
              <div className="g-recaptcha" id="recaptcha_registration"></div>
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
