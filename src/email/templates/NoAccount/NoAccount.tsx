import React from 'react';
import { Button } from '@/email/components/Button';
import { Footer } from '@/email/components/Footer';
import { Header } from '@/email/components/Header';
import { Page } from '@/email/components/Page';
import { SubHeader } from '@/email/components/SubHeader';
import { Text } from '@/email/components/Text';

export const NoAccount = () => {
	return (
		<Page title="No account">
			<Header />
			<SubHeader>You don&apos;t have an account</SubHeader>
			<Text>Hello,</Text>
			<Text>
				<strong>You are not registered with The Guardian</strong>
			</Text>
			<Text>
				It&apos;s quick and easy to create an account and we won&apos;t ask you
				for personal details.
			</Text>
			<Text noPaddingBottom>Please click below to register.</Text>
			<Button href="$registerLink">Register with The Guardian</Button>
			<Footer
				mistakeParagraphComponent={
					<>
						If you received this email by mistake, simply delete it. You
						won&apos;t be registered if you don&apos;t click the confirmation
						button above.
					</>
				}
			/>
		</Page>
	);
};
