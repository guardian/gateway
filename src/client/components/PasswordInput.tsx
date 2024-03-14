import {
	SvgEye,
	SvgEyeStrike,
	TextInput,
} from '@guardian/source-react-components';
import React, { useState } from 'react';
import { css } from '@emotion/react';
import { height, focusHalo } from '@guardian/source-foundations';
import { disableAutofillBackground } from '@/client/styles/Shared';

export type PasswordAutoComplete = 'new-password' | 'current-password';

export type PasswordInputProps = {
	label: string;
	error?: string;
	displayEye?: boolean;
	supporting?: string;
	onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
	autoComplete?: PasswordAutoComplete;
};

// remove the border and shorten the width of the text input box so the text does not overlap the password eye
const paddingRight = (isEyeDisplayedOnBrowser: boolean) => css`
	padding-right: ${isEyeDisplayedOnBrowser ? 28 : 0}px;
`;

// fix password input border radius to hide right side of the radius
const borderFix = (isEyeDisplayedOnBrowser: boolean) =>
	isEyeDisplayedOnBrowser
		? css`
				border-radius: 4px 0 0 4px;
			`
		: css();

// we cut off the right hand side of the border when the eye symbol is displayed.
const noBorder = (isEyeDisplayedOnBrowser: boolean) =>
	isEyeDisplayedOnBrowser
		? css`
				border-right: none;
				:active {
					border-right: none;
				}
			`
		: css();

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
			// The slash through the eye
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
	error,
}: {
	isOpen: boolean;
	onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
	error?: string;
}) => {
	const buttonStyles = css`
		border: ${error
			? `2px solid var(--color-alert-error)`
			: `1px solid var(--color-input-border)`};
		border-left: none;
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
		>
			<EyeIcon isOpen={isOpen} />
		</button>
	);
};

export const PasswordInput = ({
	label,
	error,
	supporting,
	onChange,
	displayEye = true,
	autoComplete,
}: PasswordInputProps) => {
	const [passwordVisible, setPasswordVisible] = useState(false);

	return (
		<div
			css={css`
				display: flex;
			`}
		>
			<div
				css={[
					css`
						flex: 1;
						align-self: flex-end;
					`,
				]}
			>
				<TextInput
					error={error}
					onChange={onChange}
					label={label}
					name="password"
					supporting={supporting}
					type={passwordVisible ? 'text' : 'password'}
					autoComplete={autoComplete}
					cssOverrides={[
						noBorder(displayEye),
						borderFix(displayEye),
						paddingRight(displayEye),
						disableAutofillBackground,
						hideMsReveal(displayEye),
					]}
					theme={{
						textLabel: 'var(--color-input-label)',
						textUserInput: 'var(--color-input-text)',
						border: 'var(--color-input-border)',
						backgroundInput: 'var(--color-input-background)',
					}}
				/>
			</div>

			{displayEye && (
				<EyeSymbol
					error={error}
					isOpen={passwordVisible}
					onClick={() => {
						// Toggle visibility of password
						setPasswordVisible((previousState) => !previousState);
					}}
				/>
			)}
		</div>
	);
};
