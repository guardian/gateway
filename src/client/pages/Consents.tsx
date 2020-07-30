import React from 'react';
import { PageHeader } from '@/client/components/PageHeader';
import { PageBox } from '@/client/components/PageBox';
import { ConsentsLayout } from '@/client/layouts/consents';

export const ConsentsPage = () => {
  return (
    <ConsentsLayout>
      <PageBox>
        <PageHeader>Do some consents</PageHeader>
      </PageBox>
    </ConsentsLayout>
  );
};
