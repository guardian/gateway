import React from 'react';

interface OnboardingCardProps {
	backgroundColour?: string;
	children: React.ReactNode;
}

const onboardingSectionCardStyles = (backgroundColour?: string) => ({
	backgroundColor: backgroundColour || '#FFFFFF',
	borderRadius: '8px',
});

export const OnboardingSectionCard = ({
	backgroundColour,
	children,
}: OnboardingCardProps) => {
	return (
		<div css={onboardingSectionCardStyles(backgroundColour)}>{children}</div>
	);
};
