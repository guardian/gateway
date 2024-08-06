import type { SerializedStyles } from '@emotion/react';
import { css } from '@emotion/react';
import type { EmotionJSX } from '@emotion/react/types/jsx-namespace';
import {
	descriptionId,
	focusHalo,
	remSpace,
	textSans,
	textSans12,
} from '@guardian/source/foundations';
import { Checkbox } from '@guardian/source/react-components';
import React, { useId } from 'react';

const labelStyles = css`
	user-select: none;
	position: relative;
	${textSans.small()};
	display: flex;
	grid-template-columns: 80px 1fr 2rem;
	cursor: pointer;
	border-radius: 4px;
	border: 1px solid var(--color-input-border);
	padding: calc(
		${remSpace[2]} + 1px
	); // 1px to account for 2px border when checked

	&:focus,
	&:focus-within {
		${focusHalo};
	}

	:has(input:checked) {
		border: 2px solid var(--color-input-success);
		background-color: var(--color-input-highlight);
		padding: ${remSpace[2]};
	}
`;

const contentWrapperStyles = css`
	padding-right: ${remSpace[3]};
	margin-right: auto;
	display: flex;
	flex-direction: column;
	justify-content: center;
	height: min-content;
`;

const mainLabelStyles = css`
	display: block;
	${textSans.medium({ fontWeight: 'bold' })};
	color: var(--color-text);
`;

const contextLabelStyles = css`
	flex: 1;
	color: var(--color-text);
`;

const subLabelStyles = css`
	display: block;
	${textSans12};
	color: var(--color-alert-info);
	text-transform: uppercase;
	margin-top: ${remSpace[1]};
`;

const imageStyles = (imagePath: string) => css`
	align-self: flex-start;
	width: 100px;
	height: 100px;
	margin-right: ${remSpace[2]};
	background-image: url('${imagePath}');
	background-repeat: no-repeat;
	background-size: cover;
	flex-shrink: 0;
	border-radius: 4px;
`;

const inputWrapperStyles = css`
	display: flex;
	align-items: flex-start;

	// Override the default padding for the Source checkbox
	& > div {
		min-height: auto;
		& > input {
			margin-right: 0;
		}
		// Fix checkmark alignment
		& > span {
			top: 5px;
		}
	}
`;

export interface CheckboxInputProps {
	defaultChecked?: boolean;
	id?: string;
	label?: string;
	subLabel?: string;
	context?: string;
	imagePath?: string;
	onToggle?: (event: React.ChangeEvent<HTMLInputElement>) => void;
	cssOverrides?: SerializedStyles;
}

export const CheckboxInput = ({
	id,
	label,
	subLabel,
	defaultChecked,
	context,
	imagePath,
	cssOverrides,
	onToggle,
}: CheckboxInputProps): EmotionJSX.Element => {
	const defaultId = useId();
	const switchName = id ?? defaultId;
	const labelId = descriptionId(switchName);

	return (
		<label id={labelId} css={[labelStyles, cssOverrides]}>
			{imagePath && <div css={imageStyles(imagePath)} />}
			<div css={contentWrapperStyles}>
				<span css={mainLabelStyles}>{label}</span>
				{context && <span css={contextLabelStyles}>{context}</span>}
				{subLabel && <span css={subLabelStyles}>{subLabel}</span>}
			</div>
			<div css={inputWrapperStyles}>
				<Checkbox
					id={switchName}
					name={switchName}
					aria-label={label}
					checked={defaultChecked}
					onChange={onToggle}
					theme={{
						borderSelected: `var(--color-input-success)`,
						borderHover: `var(--color-input-success)`,
						fillUnselected: `var(--color-input-background)`,
						fillSelected: `var(--color-input-success)`,
					}}
				/>
			</div>
		</label>
	);
};
