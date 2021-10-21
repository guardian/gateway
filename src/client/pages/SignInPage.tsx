import React from 'react';
import { SignIn } from '@/client/pages/SignIn';
import { useLocation } from 'react-router-dom';

export const SignInPage = () => {
  const { pathname, search } = useLocation();
  // we use the encryptedEmail parameter to set the email cookie, but then want to remove it from the url
  if (typeof window !== 'undefined') {
    const qs = search.replace(/encryptedEmail=[^&]*[&]?/, '');
    window.history.replaceState(null, '', `${pathname}${qs}`);
  }
  return <SignIn />;
};
