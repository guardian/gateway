import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const removeEcryptedParam = (search: string) => {
  const qs = new URLSearchParams(search);
  qs.delete('encryptedEmail');
  return qs.toString();
};

export const useRemoveEncryptedEmailParam = () => {
  const { pathname, search } = useLocation();
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const qs = removeEcryptedParam(search);
      window.history.replaceState(null, '', `${pathname}?${qs}`);
    }
  }, []);
};
