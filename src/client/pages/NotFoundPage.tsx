import React from 'react';
import locations from '@/shared/lib/locations';
import { ExternalLink } from '@/client/components/ExternalLink';
import { MainBodyText } from '@/client/components/MainBodyText';
import { MinimalLayout } from '../layouts/MinimalLayout';

export const NotFoundPage = () => (
	<MinimalLayout pageHeader="Sorry – this page does not exist">
		<MainBodyText>
			You may have followed an outdated link, or have mistyped a URL. If you
			believe this to be an error, please{' '}
			<ExternalLink href={locations.REPORT_ISSUE}>report it</ExternalLink>.
		</MainBodyText>
	</MinimalLayout>
);
