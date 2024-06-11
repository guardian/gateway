import React from 'react';

import { Mjml, MjmlBody, MjmlHead, MjmlTitle } from '@faire/mjml-react';
import { Header } from '@/email/components/Header';
import { SubHeader } from '@/email/components/SubHeader';
import { Text } from '@/email/components/Text';
import { Footer } from '@/email/components/Footer';

export const RegistrationPasscode = () => {
	return (
		<Mjml>
			<MjmlHead>
				<MjmlTitle>One-time verification code | The Guardian</MjmlTitle>
			</MjmlHead>
			<MjmlBody width={600}>
				<Header />
				<SubHeader>Your verification code</SubHeader>
				<Text>
					Thank you for creating an account with the Guardian. Use the following
					code to verify your email.
				</Text>
				<Text largeText>
					<strong>{`{{CTA}}`}</strong>
				</Text>
				<Text>
					<strong>
						Do not share this code with anyone. This code will expire in 30
						minutes.
					</strong>
				</Text>
				<Text>
					<strong>
						If your code has expired, create your Guardian account again.
					</strong>
				</Text>
				<Footer
					mistakeParagraphComponent={
						'If you didn’t try to create a Guardian account, please disregard this email.'
					}
				/>
			</MjmlBody>
		</Mjml>
	);
};
