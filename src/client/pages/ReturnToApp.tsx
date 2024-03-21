import React from 'react';
import { MainBodyText } from '@/client/components/MainBodyText';
import { MinimalLayout } from '../layouts/MinimalLayout';

type ReturnToAppProps = {
	email?: string;
	appName?: string;
};

export const ReturnToApp = ({ email, appName: app }: ReturnToAppProps) => (
	<MinimalLayout pageHeader="Account Created">
		<MainBodyText>
			You have finished creating your Guardian account
			{email ? (
				<>
					: <strong>{email}</strong>
				</>
			) : (
				'.'
			)}
		</MainBodyText>
		<MainBodyText>
			Open the <strong>{app ? app : 'Guardian'}</strong> app and sign in with
			your new account.
		</MainBodyText>
	</MinimalLayout>
);
