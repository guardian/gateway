import React, { useId, useState } from 'react';
import type { EmotionJSX } from '@emotion/react/dist/declarations/src/jsx-namespace';
import { css } from '@emotion/react';
import {
	textSans15,
	textSansBold15,
	focusHalo,
	visuallyHidden,
	descriptionId,
	space,
	remSpace,
} from '@guardian/source/foundations';

const switchVariables = {
	width: 44,
	height: 22,
	border: 1,
	marginLeft: space[3],
};

const imageSize = 100;

const switchComputedWidth =
	switchVariables.width +
	switchVariables.marginLeft +
	switchVariables.border * 2;

const inputStyles = css`
	${visuallyHidden};
`;

const labelStyles = (hasFocus: boolean, hasImage: boolean) => css`
	user-select: none;
	position: relative;
	${textSans15};
	cursor: pointer;
	border: 0;
	margin: 0;
	border-radius: 4px;
	padding: ${remSpace[2]};
	border: ${switchVariables.border}px solid
		var(--color-toggle-inactive-background);
	display: grid;
	grid-template-columns: ${hasImage
		? `${imageSize}px calc(100% - ${switchComputedWidth}px - ${imageSize}px) ${switchComputedWidth}px`
		: `calc(100% - ${switchComputedWidth}px) ${switchComputedWidth}px`};
	/*
	 * FOCUS LOGIC
	 * Modern browsers which support :has
	 */
	&:has(input:focus) {
		${focusHalo};
	}
	/* React-based fallback for browsers which don't support :has */
	${hasFocus &&
	`
		${focusHalo};
	`}
`;

const labelTextContainerStyles = (isFirstItem: boolean) => css`
	display: flex;
	flex-direction: column;
	overflow: hidden;
	margin-left: ${isFirstItem ? remSpace[2] : '0'};
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

const switchStyles = css`
	flex: 0 0 auto;
	border: none;
	margin: 0px 0px 0px ${switchVariables.marginLeft}px;
	padding: 0px;
	display: inline-block;
	text-align: center;
	position: relative;
	transition: background-color 150ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;
	cursor: pointer;
	width: ${switchVariables.width}px;
	height: ${switchVariables.height}px;
	border-radius: 16px;
	box-sizing: unset;
	align-self: start;

	/* this will go away when resets have been standardised */
	&:before,
	&:after {
		box-sizing: border-box;
	}

	&:before {
		content: '';
		position: absolute;
		top: 5px;
		height: 11px;
		width: 6px;
		right: 10px;
		opacity: 0;
		border-bottom: 2px solid var(--color-toggle-active-background);
		border-right: 2px solid var(--color-toggle-active-background);
		transform: rotate(45deg);
		transition-property: opacity;
		transition-duration: 0.2s;
	}

	&:after {
		height: 18px;
		width: 18px;
		top: 2px;
		left: 2px;
		content: '';
		position: absolute;
		border-radius: 50%;
		background: var(--color-toggle-inactive-switch);
		will-change: left;
		transition: left 0.15s ease-in-out;
	}
`;

const titleStyles = css`
	min-height: ${switchVariables.height}px;
	color: var(--color-input-label);
	${textSansBold15};
	display: flex;
	align-items: center;
`;

const descriptionStyles = (hasImage: boolean) => css`
	flex: 1;
	color: var(--color-toggle-text);
	display: flex;
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
	border-radius: 4px;
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
	 * Optional onChange handler to catch input changes
	 */
	onChange?: (id: string, checked: boolean) => void;
}

export const ToggleSwitchInput = ({
	id,
	title,
	defaultChecked,
	description,
	imagePath,
}: ToggleSwitchInputProps): EmotionJSX.Element => {
	const defaultId = useId();
	const switchName = id ?? defaultId;
	const labelId = descriptionId(switchName);
	const [fieldIsFocused, setFieldIsFocused] = useState(false);

	const hasImage = Boolean(imagePath);

	return (
		<label
			id={labelId}
			css={[labelStyles(fieldIsFocused, hasImage), siblingStyles]}
		>
			{imagePath && <div css={imageStyles(imagePath)} />}
			<div css={labelTextContainerStyles(hasImage)}>
				{title && <span css={titleStyles}>{title}</span>}
				{description && (
					<span css={descriptionStyles(hasImage)}>{description}</span>
				)}
			</div>
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
			<span
				aria-hidden="true"
				aria-labelledby={labelId}
				css={switchStyles}
			></span>
		</label>
	);
};
