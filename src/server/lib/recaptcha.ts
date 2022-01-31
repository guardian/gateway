import { NextFunction, Request, Response } from 'express';
import { RecaptchaV2 } from 'express-recaptcha';
import { CaptchaErrors } from '@/shared/model/Errors';
import { getConfiguration } from '@/server/lib/getConfiguration';
import { logger } from '@/server/lib/serverSideLogger';
import { trackMetric } from '@/server/lib/trackMetric';
import { HttpError } from '@/server/models/Error';

const {
  googleRecaptcha: { secretKey, siteKey },
} = getConfiguration();

const recaptcha = new RecaptchaV2(siteKey, secretKey);

const recaptchaError = new HttpError({
  message: CaptchaErrors.GENERIC,
  status: 400,
  name: 'RecaptchaError',
  code: 'EBADRECAPTCHA',
});

/**
 * Throws a generic error if the recaptcha check has failed.
 * @param recaptchaResponse
 */
const checkRecaptchaError = (req: Request, _: Response, next: NextFunction) => {
  if (!req.recaptcha) {
    return next(recaptchaError);
  }

  const { error } = req.recaptcha;
  if (error) {
    logger.error('Problem verifying recaptcha, error response: ', error);
    return next(recaptchaError);
  }

  trackMetric('RecaptchaMiddleware::Success');
  next();
};

const handleRecaptcha = [recaptcha.middleware.verify, checkRecaptchaError];

/**
 * Protects a route with recaptcha.
 */
export default handleRecaptcha;
