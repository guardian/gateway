export const GUEST_ENDPOINT = '/guest';

export const invalidEmailAddress = {
	status: 'error',
	errors: [
		{
			message: 'Invalid emailAddress:',
			description: 'Please enter a valid email address',
			context: 'user.primaryEmailAddress',
		},
	],
};
