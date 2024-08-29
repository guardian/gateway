import React from 'react';
import { MinimalLayout } from '@/client/layouts/MinimalLayout';
import { MainBodyText } from '@/client/components/MainBodyText';
import { ExternalLink } from '@/client/components/ExternalLink';
import locations from '@/shared/lib/locations';

export type UnexpectedErrorProps = {
	shortRequestId?: string;
};

export const UnexpectedError = ({ shortRequestId }: UnexpectedErrorProps) => {
	return (
		<MinimalLayout
			shortRequestId={shortRequestId}
			pageHeader="Sorry – an unexpected error occurred"
			leadText={
				<>
					<MainBodyText>
						An error occurred, please try again or{' '}
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
