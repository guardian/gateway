import { Code, Link, Message } from 'cypress-mailosaur';
declare global {
	// eslint-disable-next-line @typescript-eslint/no-namespace
	namespace Cypress {
		interface Chainable {
			checkForEmailAndGetDetails: typeof checkForEmailAndGetDetails;
		}
	}
}

/**
 * Checks that a Mailosaur email has been sent and returns the details of the email.
 *
 * @param sentTo The email address to check for.
 * @param receivedAfter The date to check for emails received after.
 * @param tokenMatcher A regular expression to extract the token from the email body.
 * @param deleteAfter Whether to delete the email after it has been checked (optional).
 * @returns The email details.
 */
export const checkForEmailAndGetDetails = (
	sentTo: string,
	receivedAfter?: Date,
	tokenMatcher?: RegExp,
	deleteAfter = true,
) => {
	// adds a small delay in case email is not yet received
	cy.wait(3000);
	return cy
		.mailosaurGetMessage(
			Cypress.env('MAILOSAUR_SERVER_ID'),
			{ sentTo },
			{
				receivedAfter,
			},
		)
		.then((message: Message) => {
			return getEmailDetails(message, tokenMatcher).then((details) => {
				if (deleteAfter) {
					cy.mailosaurDeleteMessage(details.id);
				}
				return cy.wrap(details);
			});
		});
};

type EmailDetails = {
	id: string;
	body: string;
	token?: string;
	links: Link[];
	codes?: Code[];
};

/**
 * Extracts information from a Mailosaur email.
 *
 * @param email The email to extract information from.
 * @param tokenMatcher A regular expression to extract the token from the email body.
 * @returns The email details.
 */
const getEmailDetails = (email: Message, tokenMatcher?: RegExp) => {
	const { id, html } = email;
	const { body, links } = html || {};
	// eslint-disable-next-line functional/no-let
	let { codes } = html || {};
	if (id === undefined || body === undefined || links === undefined) {
		throw new Error('Email details not found');
	}
	// eslint-disable-next-line functional/no-let
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
		codes = codes.filter((code) => code.value?.match(/\d{6}/));
	}

	return cy.wrap<EmailDetails>({ id, body, token, links, codes });
};
