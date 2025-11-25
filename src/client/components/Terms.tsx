import React from 'react';
import { InformationBoxText } from '@/client/components/InformationBox';
import { ExternalLink } from '@/client/components/ExternalLink';

export const GuardianTerms = () => (
	<InformationBoxText>
		By proceeding, you agree to our{' '}
		<ExternalLink href="https://www.theguardian.com/help/terms-of-service">
			terms and conditions
		</ExternalLink>
		. For more information about how we use your data, including the generation
		of random identifiers based on your email address for advertising and
		marketing, visit our{' '}
		<ExternalLink href="https://www.theguardian.com/help/privacy-policy">
			privacy policy
		</ExternalLink>
		.
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

const handleIframedLinkClick =
	(linkID: string) => (event: React.MouseEvent<HTMLAnchorElement>) => {
		event.preventDefault();
		window.parent.postMessage(
			{
				context: 'supporterOnboarding',
				type: 'iframedLinkClicked',
				value: linkID,
			},
			'*',
		);
	};
//export const RecaptchaTerms = (isIframed?: boolean = false) => (
export const RecaptchaTerms = ({
	isIframed = false,
}: {
	isIframed?: boolean;
}) => (
	<InformationBoxText>
		This service is protected by reCAPTCHA and the Google{' '}
		<ExternalLink
			href="https://policies.google.com/privacy"
			onClick={
				isIframed ? handleIframedLinkClick('recaptchaPrivacyPolicy') : undefined
			}
		>
			privacy policy
		</ExternalLink>{' '}
		and{' '}
		<ExternalLink
			href="https://policies.google.com/terms"
			onClick={isIframed ? handleIframedLinkClick('recaptchaTerms') : undefined}
		>
			terms of service
		</ExternalLink>{' '}
		apply.
	</InformationBoxText>
);
