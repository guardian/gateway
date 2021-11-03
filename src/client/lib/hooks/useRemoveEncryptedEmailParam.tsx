import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const removeEncryptedParam = (search: string) => {
  const qs = new URLSearchParams(search);
  qs.delete('encryptedEmail');
  return qs.toString();
};

export const useRemoveEncryptedEmailParam = () => {
  const { pathname, search } = useLocation();
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const qs = removeEncryptedParam(search);
      window.history.replaceState(null, '', `${pathname}?${qs}`);
    }
  }, []);
};
