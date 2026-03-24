import MailosaurClient, { Message } from 'mailosaur';

const client = new MailosaurClient(process.env.CYPRESS_MAILOSAUR_API_KEY || '');

type EmailDetails = {
	id: string;
	body: string;
	links: Array<{ href?: string; text?: string }>;
	token?: string;
	codes?: Array<{ value: string }>;
};

/**
 * Checks that a Mailosaur email has been sent and returns the details of the email.
 *
 * @param sentTo The email address to check for.
 * @param receivedAfter The date to check for emails received after.
 * @param tokenMatcher A regular expression to extract the token from the email body.
 * @param deleteAfter Whether to delete the email after it has been checked (optional).
 * @returns The email details.
 */
export async function checkForEmailAndGetDetails(
	sentTo: string,
	receivedAfter?: Date,
	tokenMatcher?: RegExp,
	deleteAfter = true,
): Promise<EmailDetails> {
	// Small delay to ensure email is received
	await new Promise((resolve) => setTimeout(resolve, 3000));

	const serverId = process.env.CYPRESS_MAILOSAUR_SERVER_ID || '';
	const message = await client.messages.get(
		serverId,
		{ sentTo },
		{
			receivedAfter,
			timeout: 30000,
		},
	);

	const details = getEmailDetails(message, tokenMatcher);

	if (deleteAfter && details.id) {
		await client.messages.del(details.id);
	}

	return details;
}

/**
 * Extracts information from a Mailosaur email.
 *
 * @param email The email to extract information from.
 * @param tokenMatcher A regular expression to extract the token from the email body.
 * @returns The email details.
 */
const getEmailDetails = (
	email: Message,
	tokenMatcher?: RegExp,
): EmailDetails => {
	const { id, html } = email;
	const { body, links } = html || {};
	const { codes } = html || {};

	if (id === undefined || body === undefined || links === undefined) {
		throw new Error('Email details not found');
	}

	const token = tokenMatcher
		? (() => {
				const match = body.match(tokenMatcher);
				if (match === null) {
					throw new Error(
						'Unable to find token in the email body with the given regex',
					);
				}
				return match[1];
			})()
		: undefined;

	const validatedCodes = codes
		? codes
				.filter((code) => code.value?.match(/\d{6}/))
				.map((code) => ({ value: code.value! }))
		: undefined;

	return {
		id,
		body,
		token,
		links,
		...(validatedCodes && { codes: validatedCodes }),
	};
};
