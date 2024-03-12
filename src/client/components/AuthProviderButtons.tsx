import React from 'react';
import { css } from '@emotion/react';
import { space, brand, from, palette } from '@guardian/source-foundations';
import {
	LinkButton,
	SvgGoogleBrand,
	SvgAppleBrand,
	SvgEnvelope,
} from '@guardian/source-react-components';
import { QueryParams } from '@/shared/model/QueryParams';
import { buildUrlWithQueryParams } from '@/shared/lib/routeUtils';
import { IsNativeApp } from '@/shared/model/ClientState';

type AuthButtonProvider = 'social' | 'email';

type AuthProviderButtonsProps = {
	queryParams: QueryParams;
	marginTop?: boolean;
	isNativeApp?: IsNativeApp;
	providers: AuthButtonProvider[];
};

type AuthProviderButtonProps = {
	label: string;
	icon: React.ReactElement;
	socialProvider: string;
	queryParams: QueryParams;
};

const containerStyles = (marginTop = false) => css`
	display: flex;
	flex-direction: column;
	justify-content: center;
	gap: ${space[3]}px;
	margin-top: ${marginTop ? space[5] : 0}px;
	${from.mobileMedium} {
		margin-top: ${marginTop ? space[6] : 0}px;
	}
	width: 100%;
`;

const buttonOverrides = css`
	border-color: ${palette.brand[400]};
	justify-content: center;
	${from.tablet} {
		min-width: 145px;
		flex-grow: 1;
	}
	@media (prefers-color-scheme: dark) {
		border-color: ${palette.neutral[100]};
		color: ${palette.neutral[100]};
		&:hover {
			background-color: ${palette.neutral[20]};
		}
	}
`;

const emailButton = css`
	width: 100%;
	justify-content: center;
`;

// TODO: If the issue below is fixed and a new version of Source published with that fix in it, then
// you should remove this iconOverrides css
// https://github.com/guardian/source/issues/835
const iconOverrides = css`
	svg {
		margin-top: 3px;
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
				cssOverrides={[buttonOverrides, iconOverrides]}
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
			return <SvgAppleBrand />;
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
	marginTop,
	isNativeApp,
	providers,
}: AuthProviderButtonsProps) => {
	const buttonOrder = getButtonOrder(isNativeApp);
	return (
		<div css={containerStyles(marginTop)}>
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
					cssOverrides={emailButton}
					priority="tertiary"
					href={buildUrlWithQueryParams('/register/email', {}, queryParams)}
				>
					{authProviderButtonLabel('email')}
				</LinkButton>
			)}
		</div>
	);
};
