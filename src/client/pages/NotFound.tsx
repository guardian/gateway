import React from 'react';
import { MinimalLayout } from '@/client/layouts/MinimalLayout';
import { MainBodyText } from '@/client/components/MainBodyText';
import { ExternalLink } from '@/client/components/ExternalLink';
import locations from '@/shared/lib/locations';

type NotFoundProps = {
	shortRequestId?: string;
};

export const NotFound = ({ shortRequestId }: NotFoundProps) => {
	return (
		<MinimalLayout
			shortRequestId={shortRequestId}
			pageHeader="Sorry – this page does not exist"
			leadText={
				<>
					<MainBodyText>
						You may have followed an outdated link, or have mistyped a URL. If
						you believe this to be an error, please{' '}
						<ExternalLink href={locations.REPORT_ISSUE}>report it</ExternalLink>
						.
					</MainBodyText>
					{shortRequestId && (
						<MainBodyText>Request ID: {shortRequestId}</MainBodyText>
					)}
				</>
			}
		/>
	);
};
