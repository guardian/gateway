import React from 'react';
import { css } from '@emotion/react';
import { MainGrid } from '@/client/layouts/MainGrid';
import { Header } from '@/client/components/Header';
import { Footer } from '@/client/components/Footer';
import { PasswordInput } from '@/client/components/PasswordInput';
import { Nav } from '@/client/components/Nav';
import { Button, Link } from '@guardian/source-react-components';
import { Routes } from '@/shared/model/Routes';
import { PageTitle } from '@/shared/model/PageTitle';
import { CsrfFormField } from '@/client/components/CsrfFormField';
import { Terms } from '@/client/components/Terms';
import { SocialButtons } from '@/client/components/SocialButtons';
import { gridItemSignInAndRegistration } from '@/client/styles/Grid';
import { from, textSans, border, space } from '@guardian/source-foundations';
import { Divider } from '@guardian/source-react-components-development-kitchen';
import { SignInErrors } from '@/shared/model/Errors';
import { EmailInput } from '@/client/components/EmailInput';
import { buildUrl, buildUrlWithQueryParams } from '@/shared/lib/routeUtils';
import { GeoLocation } from '@/shared/model/Geolocation';
import { QueryParams } from '@/shared/model/QueryParams';

export type SignInProps = {
  returnUrl?: string;
  queryString: QueryParams;
  email?: string;
  error?: string;
  oauthBaseUrl: string;
  geolocation?: GeoLocation;
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
      <p>
        We cannot sign you in with your social account credentials. Please enter
        your account password below to sign in.
      </p>
    );
  }
};

const showSocialButtons = (
  error: string | undefined,
  returnUrl: string | undefined,
  oauthBaseUrl: string,
) => {
  if (error !== SignInErrors.ACCOUNT_ALREADY_EXISTS) {
    return (
      <>
        <Divider
          spaceAbove="loose"
          displayText="or continue with"
          cssOverrides={divider}
        />
        <SocialButtons returnUrl={returnUrl} oauthBaseUrl={oauthBaseUrl} />
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

export const SignIn = ({
  returnUrl,
  email,
  error,
  oauthBaseUrl,
  queryString,
  geolocation,
}: SignInProps) => (
  <>
    <Header geolocation={geolocation} />
    <Nav
      tabs={[
        {
          displayText: PageTitle.SIGN_IN,
          linkTo: Routes.SIGN_IN,
          isActive: true,
        },
        {
          displayText: PageTitle.REGISTRATION,
          linkTo: Routes.REGISTRATION,
          isActive: false,
        },
      ]}
    />
    <MainGrid
      gridSpanDefinition={gridItemSignInAndRegistration}
      errorOverride={error}
      errorContext={getErrorContext(error)}
    >
      <form
        method="post"
        action={buildUrlWithQueryParams(Routes.SIGN_IN, {}, queryString)}
      >
        <CsrfFormField />
        <EmailInput defaultValue={email} />
        <div css={passwordInput}>
          <PasswordInput label="Password" />
        </div>
        <Links>
          <Link
            subdued={true}
            href={buildUrl(Routes.RESET)}
            cssOverrides={resetPassword}
          >
            Reset password
          </Link>
        </Links>
        <Terms />
        <Button css={signInButton} type="submit" data-cy="sign-in-button">
          Sign in
        </Button>
      </form>
      {showSocialButtons(error, returnUrl, oauthBaseUrl)}
    </MainGrid>
    <Footer />
  </>
);
