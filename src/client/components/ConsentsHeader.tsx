import React from 'react';
import { GlobalError } from '@/client/components/GlobalError';
import { GlobalSuccess } from '@/client/components/GlobalSuccess';
import { Header } from '@/client/components/Header';
import { DEFAULT_ERROR_LINK } from '@/client/lib/ErrorLink';

type Props = {
  error?: string;
  success?: string;
};

export const ConsentsHeader = ({ error, success }: Props) => (
  <>
    <Header />
    {error && <GlobalError error={error} link={DEFAULT_ERROR_LINK} left />}
    {success && <GlobalSuccess success={success} />}
  </>
);
