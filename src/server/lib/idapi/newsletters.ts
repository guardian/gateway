import {
	idapiFetch,
	APIGetOptions,
	APIPatchOptions,
	APIPostOptions,
	APIAddOAuthAuthorization,
} from '@/server/lib/IDAPIFetch';
import { NewslettersErrors } from '@/shared/model/Errors';
import { NewsLetter } from '@/shared/model/Newsletter';
import { logger } from '@/server/lib/serverSideLogger';
import { IdapiError } from '@/server/models/Error';
import { NewsletterPatch } from '@/shared/model/NewsletterPatch';

interface NewsletterAPIResponse {
	id: string;
	theme: string;
	name: string;
	description: string;
	frequency: string;
	subscribed: boolean;
	exactTargetListId: number;
}

const handleError = () => {
	throw new IdapiError({ message: NewslettersErrors.GENERIC, status: 500 });
};

const responseToEntity = (newsletter: NewsletterAPIResponse): NewsLetter => {
	const { name, description, frequency, exactTargetListId, id } = newsletter;
	return {
		id: exactTargetListId.toString(),
		description,
		name,
		frequency,
		nameId: id,
	};
};

export const read = async (): Promise<NewsLetter[]> => {
	const options = APIGetOptions();
	try {
		return (
			(await idapiFetch({
				path: '/newsletters',
				options,
			})) as NewsletterAPIResponse[]
		).map(responseToEntity);
	} catch (error) {
		logger.error(`IDAPI Error newsletters read '/newsletters'`, error);
		return handleError();
	}
};

export const update = async ({
	accessToken,
	payload,
}: {
	accessToken: string;
	payload: NewsletterPatch[];
}) => {
	const options = APIAddOAuthAuthorization(
		APIPatchOptions(payload),
		accessToken,
	);

	try {
		await idapiFetch({
			path: '/users/me/newsletters',
			options,
		});
		return;
	} catch (error) {
		logger.error(
			`IDAPI Error newsletters update '/users/me/newsletters'`,
			error,
		);
		return handleError();
	}
};

interface Subscription {
	listId: number;
}

export const readUserNewsletters = async ({
	accessToken,
}: {
	ip?: string;
	accessToken: string;
}) => {
	const options = APIAddOAuthAuthorization(APIGetOptions(), accessToken);

	try {
		return (
			await idapiFetch({
				path: '/users/me/newsletters',
				options,
			})
		).result.subscriptions.map((s: Subscription) => s.listId.toString());
	} catch (error) {
		logger.error(
			`IDAPI Error readUserNewsletters '/users/me/newsletters'`,
			error,
		);
		return handleError();
	}
};

export const touchBraze = async ({ accessToken }: { accessToken: string }) => {
	const options = APIAddOAuthAuthorization(APIPostOptions(), accessToken);

	try {
		await idapiFetch({
			path: '/users/me/touch-braze',
			options,
		});
		return;
	} catch (error) {
		logger.error(`IDAPI Error touchBraze '/users/me/touch-braze'`, error);
		return handleError();
	}
};
