export const identifyResponse = (email = true, password = true) => {
	const emailOption = {
		label: 'Email',
		value: {
			form: {
				value: [
					{
						name: 'id',
						required: true,
						value: 'emailId',
						mutable: false,
					},
					{
						name: 'methodType',
						required: false,
						value: 'email',
						mutable: false,
					},
				],
			},
		},
		relatesTo: '$.authenticatorEnrollments.value[0]',
	};

	const passwordOption = {
		label: 'Password',
		value: {
			form: {
				value: [
					{
						name: 'id',
						required: true,
						value: 'passwordId',
						mutable: false,
					},
					{
						name: 'methodType',
						required: false,
						value: 'password',
						mutable: false,
					},
				],
			},
		},
		relatesTo: '$.authenticatorEnrollments.value[1]',
	};

	const options = [
		email ? emailOption : null,
		password ? passwordOption : null,
	].filter(Boolean);

	const emailAuthenticator = {
		type: 'email',
		key: 'okta_email',
		id: 'emailId',
		displayName: 'Email',
		methods: [
			{
				type: 'email',
			},
		],
		allowedFor: 'any',
	};

	const passwordAuthenticator = {
		type: 'password',
		key: 'okta_password',
		id: 'passwordId',
		displayName: 'Password',
		methods: [
			{
				type: 'password',
			},
		],
		allowedFor: 'sso',
	};

	const authenticators = [
		email ? emailAuthenticator : null,
		password ? passwordAuthenticator : null,
	].filter(Boolean);

	const emailEnrollment = {
		profile: {
			email: 'test@example.com',
		},
		type: 'email',
		key: 'okta_email',
		id: 'emailFactorId',
		displayName: 'Email',
		methods: [
			{
				type: 'email',
			},
		],
	};

	const passwordEnrollment = {
		type: 'password',
		key: 'okta_password',
		id: 'passwordFactorId',
		displayName: 'Password',
		methods: [
			{
				type: 'password',
			},
		],
	};

	const enrollments = [
		email ? emailEnrollment : null,
		password ? passwordEnrollment : null,
	].filter(Boolean);

	return {
		version: '1.0.0',
		stateHandle: '02.id.state~c.handle',
		expiresAt: '2099-12-31T23:59:59.000Z',
		intent: 'LOGIN',
		remediation: {
			type: 'array',
			value: [
				{
					rel: ['create-form'],
					name: 'select-authenticator-authenticate',
					href: 'https://profile.thegulocal.com/idp/idx/challenge',
					method: 'POST',
					produces: 'application/ion+json; okta-version=1.0.0',
					value: [
						{
							name: 'authenticator',
							type: 'object',
							options,
						},
						{
							name: 'stateHandle',
							required: true,
							value: '02.id.state~c.handle',
							visible: false,
							mutable: false,
						},
					],
					accepts: 'application/json; okta-version=1.0.0',
				},
			],
		},
		authenticators,
		authenticatorEnrollments: {
			type: 'array',
			value: enrollments,
		},
		user: {
			type: 'object',
			value: {
				identifier: 'test@example.com',
			},
		},
		cancel: {
			rel: ['create-form'],
			name: 'cancel',
			href: 'https://profile.thegulocal.com/idp/idx/cancel',
			method: 'POST',
			produces: 'application/ion+json; okta-version=1.0.0',
			value: [
				{
					name: 'stateHandle',
					required: true,
					value: '02.id.state~c.handle',
					visible: false,
					mutable: false,
				},
			],
			accepts: 'application/json; okta-version=1.0.0',
		},
		app: {
			type: 'object',
			value: {
				name: 'oidc_client',
				label: 'sample_application',
				id: 'client_id',
			},
		},
		authentication: {
			type: 'object',
			value: {
				protocol: 'OAUTH2.0',
				issuer: {
					id: 'issuerId',
					name: 'Authorization Server',
					uri: 'https://profile.thegulocal.com/oauth2/issuerId',
				},
				request: {
					max_age: -1,
					scope: 'openid',
					response_type: 'code',
					redirect_uri: 'localhost',
					state: 'state',
					code_challenge_method: 'S256',
					code_challenge: 'test',
					response_mode: 'query',
				},
			},
		},
	};
};
