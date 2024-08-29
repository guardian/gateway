import React from 'react';
import { MainBodyText } from '@/client/components/MainBodyText';
import { buildUrlWithQueryParams } from '@/shared/lib/routeUtils';
import { QueryParams } from '@/shared/model/QueryParams';
import { MainForm } from '@/client/components/MainForm';
import { MinimalLayout } from '@/client/layouts/MinimalLayout';

interface Props {
	token: string;
	queryParams: QueryParams;
	shortRequestId?: string;
}

export const ResendConsentEmail = ({
	token,
	queryParams,
	shortRequestId,
}: Props) => {
	return (
		<MinimalLayout
			shortRequestId={shortRequestId}
			pageHeader="Link expired"
			leadText={
				<>
					<MainBodyText>This link has expired.</MainBodyText>
					<MainBodyText>
						To receive a new link, please click below.
					</MainBodyText>
				</>
			}
		>
			<MainForm
				formAction={buildUrlWithQueryParams(
					'/consent-token/resend',
					{},
					queryParams,
				)}
				submitButtonText="Resend link"
				shortRequestId={shortRequestId}
			>
				<input type="hidden" name="token" value={token} />
			</MainForm>
		</MinimalLayout>
	);
};
