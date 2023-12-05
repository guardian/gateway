import { ALL_NEWSLETTER_IDS } from '@/shared/model/Newsletter';
import { NewsletterPatch } from '@/shared/model/NewsletterPatch';

// get a list of newsletters that have been updated in the body and compare
// to list of all newsletter ids
export const newslettersSubscriptionsFromFormBody = (body: {
	[key: string]: unknown;
}): NewsletterPatch[] =>
	ALL_NEWSLETTER_IDS.flatMap((id) => {
		// if the id of a newsletter is included in the body
		// then mark this newsletter as to potentially update (subscribe / unsubscribe)
		// otherwise return undefined
		if (id in body) {
			return {
				id,
				subscribed: !!body[id],
			};
		}

		// return empty array if newsletter not in body
		// flatMap will remove this empty array
		return [];
	});
