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
import { Container } from '../components/Container';
import { css } from '@emotion/react';
import { Breakpoints } from '../models/Style';
import { brandLine, space } from '@guardian/src-foundations';

type Props = {
  returnUrl?: string;
  email?: string;
};

// Used to centre the nav tabs in line with the page content.
const centreTabRow = css`
  max-width: ${Breakpoints.TABLET}px;
  width: 100%;
  margin: 0 auto;
  border-left: 1px solid ${brandLine.primary};
`;

const containerStyles = css`
  display: flex;
  flex-grow: 1;
`;

const termsSpacing = css`
  margin-bottom: ${space[4]}px;
`;

export const Registration = ({ returnUrl = '', email = '' }: Props) => {
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
      <Container sideBorders cssOverrides={containerStyles}>
        <Main>
          <PageBox>
            <PageBody>
              <form
                css={form}
                method="post"
                action={`${Routes.REGISTRATION}${returnUrlQuery}`}
              >
                <CsrfFormField />
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
      </Container>
      <Footer />
    </>
  );
};
