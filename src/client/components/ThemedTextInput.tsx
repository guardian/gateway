import type { TextInputProps } from '@guardian/source/react-components';
import { TextInput } from '@guardian/source/react-components';
import React from 'react';

const textInputTheme = {
	textLabel: 'var(--color-input-label)',
	textUserInput: 'var(--color-input-text)',
	border: 'var(--color-input-border)',
	backgroundInput: 'var(--color-input-background)',
	/* TODO: textError sets the color of both the input text and the error message,
		which isn't ideal - we'd prefer to have the input text always the same
		color. So this is a workaround for now. */
	textError: 'var(--color-input-error)',
	borderError: 'var(--color-input-error)',
	/* Same issue as textError */
	textSuccess: 'var(--color-input-success)',
	borderSuccess: 'var(--color-input-success)',
};

const ThemedTextInput = (props: Omit<TextInputProps, 'theme'>) => {
	return <TextInput {...props} theme={textInputTheme} />;
};

export default ThemedTextInput;
