import React, { useContext } from 'react';
import { css } from '@emotion/react';
import { ClientState } from '@/shared/model/ClientState';
import { ClientStateContext } from '@/client/components/ClientState';
import { MainGrid } from '@/client/layouts/MainGrid';
import { Header } from '@/client/components/Header';
import { Footer } from '@/client/components/Footer';
import { PasswordInput } from '@/client/components/PasswordInput';
import { Nav } from '@/client/components/Nav';
import { TextInput } from '@guardian/src-text-input';
import { Button } from '@guardian/src-button';
import { Routes } from '@/shared/model/Routes';
import { PageTitle } from '@/shared/model/PageTitle';
import { CsrfFormField } from '@/client/components/CsrfFormField';
import { Terms } from '@/client/components/Terms';
import { SocialButtons } from '@/client/components/SocialButtons';
import { Link } from '@guardian/src-link';
import { textSans } from '@guardian/src-foundations/typography';
import { gridItemSignIn } from '@/client/styles/Grid';
import { space } from '@guardian/src-foundations';
import { from } from '@guardian/src-foundations/mq';
import {
  centreLinesOnDivider,
  fitDividerToContainer,
  topMargin,
} from '@/client/styles/Shared';
import { Divider } from '@guardian/source-react-components-development-kitchen';

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

export const SignIn = () => {
  const clientState: ClientState = useContext(ClientStateContext);
  const { pageData = {} } = clientState;
  const { returnUrl } = pageData;
  const returnUrlQuery = returnUrl
    ? `?returnUrl=${encodeURIComponent(returnUrl)}`
    : '';

  return (
    <>
      <Header />
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
      <MainGrid gridSpanDefinition={gridItemSignIn}>
        <form method="post" action={`${Routes.SIGN_IN}${returnUrlQuery}`}>
          <CsrfFormField />
          <div css={topMargin}>
            <TextInput label="Email" name="email" type="email" />
          </div>
          <div css={passwordInput}>
            <PasswordInput label="Password" />
          </div>
          <Links>
            <Link subdued={true} href="/reset" cssOverrides={resetPassword}>
              Reset password
            </Link>
          </Links>
          <Terms />
          <Button css={signInButton} type="submit" data-cy="sign-in-button">
            Sign in
          </Button>
        </form>
        <Divider
          size="full"
          spaceAbove="loose"
          displayText="or continue with"
          cssOverrides={[centreLinesOnDivider, fitDividerToContainer]}
        />
        <SocialButtons returnUrl="todo" />
      </MainGrid>
      <Footer />
    </>
  );
};
