declare global {
	// eslint-disable-next-line @typescript-eslint/no-namespace
	namespace Cypress {
		interface Chainable {
			disableCMP: typeof disableCMP;
			enableCMP: typeof enableCMP;
			acceptCMP: typeof acceptCMP;
			declineCMP: typeof declineCMP;
		}
	}
}

export const disableCMP = () => {
	return cy.setCookie('gu-cmp-disabled', 'true');
};

export const enableCMP = () => {
	return cy.setCookie('gu-cmp-disabled', 'false');
};

// CMP helpers work for GB/tcfv2 region only //
const cmpIframe = () => {
	return cy
		.get('iframe[id^="sp_message_iframe"]')
		.its('0.contentDocument.body')
		.should('not.be.empty')
		.then((element) => cy.wrap(element));
};

export const acceptCMP = () => {
	cmpIframe().find('.sp_choice_type_11').click().wait(2000);
};

export const declineCMP = () => {
	cmpIframe().find('.sp_choice_type_13').click().wait(2000);
};
