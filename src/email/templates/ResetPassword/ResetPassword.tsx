import React from 'react';

import { Page } from '@/email/components/Page';
import { Button } from '@/email/components/Button';
import { Header } from '@/email/components/Header';
import { SubHeader } from '@/email/components/SubHeader';
import { Text } from '@/email/components/Text';
import { Footer } from '@/email/components/Footer';
import { Link } from '@/email/components/Link';

export const ResetPassword = () => {
	return (
		<Page title="Reset your password">
			<Header />
			<SubHeader>Password reset</SubHeader>
			<Text>Hello,</Text>
			<Text>
				You&apos;ve asked us to send you a link to reset your password.
			</Text>
			<Text noPaddingBottom>
				This link is valid for 60 minutes. If your link has expired, please try{' '}
				<Link href="https://profile.theguardian.com/reset-password">
					resetting your password again
				</Link>
				.
			</Text>
			<Button href={'$passwordResetLink'}>Reset password</Button>
			<Footer
				mistakeParagraphComponent={
					<>
						If you didn&apos;t request to reset your password, please ignore
						this email. Your details won&apos;t be changed and no one has
						accessed your account.
					</>
				}
			/>
		</Page>
	);
};
