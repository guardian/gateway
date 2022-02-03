import React from 'react';
import { GlobalError } from '@/client/components/GlobalError';
import { GlobalSuccess } from '@/client/components/GlobalSuccess';
import { Header } from '@/client/components/Header';
import { getErrorLink } from '@/client/lib/ErrorLink';
import { GeoLocation } from '@/shared/model/Geolocation';

type Props = {
  error?: string;
  success?: string;
  geolocation?: GeoLocation;
};

export const ConsentsHeader = ({ error, success, geolocation }: Props) => (
  <>
    <Header geolocation={geolocation} />
    {error && <GlobalError error={error} link={getErrorLink()} left />}
    {success && <GlobalSuccess success={success} />}
  </>
);
