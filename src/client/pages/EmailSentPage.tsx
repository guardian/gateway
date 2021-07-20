import React from 'react';
import { storage } from '@guardian/libs';
import { EmailSent } from '@/client/pages/EmailSent';

export const EmailSentPage = () => {
  const email = storage.session.get('gu.email');
  return <EmailSent email={email} />;
};
