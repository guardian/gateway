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

export const Registration = () => (
  <>
    <Header />
    <Nav
      tabs={[
        {
          displayText: PageTitle.SIGN_IN,
          linkTo: '',
          isActive: false,
        },
        {
          displayText: PageTitle.REGISTRATION,
          linkTo: '',
          isActive: true,
        },
      ]}
    />
    <Main>
      <PageBox>
        <PageBody>
          <form css={form} method="post" action={`${Routes.REGISTRATION}`}>
            <CsrfFormField />
            <TextInput
              css={textInput}
              label="Email"
              name="email"
              type="email"
            />
            <Button css={button} type="submit">
              Register
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
