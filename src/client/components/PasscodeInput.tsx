import React, { useEffect, useState } from 'react';
import { FieldError } from '@/shared/model/ClientState';
import { TextInputProps } from '@guardian/source/react-components';
import { css } from '@emotion/react';
import ThemedTextInput from '@/client/components/ThemedTextInput';
import { remSpace } from '@guardian/source/foundations';

interface PasscodeInputProps extends TextInputProps {
	passcode?: string;
	fieldErrors?: FieldError[];
	formRef: React.RefObject<HTMLFormElement | null>;
}

const passcodeInputStyles = css`
	text-align: center;
	letter-spacing: ${remSpace[0]};
`;

export const PasscodeInput = ({
	label,
	passcode = '',
	fieldErrors,
	formRef,
	autoFocus,
}: PasscodeInputProps) => {
	/**
	 * In gateway we normally avoid using client side javascript, but in this case
	 * we allow it as it an enhancement to the user experience and not required for
	 * the form to work.
	 */
	// This function removes all non-numeric characters from the input
	const sanitiseCode = (code: string) => {
		return code.replace(/\D*/g, '');
	};

	// Using an object to store the input value so that we re-render the component
	// whenever there is an user input, rather than only when the state changes
	const [input, setInput] = useState({ value: sanitiseCode(passcode) });

	// Track if the user has interacted with the input, used for auto-submitting the form
	const [userInteracted, setUserInteracted] = useState(false);

	// Auto-submit the form when the input is 6 digits long and the user has interacted with the input
	// but not if there is an error in the field, where the user has to manually submit the form
	// e.g after a previously failed attempt
	useEffect(() => {
		if (
			!fieldErrors?.length &&
			formRef?.current &&
			userInteracted &&
			/^\d{6}$/.test(input.value)
		) {
			// find the submit button
			const button =
				formRef.current.querySelector<HTMLElement>('[type="submit"]');

			// if requestSubmit is available use it, otherwise dispatch a click event
			// mainly because of Safari not supporting requestSubmit until v16
			if (formRef.current.requestSubmit) {
				formRef.current.requestSubmit(button);
			} else {
				button?.dispatchEvent(new MouseEvent('click'));
			}
		}
	}, [fieldErrors, formRef, input.value, userInteracted]);

	// Update the input value on user input
	const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setUserInteracted(true);

		setInput({
			value: sanitiseCode(e.target.value),
		});
	};

	// Update the input value on paste
	const onPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
		setUserInteracted(true);

		const paste = e.clipboardData.getData('text/plain');

		if (!paste) {
			return;
		}

		setInput({
			value: sanitiseCode(paste),
		});
	};

	return (
		<div>
			<ThemedTextInput
				label={label}
				type="text"
				pattern="\d{6}"
				name="code"
				autoComplete="one-time-code"
				inputMode="numeric"
				maxLength={6}
				error={fieldErrors?.find((error) => error.field === 'code')?.message}
				defaultValue={passcode}
				cssOverrides={passcodeInputStyles}
				value={input.value}
				onChange={onChange}
				onPaste={onPaste}
				autoFocus={autoFocus}
			/>
		</div>
	);
};
