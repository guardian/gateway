import csrf from 'csurf';
import { getConfiguration } from '@/server/lib/getConfiguration';

const { isHttps } = getConfiguration();

export const csrfMiddleware = csrf({
  cookie: {
    key: '_csrf',
    sameSite: true,
    secure: isHttps,
    httpOnly: true,
    signed: true,
  },
});
