import React, { PropsWithChildren } from 'react';
import { css } from '@emotion/react';
import { palette, space, textSans } from '@guardian/source-foundations';
import { ExternalLink } from '@/client/components/ExternalLink';

interface TermsProps {
	withMarginTop?: boolean;
}

const termsBoxStyle = ({ withMarginTop }: TermsProps) => css`
	background-color: ${palette.neutral[93]};
	border-radius: 4px;
	padding: ${space[3]}px ${space[3]}px;
	${withMarginTop && `margin-top: ${space[5]}px;`}
`;

const termsBoxTextStyle = css`
	${textSans.xsmall()}
	margin: 0 0 ${space[2]}px 0;
	&:last-of-type {
		margin: 0;
	}
`;

export const TermsText = ({ children }: { children: React.ReactNode }) => (
	<p css={termsBoxTextStyle}>{children}</p>
);

const TermsLink = ({ children, href }: PropsWithChildren<{ href: string }>) => (
	<ExternalLink
		cssOverrides={css`
			${textSans.xsmall()}
		`}
		href={href}
	>
		{children}
	</ExternalLink>
);

export const TermsBox = ({
	children,
	withMarginTop,
}: PropsWithChildren<TermsProps>) => (
	<div css={termsBoxStyle({ withMarginTop })}>{children}</div>
);

export const GuardianTerms = () => (
	<TermsText>
		By proceeding, you agree to our{' '}
		<TermsLink href="https://www.theguardian.com/help/terms-of-service">
			terms &amp; conditions
		</TermsLink>
		. For information about how we use your data, see our{' '}
		<TermsLink href="https://www.theguardian.com/help/privacy-policy">
			privacy policy
		</TermsLink>
		.
	</TermsText>
);

export const JobsTerms = () => (
	<TermsText>
		By proceeding, you agree to our{' '}
		<TermsLink href="https://jobs.theguardian.com/terms-and-conditions/">
			Guardian Jobs terms &amp; conditions
		</TermsLink>
		. For information about how we use your data, see our{' '}
		<TermsLink href="https://jobs.theguardian.com/privacy-policy/">
			Guardian Jobs privacy policy
		</TermsLink>
		.
	</TermsText>
);

export const RecaptchaTerms = () => (
	<TermsText>
		This service is protected by reCAPTCHA and the Google{' '}
		<TermsLink href="https://policies.google.com/privacy">
			privacy policy
		</TermsLink>{' '}
		and{' '}
		<TermsLink href="https://policies.google.com/terms">
			terms of service
		</TermsLink>{' '}
		apply.
	</TermsText>
);
