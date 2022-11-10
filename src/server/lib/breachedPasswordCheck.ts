import { createHash } from 'crypto';
import { logger } from '@/server/lib/serverSideLogger';
import { trackMetric } from '@/server/lib/trackMetric';

/**
 * @name: isBreachedPassword
 * @description: Checks if a password has previously been in a data breach by checking the Pwned Passwords API
 *
 * The documentation for the pwned password API is here for more detail:
 * https://haveibeenpwned.com/API/v3#PwnedPasswords
 *
 * This method returns true only if the password has been in a data breach.
 *
 * We return false otherwise. This could be the case that the password has not been in a data breach, or if there is an error with the API/fetch call. This way we don't block the user from changing their password should there be an error.
 *
 * @param {string} password Password to check against the Pwned Passwords API
 * @returns {boolean} True if the password has been in a data breach, false if it hasn't been breached or there was an API error
 */
export const isBreachedPassword = async (
  password: string,
): Promise<boolean> => {
  try {
    // the Pwned Passwords API uses SHA1 hashes of the password
    // so we need to hash the password before sending it to the API
    const hash = createHash('sha1').update(password).digest('hex');

    // the Pwned Passwords API uses the first 5 characters of the hash
    // which is what we need to send to the API
    // so store the first 5 characters of the hash
    const first5 = hash.substring(0, 5);

    // the Pwned Passwords API returns a list of hashes that could match the
    // remaining characters of the hash
    // so store the remaining characters of the hash
    const remaining = hash.substring(5);

    // call the Pwned Passwords API to check if the password has been in a data breach
    // by sending the first 5 characters of the hash
    const response = await fetch(
      `https://api.pwnedpasswords.com/range/${first5}`,
    );

    // check if we got an 2xx response, in the documentation it says that a
    // 200 response is returned for all hashes between 00000 and FFFFF
    if (response.ok) {
      trackMetric('BreachedPasswordCheck::Success');

      // the response is a string that delimits the full SHA-1 hash and the password count with a colon (:) and each line with a CRLF.
      // so parse the response as a string
      const text = await response.text();

      // check if the remaining characters of the hash is in the response
      // if it is, then the password has been in a data breach
      // if it isn't, then the password has not been in a data breach
      if (text.includes(remaining.toUpperCase())) {
        // the password has been in a data breach, so return true
        return true;
      }
    } else {
      // something went wrong with the Pwned Passwords API, so we log the error
      trackMetric('BreachedPasswordCheck::Failure');

      logger.warn('breach password check failed with status', response.status);
    }

    // return false as the password is not breached or a fallback in case the api is down
    return false;
  } catch (error) {
    trackMetric('BreachedPasswordCheck::Failure');

    logger.warn('breach password check failed with error', error);
    return false;
  }
};
