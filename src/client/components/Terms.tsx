import React from 'react';
import { InformationBoxText } from '@/client/components/InformationBox';
import { ExternalLink } from '@/client/components/ExternalLink';
import { css } from '@emotion/react';

type GuardianTermsProps = {
	isGoogleOneTap?: boolean;
};

const moreInfoCopy = () => (
	<>
		For more information about how we use your data, including the generation of
		random identifiers based on your email address for advertising and
		marketing, visit our{' '}
		<ExternalLink href="https://www.theguardian.com/help/privacy-policy">
			privacy policy
		</ExternalLink>
		.
	</>
);

export const GuardianTerms = ({ isGoogleOneTap }: GuardianTermsProps) => (
	<InformationBoxText>
		By proceeding, you agree to our{' '}
		<ExternalLink href="https://www.theguardian.com/help/terms-of-service">
			terms and conditions
		</ExternalLink>
		.
		{isGoogleOneTap ? (
			<p
				css={css(`
					margin-bottom: 0;
				`)}
			>
				{moreInfoCopy()}
			</p>
		) : (
			<> {moreInfoCopy()}</>
		)}
	</InformationBoxText>
);

export const JobsTerms = () => (
	<InformationBoxText>
		By proceeding, you agree to our{' '}
		<ExternalLink href="https://jobs.theguardian.com/terms-and-conditions/">
			Guardian Jobs terms and conditions
		</ExternalLink>
		. For information about how we use your data, see our{' '}
		<ExternalLink href="https://jobs.theguardian.com/privacy-policy/">
			Guardian Jobs privacy policy
		</ExternalLink>
		.
	</InformationBoxText>
);
