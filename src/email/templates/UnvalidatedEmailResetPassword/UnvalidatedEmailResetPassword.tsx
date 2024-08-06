import React from 'react';
import { Button } from '@/email/components/Button';
import { Footer } from '@/email/components/Footer';
import { Header } from '@/email/components/Header';
import { Page } from '@/email/components/Page';
import { SubHeader } from '@/email/components/SubHeader';
import { Text } from '@/email/components/Text';

export const UnvalidatedEmailResetPassword = () => {
	return (
		<Page title="Password reset">
			<Header />
			<SubHeader>Please reset your password</SubHeader>
			<Text>Hello,</Text>
			<Text>
				Because your security is extremely important to us, we have changed our
				password policy. For this reason, you need to reset your password.
			</Text>
			<Text noPaddingBottom>This link is valid for 60 minutes.</Text>
			<Button href={'$passwordResetLink'}>Reset password</Button>
			<Footer
				mistakeParagraphComponent={
					<>
						If you didn&apos;t try to sign in to the Guardian, please ignore
						this email. Your details won&apos;t be changed and no one has
						accessed your account.
					</>
				}
			/>
		</Page>
	);
};
