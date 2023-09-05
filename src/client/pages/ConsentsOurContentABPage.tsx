//@AB_TEST: 3 Stage Registration Flow Test
import React from 'react';
import useClientState from '@/client/lib/hooks/useClientState';
import { ConsentsOurContentAB } from '@/client/pages/ConsentsOurContentAB';

export const ConsentsOurContentABPage = () => {
	const clientState = useClientState();

	const { pageData = {} } = clientState;

	const consents = [
		...(pageData?.consents?.filter((c) => c.id === 'supporter') ?? []).map(
			(consent) => ({
				type: 'consent' as const,
				consent,
			}),
		),
		...(pageData?.newsletters ?? []).map((newsletter) => ({
			type: 'newsletter' as const,
			consent: newsletter,
		})),
		...(pageData?.consents?.filter((c) => c.id !== 'supporter') ?? []).map(
			(consent) => ({
				type: 'consent' as const,
				consent,
			}),
		),
	];

	return <ConsentsOurContentAB consents={consents} />;
};
