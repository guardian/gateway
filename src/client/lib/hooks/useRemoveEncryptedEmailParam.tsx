import { useEffect } from 'react';

export const removeEncryptedParam = (search: string) => {
  const qs = new URLSearchParams(search);
  qs.delete('encryptedEmail');
  return qs.toString();
};

export const useRemoveEncryptedEmailParam = () => {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const { pathname, search } = window.location;
      const qs = removeEncryptedParam(search);
      window.history.replaceState(null, '', `${pathname}?${qs}`);
    }
  }, []);
};
