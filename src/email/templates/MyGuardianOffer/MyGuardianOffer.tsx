import React from 'react';

import { Mjml, MjmlBody, MjmlHead, MjmlTitle } from '@faire/mjml-react';
import { Header } from '@/email/components/Header';
import { SubHeader } from '@/email/components/SubHeader';
import { Text } from '@/email/components/Text';
import { Footer } from '@/email/components/Footer';
import { Button } from '@/email/components/Button';

export const MyGuardianOffer = () => {
	return (
		<Mjml>
			<MjmlHead>
				<MjmlTitle>Access to My Guardian | The Guardian</MjmlTitle>
			</MjmlHead>
			<MjmlBody width={600}>
				<Header />
				<SubHeader>Welcome to the Guardian</SubHeader>
				<Text>
					Thank you for creating an account with the Guardian, and for
					expressing an interest in My Guardian, our new personalised space.
				</Text>
				<Text>
					My Guardian is currently available in our app, which you can download
					from the Apple App Store or Google Play Store. Your expression of
					interest helps us know to bring it to the web soon.
				</Text>
				<Text>
					To say thank you, here is a Guardian Live discount code, allowing 20%
					off all livestreamed events.
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
