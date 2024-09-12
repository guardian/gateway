import {
	ChallengeResponse,
	validateChallengeRemediation,
} from '@/server/lib/okta/idx/challenge';
import {
	ExtractLiteralRemediationNames,
	validateRemediation,
} from '@/server/lib/okta/idx/shared/schemas';

// mocked configuration
jest.mock('@/server/lib/getConfiguration', () => ({
	getConfiguration: () => ({
		baseUri: 'localhost',
	}),
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

const responseWithPassword: ChallengeResponse = {
	expiresAt: '2024-09-11T14:03:26.000Z',
	stateHandle: 'stateHandle',
	version: '1.0.0',
	remediation: {
		type: 'array',
		value: [
			{
				name: 'challenge-authenticator',
				value: [
					{
						name: 'credentials',
						form: {
							value: [{ name: 'passcode' }],
						},
					},
					{
						name: 'stateHandle',
					},
				],
			},
		],
	},
	currentAuthenticatorEnrollment: {
		type: 'object',
		value: {
			type: 'password',
			recover: {
				name: 'recover',
			},
		},
	},
};

const responseWithEmail: ChallengeResponse = {
	expiresAt: '2024-09-11T14:03:26.000Z',
	stateHandle: 'stateHandle',
	version: '1.0.0',
	remediation: {
		type: 'array',
		value: [
			{
				name: 'challenge-authenticator',
				value: [
					{
						name: 'credentials',
						form: {
							value: [{ name: 'passcode' }],
						},
					},
					{
						name: 'stateHandle',
					},
				],
			},
		],
	},
	currentAuthenticatorEnrollment: {
		type: 'object',
		value: {
			type: 'email',
			resend: {
				name: 'resend',
			},
		},
	},
};

describe('okta#idx#validateChallengeRemediation', () => {
	test('should validate the remediation object of a given ChallengeResponse', () => {
		expect(
			validateChallengeRemediation(
				responseWithPassword,
				'challenge-authenticator',
				'password',
				true,
			),
		).toBe(true);
	});

	test('should throw an error if the remediation object is not found in the response', () => {
		expect(() =>
			validateChallengeRemediation(
				responseWithPassword,
				'select-authenticator-enroll' as 'challenge-authenticator', // hack to test the error
				'password',
				true,
			),
		).toThrow(
			'IDX response does not contain the expected remediation: select-authenticator-enroll',
		);
	});

	test('should return true if the remediation object is found in the response and useThrow is false', () => {
		expect(
			validateChallengeRemediation(
				responseWithPassword,
				'challenge-authenticator',
				'password',
				true,
				false,
			),
		).toBe(true);
	});

	test('should return false if the remediation object is not found in the response and useThrow is false', () => {
		expect(
			validateChallengeRemediation(
				responseWithPassword,
				'select-authenticator-enroll' as 'challenge-authenticator', // hack to test the error
				'password',
				true,
				false,
			),
		).toBe(false);
	});

	test('should throw if authenticator type is not in the remediation object', () => {
		expect(() =>
			validateChallengeRemediation(
				responseWithPassword,
				'challenge-authenticator',
				'email',
				true,
			),
		).toThrow(
			'The challenge response does not contain the expected email authenticator',
		);

		expect(() =>
			validateChallengeRemediation(
				responseWithEmail,
				'challenge-authenticator',
				'password',
				true,
			),
		).toThrow(
			'The challenge response does not contain the expected password authenticator',
		);
	});

	test('should return false if authenticator type is not in the remediation object and useThrow is false', () => {
		expect(
			validateChallengeRemediation(
				responseWithPassword,
				'challenge-authenticator',
				'email',
				true,
				false,
			),
		).toBe(false);

		expect(
			validateChallengeRemediation(
				responseWithEmail,
				'challenge-authenticator',
				'password',
				true,
				false,
			),
		).toBe(false);
	});

	test('should throw if checkForResendOrRecover fails to match authenticator', () => {
		const responseWithPassword: ChallengeResponse = {
			expiresAt: '2024-09-11T14:03:26.000Z',
			stateHandle: 'stateHandle',
			version: '1.0.0',
			remediation: {
				type: 'array',
				value: [
					{
						name: 'challenge-authenticator',
						value: [
							{
								name: 'credentials',
								form: {
									value: [{ name: 'passcode' }],
								},
							},
							{
								name: 'stateHandle',
							},
						],
					},
				],
			},
			currentAuthenticatorEnrollment: {
				type: 'object',
				value: {
					type: 'password',
					// @ts-expect-error - hack to test the error
					resend: {
						name: 'resend',
					},
				},
			},
		};

		const responseWithEmail: ChallengeResponse = {
			expiresAt: '2024-09-11T14:03:26.000Z',
			stateHandle: 'stateHandle',
			version: '1.0.0',
			remediation: {
				type: 'array',
				value: [
					{
						name: 'challenge-authenticator',
						value: [
							{
								name: 'credentials',
								form: {
									value: [{ name: 'passcode' }],
								},
							},
							{
								name: 'stateHandle',
							},
						],
					},
				],
			},
			currentAuthenticatorEnrollment: {
				type: 'object',
				value: {
					type: 'email',
					// @ts-expect-error - hack to test the error
					recover: {
						name: 'recover',
					},
				},
			},
		};

		expect(() =>
			validateChallengeRemediation(
				responseWithPassword,
				'challenge-authenticator',
				'password',
				true,
			),
		).toThrow(
			'The challenge response does not contain the expected recover functionality for the password authenticator',
		);

		expect(() =>
			validateChallengeRemediation(
				responseWithEmail,
				'challenge-authenticator',
				'email',
				true,
			),
		).toThrow(
			'The challenge response does not contain the expected resend functionality for the email authenticator',
		);
	});

	test('should return false if checkForResendOrRecover fails to match authenticator and useThrow is false', () => {
		const responseWithPassword: ChallengeResponse = {
			expiresAt: '2024-09-11T14:03:26.000Z',
			stateHandle: 'stateHandle',
			version: '1.0.0',
			remediation: {
				type: 'array',
				value: [
					{
						name: 'challenge-authenticator',
						value: [
							{
								name: 'credentials',
								form: {
									value: [{ name: 'passcode' }],
								},
							},
							{
								name: 'stateHandle',
							},
						],
					},
				],
			},
			currentAuthenticatorEnrollment: {
				type: 'object',
				value: {
					type: 'password',
					// @ts-expect-error - hack to test the error
					resend: {
						name: 'resend',
					},
				},
			},
		};

		const responseWithEmail: ChallengeResponse = {
			expiresAt: '2024-09-11T14:03:26.000Z',
			stateHandle: 'stateHandle',
			version: '1.0.0',
			remediation: {
				type: 'array',
				value: [
					{
						name: 'challenge-authenticator',
						value: [
							{
								name: 'credentials',
								form: {
									value: [{ name: 'passcode' }],
								},
							},
							{
								name: 'stateHandle',
							},
						],
					},
				],
			},
			currentAuthenticatorEnrollment: {
				type: 'object',
				value: {
					type: 'email',
					// @ts-expect-error - hack to test the error
					recover: {
						name: 'recover',
					},
				},
			},
		};

		expect(
			validateChallengeRemediation(
				responseWithPassword,
				'challenge-authenticator',
				'password',
				true,
				false,
			),
		).toBe(false);

		expect(
			validateChallengeRemediation(
				responseWithEmail,
				'challenge-authenticator',
				'email',
				true,
				false,
			),
		).toBe(false);
	});

	test('should skip checkForResendOrRecover if set to false', () => {
		const responseWithPassword: ChallengeResponse = {
			expiresAt: '2024-09-11T14:03:26.000Z',
			stateHandle: 'stateHandle',
			version: '1.0.0',
			remediation: {
				type: 'array',
				value: [
					{
						name: 'challenge-authenticator',
						value: [
							{
								name: 'credentials',
								form: {
									value: [{ name: 'passcode' }],
								},
							},
							{
								name: 'stateHandle',
							},
						],
					},
				],
			},
			currentAuthenticatorEnrollment: {
				type: 'object',
				value: {
					type: 'password',
					// @ts-expect-error - hack to test the error
					resend: {
						name: 'resend',
					},
				},
			},
		};

		expect(
			validateChallengeRemediation(
				responseWithPassword,
				'challenge-authenticator',
				'password',
				false,
			),
		).toBe(true);
	});
});
