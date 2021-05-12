import React from 'react';
import { PageHeader } from '@/client/components/PageHeader';
import { PageBox } from '@/client/components/PageBox';
import { PageBody } from '@/client/components/PageBody';
import { PageBodyText } from '@/client/components/PageBodyText';
import { SignInLayout } from '@/client/layouts/SignInLayout';

export const Registration = () => (
  <SignInLayout>
    <PageBox>
      <PageHeader>Register</PageHeader>
      <PageBody>
        <PageBodyText>Body text</PageBodyText>
      </PageBody>
    </PageBox>
  </SignInLayout>
);
