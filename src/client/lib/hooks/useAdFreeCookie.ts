import { useState, useEffect } from 'react';
import { getCookie } from '@guardian/libs';

// User Attributes API cookies are dropped on subscription on support.theguardian.com for use by frontend
// User Cookie Information: github.com/guardian/members-data-api/blob/main/README.md
export const useAdFreeCookie = (): boolean => {
  const [hasAdFree, setHasAdFree] = useState(false);
  const [isDigitalSubscriber, setIsDigitalSubscriber] = useState(false);

  useEffect(() => {
    const adfreeCookieExists = !!getCookie({ name: 'GU_AF1' }); // Ad Free session cookie valid 48hrs
    const digitalSubscriberCookieExists = !!getCookie({
      name: 'gu_digital_subscriber',
    });

    setHasAdFree(adfreeCookieExists);
    setIsDigitalSubscriber(digitalSubscriberCookieExists);
  }, []);

  console.log(`has ad free: ${hasAdFree}`);
  return hasAdFree || isDigitalSubscriber;
};
