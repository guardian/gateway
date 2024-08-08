import React from 'react';

import { Mjml, MjmlBody, MjmlHead, MjmlTitle } from '@faire/mjml-react';
import { Header } from '@/email/components/Header';
import { SubHeader } from '@/email/components/SubHeader';
import { Text } from '@/email/components/Text';
import { Footer } from '@/email/components/Footer';
import { space } from '@guardian/source/foundations';

type Props = {
	storybookPasscode?: string;
};

export const EmailChallengePasscode = ({ storybookPasscode }: Props) => {
	return (
		<Mjml>
			<MjmlHead>
				<MjmlTitle>Your one-time passcode | The Guardian</MjmlTitle>
			</MjmlHead>
			<MjmlBody width={600}>
				<Header />
				<SubHeader>Your one-time passcode</SubHeader>
				<Text>
					This passcode can only be used once. Do not share this code with
					anyone. This code will expire in 30 minutes.
				</Text>
				<Text largeText letterSpacing={`${space[0]}px`}>
					<strong>{`${storybookPasscode ? storybookPasscode : '{{CTA}}'}`}</strong>
				</Text>
				<Text>If your code has expired, please request a new code.</Text>
				<Footer
					mistakeParagraphComponent={
						'If you did not request this code, you can safely disregard this email.'
					}
				/>
			</MjmlBody>
		</Mjml>
	);
};
