import { TextInputProps } from '@guardian/source/react-components';
import React from 'react';
import { disableAutofillBackground } from '@/client/styles/Shared';
import {
	InputFieldState,
	InputFieldStates,
	useInputValidityState,
} from '@/client/lib/hooks/useInputValidityState';
import ThemedTextInput from '@/client/components/ThemedTextInput';

interface EmailInputProps extends Omit<TextInputProps, 'label'> {
	label?: string;
	defaultValue?: string;
	initialState?: InputFieldState;
}

const EmailInputFieldErrorMessages = {
	INVALID: 'Please enter a valid email format.',
	EMPTY: 'Please enter your email.',
} as const;

export const EmailInput: React.FC<EmailInputProps> = ({
	label = 'Email',
	initialState = InputFieldStates.VALID,
	...rest
}) => {
	const { onBlur, onInput, onInvalid, inputFieldState } =
		useInputValidityState(initialState);

	// Set the error message based on the current state.
	const errorMessage = React.useMemo(() => {
		switch (inputFieldState) {
			case InputFieldStates.INVALID:
				return EmailInputFieldErrorMessages.INVALID;
			case InputFieldStates.EMPTY:
				return EmailInputFieldErrorMessages.EMPTY;
		}
	}, [inputFieldState]);

	return (
		<div>
			<ThemedTextInput
				label={label}
				name="email"
				type="email"
				autoComplete="email"
				error={errorMessage}
				cssOverrides={disableAutofillBackground}
				onBlur={onBlur}
				onInput={onInput}
				onInvalid={onInvalid}
				{...rest}
			/>
		</div>
	);
};
