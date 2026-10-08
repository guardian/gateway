import React, { useState } from 'react';
import { css } from '@emotion/react';
import { palette, remSpace, textSans12 } from '@guardian/source/foundations';
import { NewsLetter } from '@/shared/model/Newsletter';
import { Divider } from '@guardian/source-development-kitchen/react-components';
import { OnboardingCard } from './OnboardingCard';
import { Button } from '@guardian/source/react-components';
import { OnboardingSection } from './OnboardingSection';
import { logger } from '../lib/clientSideLogger';

const NEWSLETTERS: NewsLetter[] = [
	{
		frequency: 'Every weekday',
		name: 'Morning Mail',
		description:
			'Start your day with our Australian curated news roundup, straight to your inbox',
		nameId: 'morning-mail',
		id: '4148',
	},
	{
		frequency: 'Every weekday',
		name: 'Afternoon Update',
		description:
			'Finish your day with Antoun Issa’s three-minute snapshot of Australia’s main news',
		nameId: 'afternoon-update',
		id: '6023',
	},
	{
		frequency: 'Every weekend',
		name: 'Saved for Later',
		description:
			'Catch up every Saturday morning on the fun stuff with Guardian Australia’s culture and lifestyle rundown.',
		nameId: 'saved-for-later',
		id: '6003',
	},
	{
		frequency: 'Fortnightly',
		name: 'The Crunch',
		description:
			'Our data journalists showcase the most important visualisations from the Guardian and around the web',
		nameId: 'the-crunch',
		id: '6034',
	},
];

const labelStyles = css`
	${textSans12};
	display: flex;
	flex-direction: column;
	margin-bottom: ${remSpace[2]};
	color: var(--base-colors-blue-500);
`;

const onboardingCardContainerStyles = css`
	display: grid;
	gap: ${remSpace[2]};
`;

const dividerStylesOverrides = css`
	margin-top: 0px;
`;

interface OnboardingNewsletterSignUpButtonProps {
	newsletter: NewsLetter;
}

const OnboardingNewsletterSignUpButton = ({
	newsletter,
}: OnboardingNewsletterSignUpButtonProps) => {
	const [hasSignedUp, setHasSignedUp] = useState(false);

	const handleSignUp = () => {
		// Make request here.
		logger.info(`User signed up to ${newsletter.name}`);
		setHasSignedUp(true);
	};

	return (
		<Button
			priority="primary"
			size="small"
			type="button"
			isLoading={false}
			onClick={handleSignUp}
		>
			{hasSignedUp ? 'Signed Up' : 'Sign Up'}
		</Button>
	);
};

export const OnboardingNewsletters = () => {
	return (
		<OnboardingSection
			header="Explore more newsletters"
			subHeader="Sign up to our newsletters and get exclusive Guardian journalism straight to your inbox."
		>
			<Divider
				cssOverrides={dividerStylesOverrides}
				size="full"
				spaceAbove="tight"
			/>
			<span css={labelStyles}>
				{' '}
				Newsletters may contain info about charities, online ads, and content
				eslint-disable-next-line no-irregular-whitespace funded by outside
				parties. For more information click here for our privacy policy.
			</span>
			<div css={onboardingCardContainerStyles}>
				{NEWSLETTERS.map((newsletter) => (
					<OnboardingCard
						key={newsletter.id}
						title={newsletter.name}
						description={newsletter.description}
						backgroundColour={palette.brand[800]}
						cta={<OnboardingNewsletterSignUpButton newsletter={newsletter} />}
					/>
				))}
			</div>
		</OnboardingSection>
	);
};
