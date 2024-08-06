import React from 'react';
import { Button } from '@/email/components/Button';
import { Footer } from '@/email/components/Footer';
import { Header } from '@/email/components/Header';
import { Page } from '@/email/components/Page';
import { SubHeader } from '@/email/components/SubHeader';
import { Text } from '@/email/components/Text';

export const CreatePassword = () => {
	return (
		<Page title="Welcome back">
			<Header />
			<SubHeader>Welcome back</SubHeader>
			<Text>Hello again,</Text>
			<Text>Please click below to create a password for your account.</Text>
			<Text noPaddingBottom>This link is valid for 60 minutes.</Text>
			<Button href={'$createPasswordLink'}>Create password</Button>
			<Footer
				mistakeParagraphComponent={
					<>
						If you didn&apos;t try to register, please ignore this email. Your
						details won&apos;t be changed and no one has accessed your account.
					</>
				}
			/>
		</Page>
	);
};
