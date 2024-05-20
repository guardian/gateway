import crypto from 'crypto';

describe('Unsubscribe newsletter/marketing email', () => {
	const newsletterListId = '4151';
	const newsletterId = 'today-uk';
	const marketingId = 'supporter';

	const createData = (newsletterId: string, userId: string) =>
		`${newsletterId}:${userId}:${Math.floor(Date.now() / 1000)}`;

	const createToken = (data: string) =>
		crypto
			.createHmac('sha1', Cypress.env('BRAZE_HMAC_KEY'))
			.update(data)
			.digest('hex');

	it('should be able to unsubscribe from a newsletter', () => {
		cy.createTestUser({
			isUserEmailValidated: true,
		}).then(({ cookies }) => {
			// SC_GU_U is required for the cy.getTestUserDetails
			const scGuU = cookies.find((cookie) => cookie.key === 'SC_GU_U');
			if (!scGuU) throw new Error('SC_GU_U cookie not found');
			cy.setCookie('SC_GU_U', scGuU?.value);

			cy.getTestUserDetails().then(({ user }) => {
				const id = user.id;
				const data = createData(newsletterId, id);
				cy.subscribeToNewsletter(newsletterListId).then(() => {
					cy.visit(
						`/unsubscribe/newsletter/${encodeURIComponent(data)}/${createToken(
							data,
						)}`,
					);
					cy.contains('You have been unsubscribed.');
				});
			});
		});
	});

	it('should be able to unsubscribe from a marketing email', () => {
		cy.createTestUser({
			isUserEmailValidated: true,
		}).then(({ cookies }) => {
			// SC_GU_U is required for the cy.getTestUserDetails
			const scGuU = cookies.find((cookie) => cookie.key === 'SC_GU_U');
			if (!scGuU) throw new Error('SC_GU_U cookie not found');
			cy.setCookie('SC_GU_U', scGuU?.value);

			cy.getTestUserDetails().then(({ user }) => {
				const id = user.id;
				const data = createData(marketingId, id);
				cy.subscribeToMarketingConsent(marketingId).then(() => {
					cy.visit(
						`/unsubscribe/marketing/${encodeURIComponent(data)}/${createToken(
							data,
						)}`,
					);
					cy.contains('You have been unsubscribed.');
				});
			});
		});
	});

	it('should be able to unsubscribe from all emails', () => {
		cy.createTestUser({
			isUserEmailValidated: true,
		}).then(({ cookies }) => {
			// SC_GU_U is required for the cy.getTestUserDetails
			const scGuU = cookies.find((cookie) => cookie.key === 'SC_GU_U');
			if (!scGuU) throw new Error('SC_GU_U cookie not found');
			cy.setCookie('SC_GU_U', scGuU?.value);

			cy.getTestUserDetails().then(({ user }) => {
				const userId = user.id;
				const data = `${userId}:${Math.floor(Date.now() / 1000)}`;
				cy.request(
					'POST',
					`/unsubscribe-all/${encodeURIComponent(data)}/${createToken(data)}`,
				).then((response) => {
					expect(response.status).to.eq(200);
				});
			});
		});
	});

	it('should be able to handle a unsubscribe error if emailType is not newsletter/marketing', () => {
		cy.createTestUser({
			isUserEmailValidated: true,
		}).then(({ cookies }) => {
			// SC_GU_U is required for the cy.getTestUserDetails
			const scGuU = cookies.find((cookie) => cookie.key === 'SC_GU_U');
			if (!scGuU) throw new Error('SC_GU_U cookie not found');
			cy.setCookie('SC_GU_U', scGuU?.value);

			cy.getTestUserDetails().then(({ user }) => {
				const id = user.id;
				const data = createData(marketingId, id);
				cy.subscribeToMarketingConsent(marketingId).then(() => {
					cy.visit(
						`/unsubscribe/fake/${encodeURIComponent(data)}/${createToken(
							data,
						)}`,
					);
					cy.contains('Unable to unsubscribe.');
				});
			});
		});
	});

	it('should be able to handle a unsubscribe error if token is invalid', () => {
		cy.createTestUser({
			isUserEmailValidated: true,
		}).then(({ cookies }) => {
			// SC_GU_U is required for the cy.getTestUserDetails
			const scGuU = cookies.find((cookie) => cookie.key === 'SC_GU_U');
			if (!scGuU) throw new Error('SC_GU_U cookie not found');
			cy.setCookie('SC_GU_U', scGuU?.value);

			cy.getTestUserDetails().then(({ user }) => {
				const id = user.id;
				const data = createData(newsletterId, id);
				cy.subscribeToNewsletter(newsletterListId).then(() => {
					cy.visit(
						`/unsubscribe/newsletter/${encodeURIComponent(data)}/fake_token`,
					);
					cy.contains('Unable to unsubscribe.');
				});
			});
		});
	});

	it('should be able to handle a unsubscribe error if newsletterId is invalid', () => {
		cy.createTestUser({
			isUserEmailValidated: true,
		}).then(({ cookies }) => {
			// SC_GU_U is required for the cy.getTestUserDetails
			const scGuU = cookies.find((cookie) => cookie.key === 'SC_GU_U');
			if (!scGuU) throw new Error('SC_GU_U cookie not found');
			cy.setCookie('SC_GU_U', scGuU?.value);

			cy.getTestUserDetails().then(({ user }) => {
				const id = user.id;
				const data = createData(`${newsletterId}-fake`, id);
				cy.subscribeToNewsletter(newsletterListId).then(() => {
					cy.visit(
						`/unsubscribe/newsletter/${encodeURIComponent(data)}/${createToken(
							data,
						)}`,
					);
					cy.contains('Unable to unsubscribe.');
				});
			});
		});
	});

	it('should be able to handle a unsubscribe error if marketingId is invalid', () => {
		cy.createTestUser({
			isUserEmailValidated: true,
		}).then(({ cookies }) => {
			// SC_GU_U is required for the cy.getTestUserDetails
			const scGuU = cookies.find((cookie) => cookie.key === 'SC_GU_U');
			if (!scGuU) throw new Error('SC_GU_U cookie not found');
			cy.setCookie('SC_GU_U', scGuU?.value);

			cy.getTestUserDetails().then(({ user }) => {
				const id = user.id;
				const data = createData(`${marketingId}-fake`, id);
				cy.subscribeToMarketingConsent(marketingId).then(() => {
					cy.visit(
						`/unsubscribe/marketing/${encodeURIComponent(data)}/${createToken(
							data,
						)}`,
					);
					cy.contains('Unable to unsubscribe.');
				});
			});
		});
	});

	it('should be able to handle a unsubscribe error if userId is invalid', () => {
		cy.createTestUser({
			isUserEmailValidated: true,
		}).then(({ cookies }) => {
			// SC_GU_U is required for the cy.getTestUserDetails
			const scGuU = cookies.find((cookie) => cookie.key === 'SC_GU_U');
			if (!scGuU) throw new Error('SC_GU_U cookie not found');
			cy.setCookie('SC_GU_U', scGuU?.value);

			cy.getTestUserDetails().then(({ user }) => {
				const id = user.id;
				const data = createData(marketingId, `${id}0`);
				cy.subscribeToMarketingConsent(marketingId).then(() => {
					cy.visit(
						`/unsubscribe/marketing/${encodeURIComponent(data)}/${createToken(
							data,
						)}`,
					);
					cy.contains('Unable to unsubscribe.');
				});
			});
		});
	});

	it('should be able to handle a unsubscribe error if data is invalid', () => {
		cy.createTestUser({
			isUserEmailValidated: true,
		}).then(({ cookies }) => {
			// SC_GU_U is required for the cy.getTestUserDetails
			const scGuU = cookies.find((cookie) => cookie.key === 'SC_GU_U');
			if (!scGuU) throw new Error('SC_GU_U cookie not found');
			cy.setCookie('SC_GU_U', scGuU?.value);

			cy.getTestUserDetails().then(() => {
				const data = 'data-is-invalid:yes-123';
				cy.subscribeToMarketingConsent(marketingId).then(() => {
					cy.visit(
						`/unsubscribe/marketing/${encodeURIComponent(data)}/${createToken(
							data,
						)}`,
					);
					cy.contains('Unable to unsubscribe.');
				});
			});
		});
	});
});
