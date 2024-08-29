import {
	extractMessage,
	StructuredGatewayError,
	asStructuredError,
} from '@/shared/model/Errors';

describe('GatewayError', () => {
	const stringError: string = 'a am a simple error message';
	const structuredError: StructuredGatewayError = {
		message: 'I am a structured error message',
		severity: 'BAU',
	};
	test('extracting message from undefined returns undefined', () => {
		expect(extractMessage(undefined)).toBeUndefined();
	});
	test('extracting message from a simple string error should return itself', () => {
		expect(extractMessage(stringError)).toEqual(stringError);
	});
	test('extracting message from a structured error should return the message', () => {
		expect(extractMessage(structuredError)).toEqual(structuredError.message);
	});
	test('converting undefined to structuredError returns undefined', () => {
		expect(asStructuredError(undefined)).toBeUndefined();
	});
	test('extracting message from a simple string error should return a structured error with default parameters for fields other than message', () => {
		expect(asStructuredError(stringError)).toEqual({
			message: stringError,
			severity: 'UNEXPECTED',
		});
	});
	test('converting a structured error to structured error should return itself', () => {
		expect(asStructuredError(structuredError)).toEqual(structuredError);
	});
});
