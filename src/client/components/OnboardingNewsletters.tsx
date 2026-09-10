import React from 'react';
import {
	headlineMedium28,
	textEgyptian17,
	textSans12,
	remSpace,
} from '@guardian/source/foundations';
import { NewsLetter } from '@/shared/model/Newsletter';
import { ToggleSwitchList } from './ToggleSwitchList';
import { MainBodyText } from './MainBodyText';
import { NewsletterToggleSwitchInput } from './NewsletterToggleSwitchInput';
import { css } from '@emotion/react';
import { Divider } from '@guardian/source-development-kitchen/react-components';

const titleStyles = css`
	${headlineMedium28};
	display: flex;
	margin-bottom: ${remSpace[1]};
	line-height: 1.4;
`;

const descriptionStyles = css`
	${textEgyptian17};
	margin-bottom: ${remSpace[4]};
	display: flex;
`;

const labelStyles = css`
	${textSans12};
	display: flex;
	flex-direction: column;
	margin-bottom: ${remSpace[2]};
	color: var(--base-colors-blue-500);
`;

const onboardingNewslettersStyles = css`
	border-radius: 4px;
	padding: ${remSpace[2]};
`;
export const OnboardingNewsletters = ({
	newsletters,
}: {
	newsletters: NewsLetter[];
}) => {
	return (
		<MainBodyText cssOverrides={onboardingNewslettersStyles}>
			<span css={titleStyles}> Explore more newsletters</span>
			<span css={descriptionStyles}>
				{' '}
				Sign up to our newsletters and get exclusive Guardian journalism
				straight to your inbox.
			</span>
			<Divider size="full" spaceAbove="tight" />
			<span css={labelStyles}>
				{' '}
				Newsletters may contain info about charities, online ads, and content
				eslint-disable-next-line no-irregular-whitespace funded by outside
				parties. For more information click here for our privacy policy.
			</span>

			<ToggleSwitchList>
				{newsletters.map((newsletter) => (
					<NewsletterToggleSwitchInput
						key={newsletter.id}
						id={newsletter.id}
						title={newsletter.name}
						description={newsletter.description}
						subLabel={newsletter.frequency}
					/>
				))}
			</ToggleSwitchList>
		</MainBodyText>
	);
};
