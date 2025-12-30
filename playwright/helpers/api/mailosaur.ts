import MailosaurClient from 'mailosaur';

const client = new MailosaurClient(process.env.CYPRESS_MAILOSAUR_API_KEY || '');

type EmailDetails = {
	id: string;
	body: string;
	token?: string;
	links: Array<{ href: string; text: string }>;
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
function getEmailDetails(
	email: any,
	tokenMatcher?: RegExp,
): EmailDetails {
	const { id, html } = email;
	const { body, links } = html || {};
	let { codes } = html || {};

	if (id === undefined || body === undefined || links === undefined) {
		throw new Error('Email details not found');
	}

	let token = undefined;
	if (tokenMatcher) {
		const match = body.match(tokenMatcher);
		if (match === null) {
			throw new Error(
				'Unable to find token in the email body with the given regex',
			);
		}
		token = match[1];
	}

	if (codes) {
		codes = codes.filter((code: any) => code.value?.match(/\d{6}/));
	}

	return { id, body, token, links, codes };
}
