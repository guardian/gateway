import { css } from '@emotion/react';
import { remSpace } from '@guardian/source/foundations';

import React, { FieldsetHTMLAttributes, useState, useEffect } from 'react';
import {
	InputFieldState,
	useInputValidityState,
} from '@/client/lib/hooks/useInputValidityState';
import ThemedTextInput from '@/client/components/ThemedTextInput';

const fieldSpacing = css`
	margin-bottom: ${remSpace[2]};
`;

const fieldset = css`
	border: none;
	margin: 0;
	padding: 0;
`;

interface NameInputProps {
	onError: (state: boolean) => void;
	defaultValue?: string;
}

const FirstNameInput = (props: NameInputProps) => {
	const { onBlur, inputFieldState, onInput, onInvalid } =
		useInputValidityState();

	const [errorMessage, setErrorMessage] = useState<string>();

	const isEmpty = inputFieldState === InputFieldState.EMPTY;

	useEffect(() => {
		if (props.onError) {
			setErrorMessage(isEmpty ? 'Please enter your First name' : undefined);
			props.onError(isEmpty);
		}
	}, [isEmpty, props]);

	return (
		<ThemedTextInput
			required
			label={'First Name'}
			name="firstName"
			type="text"
			autoComplete="given-name"
			css={fieldSpacing}
			onBlur={onBlur}
			onInput={onInput}
			onInvalid={onInvalid}
			error={errorMessage}
			defaultValue={props.defaultValue}
		/>
	);
};

const SecondNameInput = (props: NameInputProps) => {
	const { onBlur, inputFieldState, onInput, onInvalid } =
		useInputValidityState();

	const [errorMessage, setErrorMessage] = useState<string>();

	const isEmpty = inputFieldState === InputFieldState.EMPTY;

	useEffect(() => {
		if (props.onError) {
			setErrorMessage(isEmpty ? 'Please enter your Last name' : undefined);
			props.onError(isEmpty);
		}
	}, [isEmpty, props]);

	return (
		<ThemedTextInput
			required
			label={'Last Name'}
			name="secondName"
			type="text"
			autoComplete="family-name"
			onBlur={onBlur}
			onInput={onInput}
			onInvalid={onInvalid}
			error={errorMessage}
			defaultValue={props.defaultValue}
		/>
	);
};

interface NameInputFieldProps
	extends FieldsetHTMLAttributes<HTMLFieldSetElement> {
	onGroupError?: (errorOccurred: boolean) => void;
	firstName?: string;
	secondName?: string;
}

const NameInputField: React.FC<NameInputFieldProps> = (props) => {
	const { onGroupError, firstName, secondName, ...restProps } = props;

	const [firstNameError, setFirstNameError] = useState(false);
	const [secondNameError, setSecondNameError] = useState(false);

	useEffect(() => {
		if (onGroupError) {
			onGroupError(firstNameError || secondNameError);
		}
	}, [firstNameError, secondNameError, onGroupError]);

	return (
		<fieldset css={fieldset} {...restProps}>
			<FirstNameInput onError={setFirstNameError} defaultValue={firstName} />
			<SecondNameInput onError={setSecondNameError} defaultValue={secondName} />
		</fieldset>
	);
};

export default NameInputField;
