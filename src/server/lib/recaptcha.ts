import { CaptchaErrors } from '@/shared/model/Errors';
import { NextFunction, Request, Response } from 'express';
import { RecaptchaV2 } from 'express-recaptcha';
import { getConfiguration } from './getConfiguration';
import createError from 'http-errors';
import { logger } from './logger';

const {
  googleRecaptcha: { secretKey, siteKey },
} = getConfiguration();

const recaptcha = new RecaptchaV2(siteKey, secretKey);

/**
 * Throws a generic error if the recaptcha check has failed.
 * @param recaptchaResponse
 */
const checkRecaptchaError = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const recaptchaError = createError(400, CaptchaErrors.GENERIC, {
    code: 'EBADRECAPTCHA',
  });

  if (!req.recaptcha) {
    return next(recaptchaError);
  }

  if (req.recaptcha.error) {
    logger.error(
      'Problem verifying recaptcha, error response: ',
      req.recaptcha.error,
    );

    return next(recaptchaError);
  }

  next();
};

const handleRecaptcha = [recaptcha.middleware.verify, checkRecaptchaError];

/**
 * Protects a route with recaptcha.
 */
export default handleRecaptcha;
