import { Response } from 'express';
import { getConfiguration } from '@/server/lib/getConfiguration';
import { getUserBenefits } from './user-benefits-api/user-benefits';
import { UserBenefitsResponse } from '@/shared/lib/user-benefits-api';

// port of some functionality from https://github.com/guardian/frontend/blob/main/static/src/javascripts/projects/common/modules/commercial/user-features.ts

const { baseUri } = getConfiguration();

const domain = `${baseUri.replace('profile.', '').split(':')[0]}`;

const AD_FREE_USER_COOKIE = 'GU_AF1';
const HIDE_SUPPORT_MESSAGING_COOKIE = 'gu_hide_support_messaging';
const ALLOW_REJECT_ALL_COOKIE = 'gu_allow_reject_all';
const USER_BENEFITS_EXPIRY_COOKIE = 'gu_user_benefits_expiry';

/**
 * @name setUserFeatureCookies
 * @description Looks up user attributes from the users-benefits-api and members-data-api and sets product cookies
 *
 * Used to set the user benefits cookies: gu_user_benefits_expiry, gu_hide_support_messaging, gu_allow_reject_all, GU_AF1
 * but could be extended to set other cookies.
 *
 * @param accessToken - the value of the oauth access token if using Okta
 * @param res - the express response object
 */
export const setUserFeatureCookies = async ({
	accessToken,
	res,
}: {
	accessToken: string;
	res: Response;
}): Promise<void> => {
	// call the members-data-api to get the user's attributes/products if any

	const userBenefits = await getUserBenefits({
		accessToken,
	});

	if (userBenefits) {
		persistUserBenefitsCookies({
			userBenefits,
			res,
		});
	}
};

/**
 * @name createCookie
 * @description Creates a cookie with the given name and expiry date
 * @param {{
 * 	name: string;
 * 	res: Response;
 * 	daysTillExpiry: number;
 * }} {
 * 	name,
 * 	res,
 * 	daysTillExpiry,
 * }
 */
const createCookie = ({
	name,
	res,
	daysTillExpiry,
}: {
	name: string;
	res: Response;
	daysTillExpiry: number;
}) => {
	const tmpDate = new Date(Date.now() + daysTillExpiry * 24 * 60 * 60 * 1000);
	res.cookie(name, tmpDate.getTime().toString(), {
		domain,
		expires: tmpDate,
	});
};

/**
 * https://github.com/guardian/dotcom-rendering/blob/a0eff55ee7fedf08b785557fceaa0f4f7265e0df/dotcom-rendering/src/client/userFeatures/user-features.ts
 *
 * @param {{
 * 	userBenefits: UserBenefitsResponse;
 * 	res: Response;
 * }} {
 * 	userBenefits,
 * 	res,
 * }
 */
const persistUserBenefitsCookies = ({
	userBenefits,
	res,
}: {
	userBenefits: UserBenefitsResponse;
	res: Response;
}) => {
	createCookie({
		name: USER_BENEFITS_EXPIRY_COOKIE,
		res,
		daysTillExpiry: 1,
	});
	if (userBenefits?.benefits?.includes('hideSupportMessaging')) {
		createCookie({
			name: HIDE_SUPPORT_MESSAGING_COOKIE,
			res,
			daysTillExpiry: 1,
		});
	}
	// Allow reject all cookie
	if (userBenefits?.benefits?.includes('allowRejectAll')) {
		createCookie({ name: ALLOW_REJECT_ALL_COOKIE, res, daysTillExpiry: 1 });
	}
	// Ad free user cookie is set for 2 days
	// https://github.com/guardian/frontend/blob/f17fe93c542fbd448392a0687d0b92f35796097a/static/src/javascripts/projects/common/modules/commercial/user-features.ts#L128
	if (userBenefits?.benefits?.includes('adFree')) {
		createCookie({ name: AD_FREE_USER_COOKIE, res, daysTillExpiry: 2 });
	}
};
