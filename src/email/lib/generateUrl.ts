import { SignInGateIdsForOfferEmails } from '@/server/lib/ophan';
import { TrackingQueryParams } from '@/shared/model/QueryParams';

type Props = {
	base?: string;
	path: string;
	token?: string;
	isIdapiUrl?: boolean;
	signInGateId?: SignInGateIdsForOfferEmails;
} & TrackingQueryParams;

export const generateUrl = ({
	base = process.env.OKTA_ORG_URL,
	path,
	token,
	isIdapiUrl = false,
	ref,
	refViewId,
	signInGateId,
}: Props) => {
	const params = new URLSearchParams();

	if (isIdapiUrl) {
		params.append('useIdapi', 'true');
	}

	if (ref) {
		params.append('ref', ref);
	}

	if (refViewId) {
		params.append('refViewId', refViewId);
	}

	if (signInGateId) {
		params.append('signInGateId', signInGateId);
	}

	const urlParts = [
		base,
		'/',
		path,
		token ? `/${token}` : '',
		params.size ? `?${params.toString()}` : '',
	];
	return urlParts.join('');
};
