import React from 'react';
import { MainLayout } from '@/client/layouts/Main';
import { MainBodyText } from '@/client/components/MainBodyText';

export const MaintenancePage = () => (
  <MainLayout pageHeader="We’ll be back soon">
    <MainBodyText>
      Sorry for the inconvenience. We are currently performing some essential
      maintenance. Please try again later.
    </MainBodyText>
  </MainLayout>
);
