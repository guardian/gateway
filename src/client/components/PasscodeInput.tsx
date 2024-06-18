import { FieldError } from '@/shared/model/ClientState';
import { TextInputProps } from '@guardian/source/react-components';
import React from 'react';
import { css } from '@emotion/react';
import ThemedTextInput from '@/client/components/ThemedTextInput';

interface PasscodeInputProps extends Omit<TextInputProps, 'label'> {
	passcode?: string;
	fieldErrors?: FieldError[];
}

const passcodeInputStyles = css`
	text-align: center;
`;

export const PasscodeInput = ({
	passcode,
	fieldErrors,
}: PasscodeInputProps) => {
	return (
		<div>
			<ThemedTextInput
				label="Verification code"
				type="text"
				pattern="\d{6}"
				name="code"
				autoComplete="one-time-code"
				inputMode="numeric"
				maxLength={6}
				error={fieldErrors?.find((error) => error.field === 'code')?.message}
				defaultValue={passcode}
				cssOverrides={passcodeInputStyles}
			/>
		</div>
	);
};
