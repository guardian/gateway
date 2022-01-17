import { CaptchaErrors } from '@/shared/model/Errors';
import { NextFunction, Request, Response } from 'express';
import { RecaptchaV2 } from 'express-recaptcha';
import { getConfiguration } from './getConfiguration';
import createError from 'http-errors';
import { logger } from '@/server/lib/serverSideLogger';
import { trackMetric } from '@/server/lib/trackMetric';

const {
  googleRecaptcha: { secretKey, siteKey },
} = getConfiguration();

const recaptcha = new RecaptchaV2(siteKey, secretKey);

/**
 * Throws a generic error if the recaptcha check has failed.
 * @param recaptchaResponse
 */
const checkRecaptchaError = (req: Request, _: Response, next: NextFunction) => {
  const recaptchaError = createError(400, CaptchaErrors.GENERIC, {
    code: 'EBADRECAPTCHA',
  });

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
