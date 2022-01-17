import React from 'react';
import locations from '@/shared/lib/locations';
import { ExternalLink } from '@/client/components/ExternalLink';
import { MainLayout } from '@/client/layouts/Main';
import { MainBodyText } from '@/client/components/MainBodyText';

export const UnexpectedErrorPage = () => (
  <MainLayout pageHeader="Sorry – an unexpected error occurred">
    <MainBodyText>
      An error occurred, please try again or{' '}
      <ExternalLink href={locations.REPORT_ISSUE} subdued={true}>
        report it
      </ExternalLink>
      .
    </MainBodyText>
  </MainLayout>
);
