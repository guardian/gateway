import React from 'react';
import { ExternalLink } from '@/client/components/ExternalLink';
import { MainBodyText } from '@/client/components/MainBodyText';
import { MinimalLayout } from '@/client/layouts/MinimalLayout';
import locations from '@/shared/lib/locations';

export const NotFoundPage = () => (
	<MinimalLayout
		pageHeader="Sorry – this page does not exist"
		leadText={
			<MainBodyText>
				You may have followed an outdated link, or have mistyped a URL. If you
				believe this to be an error, please{' '}
				<ExternalLink href={locations.REPORT_ISSUE}>report it</ExternalLink>.
			</MainBodyText>
		}
	/>
);
