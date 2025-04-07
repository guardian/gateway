import { Literal } from '@/shared/types';
import { useCallback, useState } from 'react';

const isInputInvalid = (validityState: ValidityState) =>
	validityState.customError ||
	validityState.badInput ||
	validityState.patternMismatch ||
	validityState.rangeOverflow ||
	validityState.rangeUnderflow ||
	validityState.tooLong ||
	validityState.tooShort ||
	validityState.stepMismatch ||
	validityState.typeMismatch;

export const InputFieldStates = {
	VALID: 'valid',
	EMPTY: 'empty',
	INVALID: 'invalid',
} as const;
export type InputFieldState = Literal<typeof InputFieldStates>;

export const useInputValidityState = (
	initialState: InputFieldState = InputFieldStates.VALID,
): {
	onBlur: React.FocusEventHandler<HTMLInputElement>;
	onInput: React.FormEventHandler<HTMLInputElement>;
	onInvalid: React.FormEventHandler<HTMLInputElement>;
	inputFieldState: InputFieldState;
} => {
	const [inputFieldState, setInputFieldState] =
		useState<InputFieldState>(initialState);

	// Transition error message state based upon the
	// HTML ValidityState object returned from the input.
	const transitionState = useCallback((validityState: ValidityState) => {
		const inputIsInvalid = isInputInvalid(validityState);

		const inputIsEmpty = validityState.valueMissing;

		if (inputIsEmpty) {
			setInputFieldState(InputFieldStates.EMPTY);
		} else if (inputIsInvalid) {
			setInputFieldState(InputFieldStates.INVALID);
		} else {
			setInputFieldState(InputFieldStates.VALID);
		}
	}, []);

	const onBlur = useCallback<React.FocusEventHandler<HTMLInputElement>>(
		(e) => {
			// Transition error state when the input box loses focus,
			// but only if the input is not empty.
			if (e.target.value !== '') {
				transitionState(e.target.validity);
			}
		},
		[transitionState],
	);

	const onInput = useCallback<React.FormEventHandler<HTMLInputElement>>(
		(e) => {
			// transition the error state when the input box is updated,
			// but only if the input is valid.
			if (!isInputInvalid(e.currentTarget.validity)) {
				e.currentTarget.checkValidity();
				transitionState(e.currentTarget.validity);
			}
		},
		[transitionState],
	);

	const onInvalid = useCallback<React.FormEventHandler<HTMLInputElement>>(
		(e) => {
			// Prevent default browser popup from firing.
			e.preventDefault();
			// Transition error state when the invalid event fires.
			transitionState(e.currentTarget.validity);
		},
		[transitionState],
	);

	return {
		onBlur,
		onInput,
		onInvalid,
		inputFieldState,
	};
};
