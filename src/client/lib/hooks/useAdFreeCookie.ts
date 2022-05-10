import { useState, useEffect } from 'react';
import { getCookie } from '@guardian/libs';

// User Attributes API cookies are dropped on subscription on support.theguardian.com for use by frontend.
// They are also dropped when a user logs in.
// User Cookie Information: github.com/guardian/members-data-api/blob/main/README.md
export const useAdFreeCookie = (): boolean => {
  const [hasAdFree, setHasAdFree] = useState(false);

  useEffect(() => {
    const adfreeCookieExists = !!getCookie({ name: 'GU_AF1' }); // Ad Free session cookie valid 48hrs

    setHasAdFree(adfreeCookieExists);
  }, []);

  return hasAdFree;
};
