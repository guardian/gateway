import React, { useId, useState } from 'react';
import type { EmotionJSX } from '@emotion/react/dist/declarations/src/jsx-namespace';
import { css } from '@emotion/react';
import {
	textSans15,
	textSans17,
	focusHalo,
	visuallyHidden,
	descriptionId,
	space,
	remSpace,
	headlineMedium20,
} from '@guardian/source/foundations';
import { SATURDAY_EDITION_SMALL_SQUARE_IMAGE } from '../assets/newsletters';
import { Button, SvgPlusOnRound } from '@guardian/source/react-components';

const switchVariables = {
	width: 44,
	height: 22,
	border: 1,
	marginLeft: space[3],
};

const imageSize = 64;

const inputStyles = css`
	${visuallyHidden};
`;

const labelStyles = (hasFocus: boolean) => css`
	user-select: none;
	position: relative;
	${textSans15};
	cursor: pointer;
	background: #f3f7ff;
	border: 0;
	margin: 0;
	border-radius: 4px;
	padding: ${remSpace[2]};
	border: ${switchVariables.border}px solid
		var(--color-toggle-inactive-background);
	display: grid;
	grid-template-columns: ${`calc(100% - ${imageSize}px) ${imageSize}px `};
	/*
	 * FOCUS LOGIC
	 * Modern browsers which support :has
	 */
	&:has(input:focus) {
		${focusHalo};
	}
	/* React-based fallback for browsers which don't support :has */
	${
		hasFocus &&
		`
		${focusHalo};
	`
	}
`;

const labelTextContainerStyles = (isFirstItem: boolean) => css`
	display: flex;
	flex-direction: column;
	overflow: hidden;
	margin-left: ${isFirstItem ? remSpace[2] : '0'};
	height: min-content;
`;

const siblingStyles = css`
	input + span {
		background-color: var(--color-toggle-inactive-background);
		border: ${switchVariables.border}px solid
			var(--color-toggle-inactive-background);
	}

	input + span:before {
		transition-delay: 0;
	}

	input:focus + span {
		${focusHalo};
	}

	input:checked + span {
		background: var(--color-toggle-active-background);
		border: ${switchVariables.border}px solid
			var(--color-toggle-active-background);
	}

	input:checked + span:before {
		opacity: 1;
		z-index: 1;
		transition-delay: 0.2s;
	}

	input:checked + span:after {
		left: 22px;
		background: var(--color-toggle-active-switch);
	}
`;

const titleStyles = css`
	min-height: ${switchVariables.height}px;
	${headlineMedium20};
	display: flex;
	align-items: center;
`;

const descriptionStyles = (hasImage: boolean) => css`
	flex: 1;
	color: var(--color-toggle-text);
	display: flex;
	${textSans17}
	align-items: ${hasImage ? 'start' : 'center'};
`;
const imageStyles = (imagePath: string) => css`
	align-self: flex-start;
	width: ${imageSize}px;
	height: ${imageSize}px;
	background-image: url('${imagePath}');
	background-repeat: no-repeat;
	background-size: cover;
	flex-shrink: 0;
	border-radius: 50%;
`;

export interface ToggleSwitchInputProps {
	/**
	 * Whether the ToggleSwitch is checked.
	 * Gateway uses the [uncontrolled approach](https://reactjs.org/docs/uncontrolled-components.html),
	 * Use defaultChecked to indicate the whether the ToggleSwitch is checked initially.
	 */
	defaultChecked?: boolean;
	/**
	 * Optional Id for the switch. Defaults to a generated indexed Source ID e.g. "src-component-XXX}"
	 */
	id?: string;
	/**
	 * Optional short title. Appears to the left of the switch.
	 */
	title?: string;
	/**
	 * Long description of the context of the switch. Appears below the title, if provided.
	 */
	description?: string;

	/**
	 * Optional image to display to the left of the text.
	 */
	imagePath?: string;

	/**
	 *
	 * @type {string}
	 * @memberof ToggleSwitchInputProps
	 */
	subLabel?: string;

	/**
	 * Optional onChange handler to catch input changes
	 */
	onChange?: (id: string, checked: boolean) => void;
}

export const NewsletterToggleSwitchInput = ({
	id,
	title,
	defaultChecked,
	description,
	imagePath = SATURDAY_EDITION_SMALL_SQUARE_IMAGE,
}: ToggleSwitchInputProps): EmotionJSX.Element => {
	const defaultId = useId();
	const switchName = id ?? defaultId;
	const labelId = descriptionId(switchName);
	const [fieldIsFocused, setFieldIsFocused] = useState(false);

	const hasImage = Boolean(imagePath);

	return (
		<label id={labelId} css={[labelStyles(fieldIsFocused), siblingStyles]}>
			<div css={labelTextContainerStyles(hasImage)}>
				{title && <span css={titleStyles}>{title}</span>}
				{description && (
					<span css={descriptionStyles(hasImage)}>{description}</span>
				)}
				<input
					css={inputStyles}
					name={switchName}
					type="checkbox"
					role="switch"
					defaultChecked={defaultChecked}
					aria-labelledby={labelId}
					onFocus={() => setFieldIsFocused(true)}
					onBlur={() => setFieldIsFocused(false)}
				></input>
				<Button
					priority="primary"
					size="xsmall"
					type="button"
					isLoading={false}
					icon={SvgPlusOnRound({
						size: 'small',
					})}
				>
					Sign up
				</Button>
			</div>
			{imagePath && <div css={imageStyles(imagePath)} />}
		</label>
	);
};
