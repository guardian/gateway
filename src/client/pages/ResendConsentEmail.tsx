import React from 'react';
import { MainBodyText } from '@/client/components/MainBodyText';
import { MainLayout } from '@/client/layouts/Main';
import { buildUrlWithQueryParams } from '@/shared/lib/routeUtils';
import { QueryParams } from '@/shared/model/QueryParams';
import { MainForm } from '@/client/components/MainForm';

interface Props {
	token: string;
	queryParams: QueryParams;
}

export const ResendConsentEmail = ({ token, queryParams }: Props) => {
	return (
		<MainLayout pageHeader="Link expired">
			<MainBodyText>This link has expired.</MainBodyText>
			<MainBodyText>To receive a new link, please click below.</MainBodyText>
			<MainForm
				formAction={buildUrlWithQueryParams(
					'/consent-token/resend',
					{},
					queryParams,
				)}
				submitButtonText="Resend link"
			>
				<input type="hidden" name="token" value={token} />
			</MainForm>
		</MainLayout>
	);
};
