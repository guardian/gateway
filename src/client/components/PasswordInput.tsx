import {
	InlineError,
	SvgEye,
	SvgEyeStrike,
} from '@guardian/source/react-components';
import React, { useState } from 'react';
import { css } from '@emotion/react';
import {
	height,
	focusHalo,
	textSans,
	remSpace,
} from '@guardian/source/foundations';
import {
	disableAutofillBackground,
	errorMessageStyles,
} from '@/client/styles/Shared';
import ThemedTextInput from '@/client/components/ThemedTextInput';

export type PasswordAutoComplete = 'new-password' | 'current-password';

export type PasswordInputProps = {
	label: string;
	error?: string;
	displayEye?: boolean;
	supporting?: string;
	onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
	autoComplete?: PasswordAutoComplete;
};

// hide the microsoft password reveal eye if we're using
// our own custom reveal field
// https://docs.microsoft.com/en-us/microsoft-edge/web-platform/password-reveal
const hideMsReveal = (isEyeDisplayedOnBrowser: boolean) => {
	if (isEyeDisplayedOnBrowser) {
		return css`
			::-ms-reveal {
				display: none;
			}
		`;
	}
	return css``;
};

const EyeIcon = ({ isOpen }: { isOpen: boolean }) => {
	const iconStyles = css`
		svg {
			width: 30px;
			height: 30px;
			fill: var(--color-input-border);
			/* The slash through the eye */
			rect {
				fill: var(--color-input-border);
			}
		}
	`;

	// isOpen corresponds to when the password is visible
	// so we want to show show the SvgEyeStrike to make it
	// clear to the user that clicking this icon will make
	// the password hidden
	if (isOpen) {
		return (
			<div css={iconStyles}>
				<SvgEyeStrike />
			</div>
		);
	} else {
		// otherwise we show the SvgEye when the password is
		// hidden to make it clear to the user that clicking
		// this icon will make the password visible
		return (
			<div css={iconStyles}>
				<SvgEye />
			</div>
		);
	}
};

const EyeSymbol = ({
	isOpen,
	onClick,
	setPasswordButtonIsFocused,
}: {
	isOpen: boolean;
	onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
	fieldIsFocused?: boolean;
	setPasswordButtonIsFocused: (value: boolean) => void;
}) => {
	const buttonStyles = css`
		border: none;
		border-radius: 0 4px 4px 0;
		background-color: transparent;
		cursor: pointer;
		height: ${height.inputMedium}px;
		align-self: flex-end;
		padding-top: 4px;
		margin-left: 0;
		margin-right: 0;
		:focus {
			${focusHalo};
		}
	`;

	return (
		<button
			type="button"
			css={buttonStyles}
			onClick={onClick}
			title="show or hide password text"
			data-cy="password-input-eye-button"
			aria-label="Show password"
			onFocus={() => setPasswordButtonIsFocused(true)}
			onBlur={() => setPasswordButtonIsFocused(false)}
		>
			<EyeIcon isOpen={isOpen} />
		</button>
	);
};

const removeBorder = css`
	border: none;
`;

const wrapperStyles = (hasFocus?: boolean) => css`
	display: flex;
	border: 1px solid var(--color-input-border);
	padding: 1px;
	border-radius: 4px;
	margin-top: 4px;
	input {
		margin-top: 0;
	}
	/*
	 * FOCUS LOGIC
	 * Modern browsers which support :has
	 */
	:has(:focus) {
		border: 2px solid var(--color-input-text);
		padding: 0;
	}
	/* React-based fallback for browsers which don't support :has */
	${hasFocus &&
	`
		border: 2px solid var(--color-input-text);
		padding: 0;
	`}
`;

const labelStyles = css`
	${textSans.medium({ fontWeight: 'bold' })}
	color: var(--color-input-label);
`;

const supportingTextStyles = css`
	${textSans.xsmall()}
	margin-top: 4px;
	color: var(--color-alert-info);
	margin: 2px 0 0;
`;

const inlineErrorStyles = css`
	margin-top: ${remSpace[1]};
`;

export const PasswordInput = ({
	label,
	error,
	supporting,
	onChange,
	displayEye = true,
	autoComplete,
}: PasswordInputProps) => {
	const [passwordVisible, setPasswordVisible] = useState(false);
	const [fieldIsFocused, setFieldIsFocused] = useState(false);
	const [passwordButtonIsFocused, setPasswordButtonIsFocused] = useState(false);
	const hasFocus = fieldIsFocused || passwordButtonIsFocused;

	return (
		<div>
			<label htmlFor="password" css={labelStyles}>
				{label}
			</label>
			{error && (
				<InlineError cssOverrides={[inlineErrorStyles, errorMessageStyles]}>
					{error}
				</InlineError>
			)}
			{supporting && <p css={supportingTextStyles}>{supporting}</p>}
			<div css={wrapperStyles(hasFocus)}>
				<ThemedTextInput
					onChange={onChange}
					onFocus={() => setFieldIsFocused(true)}
					onBlur={() => setFieldIsFocused(false)}
					label={''}
					name="password"
					type={passwordVisible ? 'text' : 'password'}
					autoComplete={autoComplete}
					cssOverrides={[
						removeBorder,
						disableAutofillBackground,
						hideMsReveal(displayEye),
					]}
					id="password"
				/>

				{displayEye && (
					<EyeSymbol
						isOpen={passwordVisible}
						fieldIsFocused={fieldIsFocused}
						onClick={() => {
							// Toggle visibility of password
							setPasswordVisible((previousState) => !previousState);
						}}
						setPasswordButtonIsFocused={setPasswordButtonIsFocused}
					/>
				)}
			</div>
		</div>
	);
};
