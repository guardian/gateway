import React from 'react';
import { css } from '@emotion/react';
import { PageBox } from '@/client/components/PageBox';
import { PageBody } from '@/client/components/PageBody';
import { Main } from '@/client/layouts/Main';
import { Header } from '@/client/components/Header';
import { Footer } from '@/client/components/Footer';
import { Nav } from '@/client/components/Nav';
import { TextInput } from '@guardian/src-text-input';
import { Button } from '@guardian/src-button';
import { Routes } from '@/shared/model/Routes';
import { PageTitle } from '@/shared/model/PageTitle';
import { CsrfFormField } from '@/client/components/CsrfFormField';
import { Divider } from '@/client/components/Divider';
import { Terms } from '@/client/components/Terms';
import { SocialButtons } from '@/client/components/SocialButtons';
import { button, form, textInput } from '@/client/styles/Shared';
import { Link } from '@guardian/src-link';
import { textSans } from '@guardian/src-foundations/typography';
import { ErrorSummary } from '@/client/components/ErrorSummary';
interface SignInProps {
  email?: string;
  queryString?: string;
  errorSummary?: string;
}

const Links = ({ children }: { children: React.ReactNode }) => (
  <p
    css={css`
      ${textSans.medium()}
      margin-top: 0;
    `}
  >
    {children}
  </p>
);

export const SignIn = ({ queryString, errorSummary, email }: SignInProps) => (
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
    <Main>
      <PageBox>
        <PageBody>
          <form
            css={form}
            method="post"
            action={`${Routes.SIGN_IN}${queryString}`}
          >
            <CsrfFormField />
            {errorSummary && <ErrorSummary error={errorSummary} />}
            <TextInput
              css={textInput}
              label="Email"
              name="email"
              type="email"
              defaultValue={email}
            />
            <TextInput
              css={textInput}
              label="Password"
              name="password"
              type="password"
            />
            <Links>
              <Link subdued={true} href="/reset">
                Reset password
              </Link>{' '}
              or{' '}
              <Link subdued={true} href="/magic-link">
                email me a link to sign in
              </Link>
            </Links>
            <Button css={button} type="submit" data-cy="sign-in-button">
              Sign in
            </Button>
          </form>
          <Divider
            size="full"
            spaceAbove="loose"
            displayText="or continue with"
          />
          <SocialButtons returnUrl="todo" />
          <Divider size="full" spaceAbove="tight" />
          <Terms />
        </PageBody>
      </PageBox>
    </Main>
    <Footer />
  </>
);
