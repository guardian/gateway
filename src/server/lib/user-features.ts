import { Response } from 'express';
import { getConfiguration } from '@/server/lib/getConfiguration';
import { getUserAttributes } from '@/server/lib/members-data-api/user-attributes';

// port of some functionality from https://github.com/guardian/frontend/blob/main/static/src/javascripts/projects/common/modules/commercial/user-features.ts

const { baseUri } = getConfiguration();

const domain = `${baseUri.replace('profile.', '').split(':')[0]}`;

/**
 * @name setUserFeatureCookies
 * @description Looks up user attributes from the members-data-api and sets product cookies
 *
 * Currently only used to set the AdFree cookie (GU_AF1) but could be extended to set other cookies.
 *
 * @param accessToken - the value of the oauth accessToken
 * @param res - the express response object
 * @param requestId - loggable identifier for the request
 */
export const setUserFeatureCookie = async (
  accessToken: string,
  res: Response,
  requestId?: string,
): Promise<void> => {
  // call the members-data-api to get the user's attributes/products if any
  const userAttributes = await getUserAttributes(accessToken, requestId);

  // set the GU_AF1 cookie if the user has the ad-free product
  if (userAttributes?.contentAccess.digitalPack) {
    // for some reason the value is set to 6 months time,
    // but the expiry is set to 2 days if the user has a product
    // https://github.com/guardian/frontend/blob/f17fe93c542fbd448392a0687d0b92f35796097a/static/src/javascripts/projects/common/modules/commercial/user-features.ts#L128
    const value = new Date();
    value.setMonth(value.getMonth() + 6);
    res.cookie('GU_AF1', value.getTime().toString(), {
      domain,
      expires: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    });
  }
};
