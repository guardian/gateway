import React from 'react';
import { Button } from '@/email/components/Button';
import { Footer } from '@/email/components/Footer';
import { Header } from '@/email/components/Header';
import { Link } from '@/email/components/Link';
import { Page } from '@/email/components/Page';
import { SubHeader } from '@/email/components/SubHeader';
import { Text } from '@/email/components/Text';

export const AccountExists = () => {
	return (
		<Page title="Account exists">
			<Header />
			<SubHeader>This account already exists</SubHeader>
			<Text>Hello again,</Text>
			<Text>
				<strong>You are already registered with the Guardian.</strong>
			</Text>
			<Button href="$signInLink">Sign in</Button>
			<Text>If you forgot your password, you can click below to reset it.</Text>
			<Text>
				<Link href="$passwordResetLink">Reset password</Link>
			</Text>
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
