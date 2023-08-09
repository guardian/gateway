import React from 'react';
import useClientState from '@/client/lib/hooks/useClientState';
import { ConsentsConfirmation } from '@/client/pages/ConsentsConfirmation';
import { Consents } from '@/shared/model/Consent';
import { abSwitches } from '@/shared/model/experiments/abSwitches';
import { Newsletters } from '@/shared/model/Newsletter';
import { useAB } from '@guardian/ab-react';
import { abSimplifyRegistrationFlowTest } from '@/shared/model/experiments/tests/abSimplifyRegistrationFlowTest';

export const ConsentsConfirmationPage = () => {
	const clientState = useClientState();
	const { pageData = {}, globalMessage: { error, success } = {} } = clientState;
	const ABTestAPI = useAB();
	const isInAbSimplifyRegFlowTest = ABTestAPI.isUserInVariant(
		abSimplifyRegistrationFlowTest.id,
		abSimplifyRegistrationFlowTest.variants[0].id,
	);
	const {
		consents = [],
		newsletters = [],
		returnUrl = 'https://www.theguardian.com',
	} = pageData;

	// Note: profiling_optout is modelled as profiling_optin for Gateway
	const optedIntoProfiling = !!consents.find(
		(consent) => consent.id === Consents.PROFILING && consent.consented,
	);

	const optedIntoPersonalisedAdvertising = !!consents.find(
		(consent) => consent.id === Consents.ADVERTISING && consent.consented,
	);

	const productConsents = consents.filter(
		(c) =>
			!c.id.includes('_optin') &&
			!c.id.includes(Consents.ADVERTISING) &&
			c.consented,
	);

	const subscribedNewsletters = newsletters.filter((n) => n.subscribed);

	// @AB_TEST: Default Weekly Newsletter Test:
	// When the switch is off, the trial newsletter will still show up on the confirmation page
	// if an existing user who signed up during the trial manually navigates back to the /consents/confirmation page
	// We need to filter for this until the AB Test Saturday Roundup is deleted including from the Newsletter Enum here: src/shared/model/Newsletter.ts
	const filteredSubscribedNewsletters = abSwitches.abDefaultWeeklyNewsletterTest
		? subscribedNewsletters
		: subscribedNewsletters.filter(
				(n) => n.id !== Newsletters.SATURDAY_ROUNDUP_TRIAL,
		  );

	return (
		<ConsentsConfirmation
			error={error}
			success={success}
			returnUrl={returnUrl}
			optedIntoProfiling={optedIntoProfiling}
			optedIntoPersonalisedAdvertising={optedIntoPersonalisedAdvertising}
			productConsents={productConsents}
			subscribedNewsletters={filteredSubscribedNewsletters}
			isInAbSimplifyRegFlowTest={isInAbSimplifyRegFlowTest}
		/>
	);
};
