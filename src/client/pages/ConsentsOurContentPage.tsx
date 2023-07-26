import React from 'react';
import useClientState from '@/client/lib/hooks/useClientState';
import { ConsentsOurContent } from '@/client/pages/ConsentsOurContent';

export const ConsentsOurContentPage = () => {
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

	return <ConsentsOurContent consents={consents} />;
};
