import { NextFunction, Request, Response } from 'express';
import { RecaptchaV2 } from 'express-recaptcha';
import { CaptchaErrors } from '@/shared/model/Errors';
import { getConfiguration } from '@/server/lib/getConfiguration';
import { logger } from '@/server/lib/serverSideLogger';
import { trackMetric } from '@/server/lib/trackMetric';
import { HttpError } from '@/server/models/Error';
import { featureSwitches } from '@/shared/lib/featureSwitches';

const {
  googleRecaptcha: { secretKey, siteKey },
  stage,
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

/**
 * When running the handleRecaptcha middleware locally, we consistently saw a
 * bug where the route handler would be called multiple times, causing 'Cannot
 * set headers after they are sent to the client' errors and running everything
 * in the handler multiple times. Our guesses for why this happens are (1) the
 * testing keys for reCAPTCHA are somehow broken; (2) express-recaptcha is
 * somehow broken; (3) the way we integrate it is somehow broken. To solve it,
 * we just automatically pass next() instead of running the middleware in the
 * DEV stage, unless the 'recaptchaEnabledDev' feature switch is set to true.
 *
 * TODO: Get to the bottom of this - it would be ideal if we didn't have to do
 * this workaround.
 */
const handleRecaptcha =
  stage === 'DEV' && featureSwitches.recaptchaEnabledDev
    ? (_: Request, __: Response, next: NextFunction) => next()
    : [recaptcha.middleware.verify, checkRecaptchaError];

/**
 * Protects a route with recaptcha.
 */
export default handleRecaptcha;
