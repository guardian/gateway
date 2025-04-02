import { Response } from 'express';
import { getConfiguration } from '@/server/lib/getConfiguration';
import { getUserAttributes } from '@/server/lib/members-data-api/user-attributes';
import { getUserBenefits } from './user-benefits-api/user-benefits';
import { UserBenefitsSchema } from '@/shared/lib/user-benefits-api';

// port of some functionality from https://github.com/guardian/frontend/blob/main/static/src/javascripts/projects/common/modules/commercial/user-features.ts

const { baseUri } = getConfiguration();

const domain = `${baseUri.replace('profile.', '').split(':')[0]}`;

export const AD_FREE_USER_COOKIE = 'GU_AF1';
export const HIDE_SUPPORT_MESSAGING_COOKIE = 'gu_hide_support_messaging';
export const ALLOW_REJECT_ALL_COOKIE = 'gu_allow_reject_all';
export const USER_BENEFITS_EXPIRY_COOKIE = 'gu_user_benefits_expiry';

/**
 * @name setUserFeatureCookies
 * @description Looks up user attributes from the members-data-api and sets product cookies
 *
 * Currently only used to set the AdFree cookie (GU_AF1) but could be extended to set other cookies.
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
	const userAttributes = await getUserAttributes({
		accessToken,
	});

	const userBenefits = await getUserBenefits({
		accessToken,
	});

	console.log('userBenefits', userBenefits);

	if (userBenefits) {
		persistUserBenefitsCookies({
			userBenefits,
			res,
		});
	}

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

export const createCookie = ({
	name,
	res,
}: {
	name: string;
	res: Response;
}) => {
	res.cookie(name, 'true', {
		domain,
		expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
	});
};

export const persistUserBenefitsCookies = ({
	userBenefits,
	res,
}: {
	userBenefits: UserBenefitsSchema;
	res: Response;
}) => {
	if (userBenefits.hideSupportMessaging) {
		createCookie({ name: HIDE_SUPPORT_MESSAGING_COOKIE, res });
	}
	if (userBenefits.allowRejectAll) {
		createCookie({ name: ALLOW_REJECT_ALL_COOKIE, res });
	}
	if (userBenefits.adFree) {
		createCookie({ name: AD_FREE_USER_COOKIE, res });
	}
};
