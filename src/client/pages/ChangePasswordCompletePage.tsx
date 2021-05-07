import React from 'react';
import { useQuery } from '@/client/lib/useQuery';
import { ChangePasswordComplete } from '@/client/pages/ChangePasswordComplete';

export const ChangePasswordCompletePage = () => {
  const { returnUrl } = useQuery();
  return <ChangePasswordComplete returnUrl={returnUrl} />;
};
