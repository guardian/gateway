import React from 'react';

import { Mjml, MjmlBody, MjmlHead, MjmlTitle } from '@faire/mjml-react';
import { Header } from '@/email/components/Header';
import { SubHeader } from '@/email/components/SubHeader';
import { Text } from '@/email/components/Text';
import { Footer } from '@/email/components/Footer';
import { Button } from '@/email/components/Button';

export const GuardianLiveOffer = () => {
	return (
		<Mjml>
			<MjmlHead>
				<MjmlTitle>
					Your Guardian account and discount code | The Guardian
				</MjmlTitle>
			</MjmlHead>
			<MjmlBody width={600}>
				<Header />
				<SubHeader>Welcome to the Guardian</SubHeader>
				<Text>Thank you for creating an account with the Guardian.</Text>
				<Text>
					Here is your Guardian Live discount code, allowing 20% off all
					livestreamed events.
				</Text>
				<Text>
					<strong>LIVEREG20</strong>
				</Text>
				<Button href="https://www.theguardian.com/guardian-live-events">
					Visit Guardian Live
				</Button>
				<Footer />
			</MjmlBody>
		</Mjml>
	);
};
