import React from 'react';
import { css } from '@emotion/react';
import { Button, Hide } from '@guardian/source/react-components';

const buttonStyles = css`
	background-color: var(--color-onboarding-card-cta-background);
	color: var(--color-onboarding-card-cta-text);
`;

interface OnboardingButtonProps {
	text: string;
	onClick?: () => void;
	mobileIcon: React.ReactElement;
	webIcon: React.ReactElement;
}

export const OnboardingButton = ({
	onClick,
	webIcon,
	mobileIcon,
	text,
}: OnboardingButtonProps) => {
	return (
		<>
			<Hide from="tablet">
				<Button
					priority="primary"
					size="xsmall"
					cssOverrides={buttonStyles}
					type="button"
					isLoading={false}
					onClick={onClick}
					icon={mobileIcon}
				>
					{text ?? 'Sign Up'}
				</Button>
			</Hide>
			<Hide until="tablet">
				<Button
					priority="primary"
					size="small"
					cssOverrides={buttonStyles}
					type="button"
					isLoading={false}
					onClick={onClick}
					icon={webIcon}
				>
					{text}
				</Button>
			</Hide>
		</>
	);
};
