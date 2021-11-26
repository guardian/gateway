import { CaptchaErrors } from '@/shared/model/Errors';
import { RecaptchaV2 } from 'express-recaptcha';
import {
  RecaptchaResponseV2,
  RecaptchaResponseV3,
} from 'express-recaptcha/dist/interfaces';
import { ApiError } from '../models/Error';
import { getConfiguration } from './getConfiguration';
import { logger } from './logger';

const {
  googleRecaptcha: { secretKey, siteKey },
} = getConfiguration();

/**
 * Throws a generic error if the recaptcha check has failed.
 * @param recaptchaResponse
 */
export const checkRecaptchaError = (
  recaptchaResponse: RecaptchaResponseV3 | RecaptchaResponseV2 | undefined,
) => {
  if (recaptchaResponse?.error) {
    logger.error(
      'Problem verifying recaptcha, error response: ',
      recaptchaResponse.error,
    );
    throw new ApiError({
      message: CaptchaErrors.GENERIC,
      status: 400,
    });
  }
};

export const initialiseRecaptcha = () => new RecaptchaV2(siteKey, secretKey);

export const recaptchaSiteKey = siteKey;
