import React from 'react';
import { GlobalError } from '@/client/components/GlobalError';
import { GlobalSuccess } from '@/client/components/GlobalSuccess';
import { Header } from '@/client/components/Header';
import { DEFAULT_ERROR_LINK } from '@/client/lib/ErrorLink';
import { GeoLocation } from '@/shared/model/Geolocation';

type Props = {
  error?: string;
  success?: string;
  geolocation?: GeoLocation;
};

export const ConsentsHeader = ({ error, success, geolocation }: Props) => (
  <>
    <Header geolocation={geolocation} />
    {error && <GlobalError error={error} link={DEFAULT_ERROR_LINK} left />}
    {success && <GlobalSuccess success={success} />}
  </>
);
