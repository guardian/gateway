import React from 'react';
import { TextInput } from '@guardian/src-text-input';
import { Button } from '@guardian/src-button';
import { PageBox } from '@/client/components/PageBox';
import { PageBody } from '@/client/components/PageBody';
import { SignInLayout } from '@/client/layouts/SignInLayout';
import { button, form, textInput } from '@/client/styles/Shared';
import { CsrfFormField } from '@/client/components/CsrfFormField';
import { Divider } from '../components/Divider';

export const Registration = () => (
  <SignInLayout>
    <PageBox>
      <PageBody>
        <form css={form} method="post">
          <CsrfFormField />
          <TextInput css={textInput} label="Email" name="email" type="email" />
          <Button css={button} type="submit">
            Register
          </Button>
        </form>
      </PageBody>
      <Divider size="full" spaceAbove="tight" displayText="or register with" />
      <p>TODO: Social sign in buttons</p>
      <p>TODO: Terms</p>
    </PageBox>
  </SignInLayout>
);
