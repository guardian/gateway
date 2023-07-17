import React from 'react';

import { Page } from '@/email/components/Page';
import { Button } from '@/email/components/Button';
import { Header } from '@/email/components/Header';
import { SubHeader } from '@/email/components/SubHeader';
import { Text } from '@/email/components/Text';
import { Footer } from '@/email/components/Footer';

export const CompleteRegistration = () => {
	return (
		<Page title="Complete your Guardian account">
			<Header />
			<SubHeader>Welcome to the Guardian</SubHeader>
			<Text>Please click below to complete your registration.</Text>
			<Text noPaddingBottom>This link is valid for 60 minutes.</Text>
			<Button href={'$activateLink'}>Complete registration</Button>
			<Footer
				mistakeParagraphComponent={
					<>
						If you received this email by mistake, please delete it. Your
						registration won&apos;t be complete if you don&apos;t click the
						&lsquo;Complete registration&rsquo; button above.
					</>
				}
			/>
		</Page>
	);
};
