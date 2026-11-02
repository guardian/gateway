import React, { useRef, useState } from 'react';
import { css } from '@emotion/react';
import {
	palette,
	remSpace,
	textSans12,
	textSans17,
} from '@guardian/source/foundations';
import { NewsLetter, NewslettersWithImages } from '@/shared/model/Newsletter';
import { Divider } from '@guardian/source-development-kitchen/react-components';
import { OnboardingCard } from './OnboardingCard';
import {
	Button,
	Hide,
	SvgPlusOnRound,
	SvgTickRound,
} from '@guardian/source/react-components';
import { OnboardingSection } from './OnboardingSection';
import { logger } from '../lib/clientSideLogger';
import { SATURDAY_EDITION_SMALL_SQUARE_IMAGE } from '../assets/newsletters';
import { NEWSLETTER_IMAGES } from '../models/Newsletter';
import { RoundOnboardingImage } from './OnboardingImage';
import { MainForm } from './MainForm';
import { QueryParams } from '@/shared/model/QueryParams';
import { buildUrlWithQueryParams } from '@/shared/lib/routeUtils';
// import { singleNewsletterOphanTracking } from '../lib/consentsTracking';

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
	margin: 0;
	color: var(--color-alert-info);
`;

const onboardingCardContainerStyles = css`
	display: grid;
	gap: ${remSpace[2]};
`;

const dividerStylesOverrides = css`
	margin-top: 0px;
`;

const guardianSansText = css`
	${textSans17};
	display: flex;
	align-items: center;
`;

interface OnboardingNewsletterSignUpButtonProps {
	newsletter: NewsLetter;
	queryParams: QueryParams;
}
const OnboardingNewsletterSignUpButton = ({
	newsletter,
	queryParams,
}: OnboardingNewsletterSignUpButtonProps) => {
	const formRef = useRef<HTMLFormElement>(null);
	const formTrackingName = `onboarding-newsletter`;
	const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');

	const signUp = async (form: HTMLFormElement) => {
		setStatus('loading');
		try {
			const res = await fetch(form.action, {
				method: 'POST',
				credentials: 'same-origin',
				headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
				// URLSearchParams rather than raw FormData: raw FormData is sent as
				// multipart, which the urlencoded body parser won't read (so the
				// _csrf field would be lost)
				body: new URLSearchParams(
					new FormData(form) as unknown as Record<string, string>,
				),
			});

			if (!res.ok) {
				throw new Error(`Newsletter signup failed: ${res.status}`);
			}

			logger.info(`User signed up to ${newsletter.name}`);
			setStatus('success');
		} catch (error) {
			logger.error(`Newsletter signup error for ${newsletter.name}`, error);
			setStatus('idle'); // allow retry; surface an error message here if you want
		}
	};

	return status !== 'success' ? (
		<MainForm
			formAction={buildUrlWithQueryParams(
				'/welcome/onboarding/newsletter',
				{},
				queryParams,
			)}
			formTrackingName={formTrackingName}
			formRef={formRef}
			onSubmit={(event) => {
				logger.info(`User signed up to ${newsletter.name}`);
				event.preventDefault();
				void signUp(event.currentTarget);

				// singleNewsletterOphanTracking(
				// 	formRef.current as HTMLFormElement,
				// 	newsletter,
				// );
				return undefined;
			}}
			submitButtonText="Sign Up"
			renderSubmitButton={false}
		>
			<input type="hidden" name="newsletterId" value={newsletter.id} />
			<Hide from="tablet">
				<Button
					priority="primary"
					size="xsmall"
					type="submit"
					isLoading={status === 'loading'}
					icon={SvgPlusOnRound({
						size: 'small',
					})}
				>
					Sign Up
				</Button>
			</Hide>
			<Hide until="tablet">
				<Button
					priority="primary"
					size="small"
					type="submit"
					isLoading={status === 'loading'}
					icon={SvgPlusOnRound({
						size: 'small',
					})}
				>
					Sign Up
				</Button>
			</Hide>
		</MainForm>
	) : (
		<span css={guardianSansText}>
			<SvgTickRound size="small" theme={{ fill: palette.success[400] }} />
			You&apos;re signed up!
		</span>
	);
};

const getNewsletterImage = (newsletterId: NewslettersWithImages) => {
	return NEWSLETTER_IMAGES[newsletterId] ?? SATURDAY_EDITION_SMALL_SQUARE_IMAGE;
};

export interface OnboardingNewslettersProps {
	queryParams: QueryParams;
}

export const OnboardingNewsletters = ({
	queryParams,
}: OnboardingNewslettersProps) => {
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
			<p css={labelStyles}>
				Newsletters may contain info about charities, online ads, and content
				funded by outside parties. For more information click here for our
				privacy policy.
			</p>
			<div css={onboardingCardContainerStyles}>
				{NEWSLETTERS.map((newsletter) => (
					<OnboardingCard
						key={newsletter.id}
						title={newsletter.name}
						description={newsletter.description}
						backgroundColour="#F3F7FF"
						cta={
							<OnboardingNewsletterSignUpButton
								newsletter={newsletter}
								queryParams={queryParams}
							/>
						}
						image={
							<RoundOnboardingImage
								path={getNewsletterImage(
									newsletter.id as NewslettersWithImages,
								)}
								alt={`${newsletter.name} newsletter`}
							/>
						}
					/>
				))}
			</div>

			<Button priority="tertiary" type="button">
				Browse more newsletters
			</Button>
		</OnboardingSection>
	);
};
