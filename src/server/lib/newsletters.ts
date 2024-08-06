import type { GeoLocation } from '@/shared/model/Geolocation';
import type { NewsLetter } from '@/shared/model/Newsletter';
import { Newsletters } from '@/shared/model/Newsletter';
import {
	read as getNewsletters,
	readUserNewsletters,
} from './idapi/newsletters';

// map of newsletters to country codes
// undefined also included as key, in case of fallback
// We're currently only using the 'AU' and 'US' keys - whether the newsletters page
// is shown is controlled by getNextWelcomeFlowPage in lib/welcome.ts.
export const NewsletterMap = new Map<GeoLocation | undefined, Newsletters[]>([
	[undefined, []],
	['ROW', []],
	['GB', []],
	[
		'AU',
		[
			Newsletters.MORNING_MAIL_AU,
			Newsletters.AFTERNOON_UPDATE_AU,
			Newsletters.SAVED_FOR_LATER_AU,
			Newsletters.THE_CRUNCH_AU,
		],
	],
	['EU', []],
	[
		'US',
		[
			Newsletters.HEADLINES_US,
			Newsletters.THE_STAKES_US,
			Newsletters.WELL_ACTUALLY,
			Newsletters.TRUMP_ON_TRIAL_US,
		],
	],
]);

export const getUserNewsletterSubscriptions = async ({
	newslettersOnPage,
	request_id,
	accessToken,
}: {
	newslettersOnPage: string[];
	request_id?: string;
	accessToken: string;
}): Promise<NewsLetter[]> => {
	const allNewsletters = await getNewsletters(request_id);
	const userNewsletterSubscriptions = await readUserNewsletters({
		request_id,
		accessToken,
	});

	return newslettersOnPage
		.map((id) => allNewsletters.find((newsletter) => newsletter.id === id))
		.map((newsletter) => {
			if (newsletter) {
				//eslint-disable-next-line functional/no-let
				let updated = newsletter;
				if (userNewsletterSubscriptions.includes(newsletter.id)) {
					updated = {
						...updated,
						subscribed: true,
					};
				}
				return updated;
			}
		})
		.filter(Boolean) as NewsLetter[];
};
