import React from 'react';
import locations from '@/shared/lib/locations';
import { SUPPORT_EMAIL } from '@/shared/model/Configuration';
import { css } from '@emotion/react';
import {
	remSpace,
	size,
	space,
	textSans17,
	textSansBold17,
} from '@guardian/source/foundations';
import { error as errorColors } from '@guardian/source/foundations';
import { SvgAlertRound } from '@guardian/source/react-components';

const wrapperStyles = css`
	border: 2px solid ${errorColors[400]};
	border-radius: 4px;
	padding: ${space[1]}px;
	display: flex;
`;

const iconStyles = css`
	display: flex;
	flex: 0 1 auto;
	margin-top: 1px;
	svg {
		fill: ${errorColors[400]};
		height: ${size.xsmall}px;
		width: ${size.xsmall}px;
	}
`;

const messageStyles = css`
	${textSansBold17};
	line-height: 1.4;
	color: ${errorColors[400]};
`;

const messageWrapperStyles = css`
	margin-left: ${space[1]}px;
`;

const contextStyles = css`
	${textSans17};
`;

const errorContextSpacing = css`
	margin: 0;
	margin-top: ${space[2]}px;
`;

const errorContextLastTypeSpacing = css`
	margin-bottom: 0;
	&:last-child {
		margin-bottom: ${remSpace[3]};
	}
`;

const errorMessageStyles = css`
	border-color: var(--color-alert-error);
	color: var(--color-alert-error);
	div {
		color: var(--color-alert-error);
	}
	svg {
		fill: var(--color-alert-error) !important;
	}
	a {
		${textSansBold17};
		color: var(--color-alert-error);
	}
`;

/**
 * @name NoScript
 * @description This component is used to display a message to the user when JavaScript is disabled in the browser.
 *
 * Note: This component shouldn't used any shared styles or components as this causes issues with with any other components that are rendered on the page.
 * Which we're guessing is related to css-in-js and noscript interactions.
 * So all styles must be defined in this file, so that they are SSR rendered and don't clash with other components.
 *
 * The styles are based on the ErrorSummary component from the Source design system: https://github.com/guardian/csnx/blob/main/libs/%40guardian/source-development-kitchen/src/react-components/summary/ErrorSummary.tsx
 */
export const NoScript = () => {
	return (
		<noscript>
			<div css={[wrapperStyles, errorMessageStyles]}>
				<div css={iconStyles}>
					<SvgAlertRound />
				</div>
				<div css={messageWrapperStyles}>
					<div css={messageStyles}>
						Please enable JavaScript in your browser
					</div>
					<div css={contextStyles}>
						<p css={errorContextSpacing}>
							We use JavaScript to provide a seamless and secure authentication
							experience. Please{' '}
							<a
								href="https://www.whatismybrowser.com/guides/how-to-enable-javascript/"
								rel="noopener noreferrer"
							>
								enable JavaScript
							</a>{' '}
							in your browser settings and reload the page.
						</p>
						<p css={[errorContextSpacing, errorContextLastTypeSpacing]}>
							For further help please contact our customer service team at{' '}
							<a href={locations.SUPPORT_EMAIL_MAILTO}>{SUPPORT_EMAIL}</a>
						</p>
					</div>
				</div>
			</div>
		</noscript>
	);
};
