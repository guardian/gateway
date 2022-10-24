import React from 'react';
import { GlobalError } from '@/client/components/GlobalError';
import { GlobalSuccess } from '@/client/components/GlobalSuccess';
import { Header } from '@/client/components/Header';
import { DEFAULT_ERROR_LINK } from '@/client/lib/ErrorLink';
import { IsNativeApp } from '@/shared/model/ClientState';

type Props = {
  error?: string;
  success?: string;
  isNativeApp?: IsNativeApp;
};

export const ConsentsHeader = ({ error, success, isNativeApp }: Props) => (
  <>
    <Header isNativeApp={isNativeApp} />
    {error && <GlobalError error={error} link={DEFAULT_ERROR_LINK} left />}
    {success && <GlobalSuccess success={success} />}
  </>
);
