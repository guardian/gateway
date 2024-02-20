import React from 'react';
import { MainLayout } from '@/client/layouts/Main';
import { MainBodyText } from '@/client/components/MainBodyText';

type ReturnToAppProps = {
	email?: string;
	appName?: string;
};

export const ReturnToApp = ({ email, appName: app }: ReturnToAppProps) => (
	<MainLayout pageHeader="Account Created">
		<MainBodyText>
			You have finished creating your Guardian account
			{email ? (
				<>
					: <b>{email}</b>
				</>
			) : (
				''
			)}
			.
		</MainBodyText>
		<MainBodyText>
			Open the <b>{app ? app : 'Guardian'}</b> app and sign in with your new
			account.
		</MainBodyText>
	</MainLayout>
);
