import { Mjml, MjmlBody, MjmlHead, MjmlTitle } from '@faire/mjml-react';
import { space } from '@guardian/source/foundations';
import React from 'react';
import { Footer } from '@/email/components/Footer';
import { Header } from '@/email/components/Header';
import { SubHeader } from '@/email/components/SubHeader';
import { Text } from '@/email/components/Text';

type Props = {
	storybookPasscode?: string;
};

export const RegistrationPasscode = ({ storybookPasscode }: Props) => {
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
				<Text largeText letterSpacing={`${space[0]}px`}>
					<strong>{`${storybookPasscode ? storybookPasscode : '{{CTA}}'}`}</strong>
				</Text>
				<Text>
					Do not share this code with anyone. This code will expire in 30
					minutes.
				</Text>
				<Text>
					If your code has expired, create your Guardian account again.
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
