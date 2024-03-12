import { TextInput, TextInputProps } from '@guardian/source-react-components';
import React from 'react';
import { disableAutofillBackground } from '@/client/styles/Shared';
import {
	InputFieldState,
	useInputValidityState,
} from '@/client/lib/hooks/useInputValidityState';
import { palette } from '@guardian/source-foundations';

interface EmailInputProps extends Omit<TextInputProps, 'label'> {
	label?: string;
	defaultValue?: string;
	initialState?: InputFieldState;
}

enum EmailInputFieldErrorMessages {
	INVALID = 'Please enter a valid email format.',
	EMPTY = 'Please enter your email.',
}

export const EmailInput: React.FC<EmailInputProps> = ({
	label = 'Email',
	initialState = InputFieldState.VALID,
	...rest
}) => {
	const { onBlur, onInput, onInvalid, inputFieldState } =
		useInputValidityState(initialState);

	// Set the error message based on the current state.
	const errorMessage = React.useMemo(() => {
		switch (inputFieldState) {
			case InputFieldState.INVALID:
				return EmailInputFieldErrorMessages.INVALID;
			case InputFieldState.EMPTY:
				return EmailInputFieldErrorMessages.EMPTY;
		}
	}, [inputFieldState]);

	return (
		<TextInput
			label={label}
			name="email"
			type="email"
			autoComplete="email"
			error={errorMessage}
			cssOverrides={[disableAutofillBackground]}
			onBlur={onBlur}
			onInput={onInput}
			onInvalid={onInvalid}
			theme={{
				textLabel: palette.brand[400],
			}}
			{...rest}
		/>
	);
};
