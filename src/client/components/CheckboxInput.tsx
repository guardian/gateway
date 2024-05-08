import React from 'react';
import type { EmotionJSX } from '@emotion/react/types/jsx-namespace';
import { Checkbox } from '@guardian/source-react-components';
import { SerializedStyles, css } from '@emotion/react';
import {
	textSans,
	focusHalo,
	descriptionId,
	generateSourceId,
	space,
	palette,
	textSans12,
} from '@guardian/source-foundations';

const switchVariables = {
	width: 44,
	height: 22,
	border: 1,
	marginLeft: space[3],
};

const switchComputedWidth =
	switchVariables.width +
	switchVariables.marginLeft +
	switchVariables.border * 2;

const labelStyles = css`
	user-select: none;
	position: relative;
	${textSans.small()};
	display: flex;
	grid-template-columns: 80px 1fr 2rem;
	cursor: pointer;
	border-radius: 4px;
	border: 1px solid ${palette.neutral[38]};
	padding: calc(
		${space[2]}px + 1px
	); // 1px to account for 2px border when checked

	&:focus,
	&:focus-within {
		${focusHalo};
	}

	:has(input:checked) {
		border: 2px solid ${palette.success[400]};
		background-color: ${palette.neutral[97]};
		padding: ${space[2]}px;
	}
`;

const contentWrapperStyles = css`
	padding-right: ${space[3]}px;
	margin-right: auto;
	display: flex;
	flex-direction: column;
	justify-content: center;
	height: 100%;
`;

const mainLabelStyles = css`
	display: block;
	${textSans.small({ fontWeight: 'bold' })};
`;

const contextLabelStyles = css`
	flex: 1;
	margin-right: ${switchComputedWidth}px;
`;

const subLabelStyles = css`
	display: block;
	${textSans12};
	color: ${palette.neutral[46]};
	text-transform: uppercase;
	margin-top: ${space[1]}px;
`;

const imageStyles = (imagePath: string) => css`
	align-self: flex-start;
	width: 100px;
	height: 100px;
	margin-right: ${space[2]}px;
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
	const switchName = id ?? generateSourceId();
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
					aria-label={label}
					checked={defaultChecked}
					onChange={onToggle}
					theme={{
						borderSelected: palette.success[400],
						borderHover: palette.success[400],
						fillUnselected: palette.neutral[100],
						fillSelected: palette.success[400],
					}}
				/>
			</div>
		</label>
	);
};
