import React from 'react';
import { InformationBoxText } from '@/client/components/InformationBox';
import { ExternalLink } from '@/client/components/ExternalLink';

export const GuardianTerms = () => (
	<InformationBoxText>
		By proceeding, you agree to our{' '}
		<ExternalLink href="https://www.theguardian.com/help/terms-of-service">
			terms &amp; conditions
		</ExternalLink>
		. For information about how we use your data, see our{' '}
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
			Guardian Jobs terms &amp; conditions
		</ExternalLink>
		. For information about how we use your data, see our{' '}
		<ExternalLink href="https://jobs.theguardian.com/privacy-policy/">
			Guardian Jobs privacy policy
		</ExternalLink>
		.
	</InformationBoxText>
);

export const RecaptchaTerms = () => (
	<InformationBoxText>
		This service is protected by reCAPTCHA and the Google{' '}
		<ExternalLink href="https://policies.google.com/privacy">
			privacy policy
		</ExternalLink>{' '}
		and{' '}
		<ExternalLink href="https://policies.google.com/terms">
			terms of service
		</ExternalLink>{' '}
		apply.
	</InformationBoxText>
);
