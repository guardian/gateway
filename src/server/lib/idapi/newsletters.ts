import {
	idapiFetch,
	APIGetOptions,
	APIPatchOptions,
	APIOptionSelect,
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

export const read = async (request_id?: string): Promise<NewsLetter[]> => {
	const options = APIGetOptions();
	try {
		return (
			(await idapiFetch({
				path: '/newsletters',
				options,
			})) as NewsletterAPIResponse[]
		).map(responseToEntity);
	} catch (error) {
		logger.error(`IDAPI Error newsletters read '/newsletters'`, error, {
			request_id,
		});
		return handleError();
	}
};

export const update = async ({
	ip,
	sc_gu_u,
	accessToken,
	payload,
	request_id,
}: {
	ip?: string;
	sc_gu_u?: string;
	accessToken?: string;
	payload: NewsletterPatch[];
	request_id?: string;
}) => {
	const options = APIOptionSelect({
		ip,
		sc_gu_u,
		accessToken,
		options: APIPatchOptions(payload),
	});

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
			{
				request_id,
			},
		);
		return handleError();
	}
};

interface Subscription {
	listId: number;
}

export const readUserNewsletters = async ({
	ip,
	sc_gu_u,
	accessToken,
	request_id,
}: {
	ip?: string;
	sc_gu_u?: string;
	accessToken?: string;
	request_id?: string;
}) => {
	const options = APIOptionSelect({
		ip,
		sc_gu_u,
		accessToken,
		options: APIGetOptions(),
	});

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
			{
				request_id,
			},
		);
		return handleError();
	}
};
