import React from 'react';
import locations from '@/shared/lib/locations';
import { ExternalLink } from '@/client/components/ExternalLink';
import { MainLayout } from '@/client/layouts/Main';
import { MainBodyText } from '@/client/components/MainBodyText';

export const NotFoundPage = () => (
  <MainLayout pageHeader="Sorry – the page does not exist">
    <MainBodyText>
      You may have followed an outdated link, or have mistyped a URL. If you
      believe this to be an error, please{' '}
      <ExternalLink href={locations.REPORT_ISSUE} subdued={true}>
        report it
      </ExternalLink>
      .
    </MainBodyText>
  </MainLayout>
);
