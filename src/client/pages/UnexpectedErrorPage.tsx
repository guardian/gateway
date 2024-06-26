import React from 'react';
import locations from '@/shared/lib/locations';
import { ExternalLink } from '@/client/components/ExternalLink';
import { MainBodyText } from '@/client/components/MainBodyText';
import { MinimalLayout } from '@/client/layouts/MinimalLayout';

export const UnexpectedErrorPage = () => (
	<MinimalLayout
		pageHeader="Sorry – an unexpected error occurred"
		leadText={
			<MainBodyText>
				An error occurred, please try again or{' '}
				<ExternalLink href={locations.REPORT_ISSUE}>report it</ExternalLink>.
			</MainBodyText>
		}
	/>
);
