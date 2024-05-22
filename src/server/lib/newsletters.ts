import { GeoLocation } from '@/shared/model/Geolocation';
import { NewsLetter, Newsletters } from '@/shared/model/Newsletter';
import { readUserNewsletters } from './idapi/newsletters';
import { read as getNewsletters } from '@/server/lib/idapi/newsletters';

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
	ip,
	sc_gu_u,
	newslettersOnPage,
	request_id,
	accessToken,
}: {
	newslettersOnPage: string[];
	ip?: string;
	sc_gu_u?: string;
	request_id?: string;
	accessToken?: string;
}): Promise<NewsLetter[]> => {
	const allNewsletters = await getNewsletters(request_id);
	const userNewsletterSubscriptions = await readUserNewsletters({
		ip,
		sc_gu_u,
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
