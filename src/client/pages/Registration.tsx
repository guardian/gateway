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

const useRecaptchaScript = (url: string) => {
  const [loaded, setLoaded] = React.useState(false);

  React.useEffect(() => {
    const existingScript =
      typeof document !== undefined &&
      document.getElementById('g-captcha-script');

    if (existingScript || recaptchaReady()) {
      setLoaded(true);
      return;
    }

    const script = document.createElement('script');

    script.setAttribute('src', url);

    script.setAttribute('id', 'g-captcha-script');
    script.setAttribute('async', '');
    script.setAttribute('defer', '');

    document.body.appendChild(script);

    const initialiseRecaptcha = () => {
      window.grecaptcha.ready(() => {
        if (recaptchaReady()) {
          setLoaded(true);
        }
      });
    };
    script.addEventListener('load', initialiseRecaptcha);

    return () => {
      script.removeEventListener('load', initialiseRecaptcha);
      // TODO: Decide whether to remove from body on effect cleanup.
      document.body.removeChild(script);
    };
  }, []);

  return {
    loaded,
  };
};

const useRecaptcha = (siteKey: string, renderElement: string) => {
  const [token, setToken] = React.useState('');
  const [error, setError] = React.useState('');
  const [expired, setExpired] = React.useState('');

  const [widgetId, setWidgetId] = React.useState(0);

  const { loaded } = useRecaptchaScript(
    'https://www.google.com/recaptcha/api.js?render=explicit',
  );

  React.useEffect(() => {
    if (loaded) {
      const widgetId = window.grecaptcha.render(renderElement, {
        sitekey: siteKey,
        size: 'invisible',
        callback: setToken,
        'error-callback': setError,
        'expired-callback': setExpired,
      });
      setWidgetId(widgetId);
    }
  }, [loaded]);

  return {
    token,
    error,
    expired,
    captchaElement: widgetId,
  };
};

export const Registration = ({
  returnUrl = '',
  email = '',
  recaptchaSiteKey = '',
}: Props) => {
  const registerFormRef = React.createRef<HTMLFormElement>();

  const { token, captchaElement } = useRecaptcha(
    recaptchaSiteKey,
    'recaptcha_registration',
  );

  const returnUrlQuery = returnUrl
    ? `?returnUrl=${encodeURIComponent(returnUrl)}`
    : '';

  React.useEffect(() => {
    const registerFormElement = registerFormRef.current;
    if (token) {
      console.log('Token rcv: ', token);
      // registerFormElement.submit();
    }
  }, [token]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (captchaElement !== null) {
      window.grecaptcha.reset(captchaElement);
      window.grecaptcha.execute(captchaElement);
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
