import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const useRemoveEncryptedEmailParam = () => {
  const { pathname, search } = useLocation();
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const qs = search.replace(/encryptedEmail=[^&]*[&]?/, '');
      window.history.replaceState(null, '', `${pathname}${qs}`);
    }
  }, []);
};
