import React from 'react';
import { TextInput } from '@guardian/src-text-input';
import { Button } from '@guardian/src-button';
import { Routes } from '@/shared/model/Routes';
import { PageTitle } from '@/shared/model/PageTitle';
import { Layout } from '@/client/layouts/Layout';
import { PageBox } from '@/client/components/PageBox';
import { PageBody } from '@/client/components/PageBody';
import { CsrfFormField } from '@/client/components/CsrfFormField';
import { Divider } from '@/client/components/Divider';
import { Terms } from '@/client/components/Terms';
import { button, form, textInput } from '@/client/styles/Shared';

export const Registration = () => (
  <Layout subTitle={PageTitle.REGISTRATION}>
    <PageBox>
      <PageBody>
        <form css={form} method="post" action={`${Routes.REGISTRATION}`}>
          <CsrfFormField />
          <TextInput css={textInput} label="Email" name="email" type="email" />
          <Button css={button} type="submit">
            Register
          </Button>
        </form>
      </PageBody>
      <Divider size="full" spaceAbove="tight" displayText="or register with" />
      <p>TODO: Social sign in buttons</p>
      <Terms />
    </PageBox>
  </Layout>
);
