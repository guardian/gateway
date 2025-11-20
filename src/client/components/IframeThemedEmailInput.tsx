import React from 'react';
import { TextInput, TextInputProps } from '@guardian/source/react-components';

const textInputTheme = {
	textLabel: 'var(--color-input-label)',
	textUserInput: 'var(--color-input-text)',
	border: 'var(--color-input-border)',
	backgroundInput: 'var(--color-input-highlight)',
};

const IframeThemedEmailInput = (props: Omit<TextInputProps, 'theme'>) => {
	return <TextInput {...props} theme={textInputTheme} />;
};

export default IframeThemedEmailInput;
