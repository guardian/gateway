import { GeoLocation } from '@/shared/model/Geolocation';
import { NewsLetter, Newsletters } from '@/shared/model/Newsletter';
import {
	readUserNewsletters,
	read as getNewsletters,
} from './idapi/newsletters';
import { Literal } from '@/shared/types';

// map of newsletters to country codes
// undefined also included as key, in case of fallback
// We're currently only using the 'AU' and 'US' keys - whether the newsletters page
// is shown is controlled by getNextWelcomeFlowPage in lib/welcome.ts.
export const NewsletterMap = new Map<
	GeoLocation | undefined,
	Literal<typeof Newsletters>[]
>([
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
		],
	],
]);

export const getUserNewsletterSubscriptions = async ({
	newslettersOnPage,
	accessToken,
}: {
	newslettersOnPage: string[];
	accessToken: string;
}): Promise<NewsLetter[]> => {
	const allNewsletters = await getNewsletters();
	const userNewsletterSubscriptions = await readUserNewsletters({
		accessToken,
	});

	return newslettersOnPage
		.map((id) => allNewsletters.find((newsletter) => newsletter.id === id))
		.map((newsletter) => {
			if (newsletter) {
				// eslint-disable-next-line functional/no-let -- mutation required to update newsletter with user newsletter data, TODO: potential for refactoring to avoid let
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
