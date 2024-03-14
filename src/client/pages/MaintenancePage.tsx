import React from 'react';
import { MainBodyText } from '@/client/components/MainBodyText';
import { MinimalLayout } from '../layouts/MinimalLayout';

export const MaintenancePage = () => (
	<MinimalLayout pageHeader="We’ll be back soon">
		<MainBodyText>
			Sorry for the inconvenience. We are currently performing some essential
			maintenance. Please try again later.
		</MainBodyText>
	</MinimalLayout>
);
