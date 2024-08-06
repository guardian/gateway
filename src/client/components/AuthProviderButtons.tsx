import { css } from '@emotion/react';
import {
	LinkButton,
	SvgAppleBrand,
	SvgEnvelope,
	SvgGoogleBrand,
} from '@guardian/source/react-components';
import React from 'react';
import {
	mainSectionStyles,
	secondaryButtonStyles,
} from '@/client/styles/Shared';
import { buildUrlWithQueryParams } from '@/shared/lib/routeUtils';
import type { IsNativeApp } from '@/shared/model/ClientState';
import type { QueryParams } from '@/shared/model/QueryParams';

type AuthButtonProvider = 'social' | 'email';

type AuthProviderButtonsProps = {
	queryParams: QueryParams;
	isNativeApp?: IsNativeApp;
	providers: AuthButtonProvider[];
};

type AuthProviderButtonProps = {
	label: string;
	icon: React.ReactElement;
	socialProvider: string;
	queryParams: QueryParams;
};

const appleIconOverrides = css`
	svg path {
		fill: var(--color-button-secondary-text) !important;
	}
`;

const SocialButton = ({
	label,
	icon,
	socialProvider,
	queryParams,
}: AuthProviderButtonProps) => {
	return (
		<>
			<LinkButton
				priority="tertiary"
				cssOverrides={secondaryButtonStyles()}
				icon={icon}
				href={buildUrlWithQueryParams(
					'/signin/:social',
					{
						social: socialProvider,
					},
					queryParams,
				)}
				data-cy={`${socialProvider}-sign-in-button`}
				data-link-name={`${socialProvider}-social-button`}
			>
				{authProviderButtonLabel(label)}
			</LinkButton>
		</>
	);
};

const authProviderButtonLabel = (label: string) => {
	// We don't capitalize 'email', but we do capitalize 'google' and 'apple'
	const capitalisedLabel =
		label === 'email' ? label : label.charAt(0).toUpperCase() + label.slice(1);

	return `Continue with ${capitalisedLabel}`;
};

const socialButtonIcon = (socialProvider: string): React.ReactElement => {
	switch (socialProvider) {
		case 'google':
			return <SvgGoogleBrand />;
		case 'apple':
			return (
				<div css={appleIconOverrides}>
					<SvgAppleBrand />
				</div>
			);
		default:
			// null is the officially recommended way to return nothing from a React component,
			// but LinkButton doesn't accept it, so we return an empty JSX element instead
			// cf. https://stackoverflow.com/a/47192387
			return <></>;
	}
};

const getButtonOrder = (isNativeApp?: IsNativeApp): string[] => {
	switch (isNativeApp) {
		case 'ios':
			return ['apple', 'google'];
		case 'android':
			return ['google', 'apple'];
		default:
			return ['google', 'apple'];
	}
};

export const AuthProviderButtons = ({
	queryParams,
	isNativeApp,
	providers,
}: AuthProviderButtonsProps) => {
	const buttonOrder = getButtonOrder(isNativeApp);
	return (
		<div css={mainSectionStyles}>
			{providers.includes('social') &&
				buttonOrder.map((socialProvider) => (
					<SocialButton
						key={socialProvider}
						label={socialProvider}
						icon={socialButtonIcon(socialProvider)}
						socialProvider={socialProvider}
						queryParams={queryParams}
					/>
				))}
			{providers.includes('email') && (
				<LinkButton
					icon={<SvgEnvelope />}
					cssOverrides={secondaryButtonStyles()}
					priority="tertiary"
					href={buildUrlWithQueryParams('/register/email', {}, queryParams)}
				>
					{authProviderButtonLabel('email')}
				</LinkButton>
			)}
		</div>
	);
};
