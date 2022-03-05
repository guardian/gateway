import { removeQueryParam } from '@/client/lib/removeQueryParam';

export const removeEncryptedEmailParam = () => {
  const { pathname, search } = window.location;
  const qs = removeQueryParam(search, 'encryptedEmail');
  window.history.replaceState(null, '', `${pathname}?${qs}`);
};
