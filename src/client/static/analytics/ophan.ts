import { record } from '@/client/lib/ophan';
import { storage } from '@guardian/libs';

const addRefToOphanFollow = () => {
	if (storage.local.isAvailable()) {
		const { search } = window.location;
		const params = new URLSearchParams(search);
		const ref = params.get('ref');
		const refViewId = params.get('refViewId');

		if (ref && refViewId) {
			storage.local.setRaw(
				'ophan_follow',
				JSON.stringify({
					ref,
					refViewId,
				}),
			);
		}
	}
};

addRefToOphanFollow();

// eslint-disable-next-line import/first -- ophan-tracker-js has side effects and requires the above code to be run first
import 'ophan-tracker-js';

export const init = () => {
	record({
		experiences: 'gateway',
		abTestRegister: {
			gateway: {
				variantName: 'gateway',
				complete: false,
			},
		},
	});
};
