import React from 'react';
import { GlobalError } from '@/client/components/GlobalError';
import { GlobalSuccess } from '@/client/components/GlobalSuccess';
import { Header } from '@/client/components/Header';
import { getErrorLink } from '@/client/lib/ErrorLink';

type Props = {
  error?: string;
  success?: string;
};

export const ConsentsHeader = ({ error, success }: Props) => (
  <>
    <Header />
    {error && <GlobalError error={error} link={getErrorLink(error)} left />}
    {success && <GlobalSuccess success={success} />}
  </>
);
