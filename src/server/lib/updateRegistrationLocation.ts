import { Request } from 'express';
import { logger } from '@/server/lib/serverSideLogger';
import { RegistrationLocation } from '@/server/models/okta/User';
import { isStringBoolean } from '@/server/lib/isStringBoolean';
import { getRegistrationLocation } from '@/server/lib/getRegistrationLocation';
import {
  read as readIdapiUser,
  addRegistrationLocation,
} from '@/server/lib/idapi/user';

/**
 * Until Gateway/Onboarding journey is migrated to Okta sessions, we don't have access to Okta User ID, only sg_gu_u cookie,
 * so we need to add reg location via idapi (which updates Okta immediately). When Okta sessions are available, this should be refactored
 * to use okta directly (Which is the source of truth for the user's registration location field)
 */
export const updateRegistrationLocationViaIDAPI = async (
  ip: string,
  sc_gu_u: string,
  req: Request,
) => {
  const { _cmpConsentedState = false } = req.body;

  const registrationLocation: RegistrationLocation | undefined =
    getRegistrationLocation(req, isStringBoolean(_cmpConsentedState));

  if (!!registrationLocation) {
    try {
      const user = await readIdapiUser(ip, sc_gu_u);
      // don't update users who already have a location set
      if (!!user.privateFields.registrationLocation) {
        return;
      }
      await addRegistrationLocation(registrationLocation, ip, sc_gu_u);
    } catch (error) {
      logger.error(
        `${req.method} ${req.originalUrl} Error updating registrationLocation via IDAPI`,
        error,
        {
          request_id: req.get('x-request-id'),
        },
      );
    }
  }
};
