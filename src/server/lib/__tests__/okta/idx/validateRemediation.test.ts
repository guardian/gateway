import {
	ExtractLiteralRemediationNames,
	validateRemediation,
} from '@/server/lib/okta/idx/shared/schemas';

// mocked configuration
jest.mock('@/server/lib/getConfiguration', () => ({
	getConfiguration: () => ({}),
}));

// mocked logger
jest.mock('@/server/lib/serverSideLogger');

// mocked response type
type ResponseType = {
	remediation: { value: Array<{ name: string }> };
};

// test response type
interface TestResponseType extends ResponseType {
	remediation: {
		value: Array<
			| {
					name: 'select-authenticator-enroll';
			  }
			| {
					name: 'challenge-authenticator';
			  }
		>;
	};
}

// test remediation names
type TestRemediationNames = ExtractLiteralRemediationNames<
	TestResponseType['remediation']['value'][number]
>;

describe('okta#idx#validateRemediation', () => {
	test('should validate the remediation object of a given response', () => {
		const response: TestResponseType = {
			remediation: {
				value: [
					{
						name: 'select-authenticator-enroll',
					},
					{
						name: 'challenge-authenticator',
					},
				],
			},
		};

		expect(
			validateRemediation<TestResponseType, TestRemediationNames>(
				response,
				'select-authenticator-enroll',
			),
		).toBe(true);
	});

	test('should throw an error if the remediation object is not found in the response', () => {
		const response: TestResponseType = {
			remediation: {
				value: [
					{
						name: 'select-authenticator-enroll',
					},
				],
			},
		};

		expect(() =>
			validateRemediation<TestResponseType, TestRemediationNames>(
				response,
				'challenge-authenticator',
			),
		).toThrow(
			'IDX response does not contain the expected remediation: challenge-authenticator',
		);
	});

	test('should return true if the remediation object is found in the response and useThrow is false', () => {
		const response: TestResponseType = {
			remediation: {
				value: [
					{
						name: 'select-authenticator-enroll',
					},
				],
			},
		};

		expect(
			validateRemediation<TestResponseType, TestRemediationNames>(
				response,
				'select-authenticator-enroll',
				false,
			),
		).toBe(true);
	});

	test('should return false if the remediation object is not found in the response and useThrow is false', () => {
		const response: TestResponseType = {
			remediation: {
				value: [
					{
						name: 'select-authenticator-enroll',
					},
				],
			},
		};

		expect(
			validateRemediation<TestResponseType, TestRemediationNames>(
				response,
				'challenge-authenticator',
				false,
			),
		).toBe(false);
	});
});
