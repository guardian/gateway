import { buildUrlWithQueryParams } from '@/shared/lib/routeUtils';
import React from 'react';
import useClientState from '../lib/hooks/useClientState';
import { JobsTermsAccept } from './JobsTermsAccept';

export const JobsTermsPage = () => {
  const clientState = useClientState();
  const { pageData = {}, queryParams } = clientState;
  const { firstName, secondName } = pageData;

  return (
    <JobsTermsAccept
      submitUrl={buildUrlWithQueryParams('/agree/GRS', {}, queryParams)}
      firstName={firstName}
      secondName={secondName}
    />
  );
};
