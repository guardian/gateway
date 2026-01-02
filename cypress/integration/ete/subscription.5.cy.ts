import crypto from 'crypto';

describe('Unsubscribe newsletter/marketing email', () => {
	const newsletterId = 'today-uk';
	const marketingId = 'supporter';

	const createData = (newsletterId: string, userId: string) =>
		`${newsletterId}:${userId}:${Math.floor(Date.now() / 1000)}`;

	const createToken = (data: string) =>
		crypto
			.createHmac('sha1', Cypress.env('BRAZE_HMAC_KEY'))
			.update(data)
			.digest('hex');

	const subscribe = (
		type: 'newsletter' | 'marketing',
		data: string,
		expectSuccess = true,
	) => {
		cy.visit(
			`/subscribe/${type}/${encodeURIComponent(data)}/${createToken(data)}`,
		);
		cy.get('button[type="submit"]').click();
		if (expectSuccess) {
			cy.contains("You're signed up!");
		} else {
			cy.contains('Unable to subscribe.');
		}
	};

	const subscribeWithFakeEmailType = (data: string) => {
		cy.visit(
			`/subscribe/fake/${encodeURIComponent(data)}/${createToken(data)}`,
		);
		cy.contains('Unable to subscribe.');
	};

	const subscribeWithInvalidData = (type: 'newsletter' | 'marketing') => {
		const data = 'data-is-invalid:yes-123';
		cy.visit(
			`/subscribe/${type}/${encodeURIComponent(data)}/${createToken(data)}`,
		);
		cy.contains('Unable to subscribe.');
	};

	const subscribeWithInvalidToken = (
		type: 'newsletter' | 'marketing',
		data: string,
	) => {
		cy.visit(`/subscribe/${type}/${encodeURIComponent(data)}/fakeToken`);
		cy.get('button[type="submit"]').click();
		cy.contains('Unable to subscribe.');
	};

	const unsubscribe = (
		type: 'newsletter' | 'marketing',
		data: string,
		expectSuccess = true,
	) => {
		cy.visit(
			`/unsubscribe/${type}/${encodeURIComponent(data)}/${createToken(data)}`,
		);
		cy.contains(
			'Please click below to complete your unsubscribe from this list',
		);
		cy.get('button[type="submit"]').click();
		if (expectSuccess) {
			cy.contains('You have been unsubscribed');
		} else {
			cy.contains('Unable to unsubscribe.');
		}
	};

	const unsubscribeWithFakeEmailType = (data: string) => {
		cy.visit(
			`/unsubscribe/fake/${encodeURIComponent(data)}/${createToken(data)}`,
		);
		cy.contains('Unable to unsubscribe.');
	};

	const unsubscribeWithInvalidData = (type: 'newsletter' | 'marketing') => {
		const data = 'data-is-invalid:yes-123';
		cy.visit(
			`/unsubscribe/${type}/${encodeURIComponent(data)}/${createToken(data)}`,
		);
		cy.contains('Unable to unsubscribe.');
	};

	const unsubscribeWithInvalidToken = (
		type: 'newsletter' | 'marketing',
		data: string,
	) => {
		cy.visit(`/unsubscribe/${type}/${encodeURIComponent(data)}/fakeToken`);
		cy.get('button[type="submit"]').click();
		cy.contains('Unable to unsubscribe.');
	};

	it('should be able to unsubscribe from a newsletter', () => {
		cy.createTestUser({
			isUserEmailValidated: true,
		}).then(({ idapiUserId }) => {
			const data = createData(newsletterId, idapiUserId);
			subscribe('newsletter', data);
			unsubscribe('newsletter', data);
		});
	});

	it('should be able to unsubscribe from a marketing email', () => {
		cy.createTestUser({
			isUserEmailValidated: true,
		}).then(({ idapiUserId }) => {
			const data = createData(marketingId, idapiUserId);
			subscribe('marketing', data);
			unsubscribe('marketing', data);
		});
	});

	it('should be able to unsubscribe from all emails', () => {
		cy.createTestUser({
			isUserEmailValidated: true,
		}).then(({ idapiUserId }) => {
			const data = `${idapiUserId}:${Math.floor(Date.now() / 1000)}`;
			cy.request(
				'POST',
				`/unsubscribe-all/${encodeURIComponent(data)}/${createToken(data)}`,
			).then((response) => {
				expect(response.status).to.eq(200);
			});
		});
	});

	it('should be able to handle a subscribe error if emailType is not newsletter/marketing', () => {
		cy.createTestUser({
			isUserEmailValidated: true,
		}).then(({ idapiUserId }) => {
			const data = createData(marketingId, idapiUserId);
			subscribeWithFakeEmailType(data);
		});
	});

	it('should be able to handle a unsubscribe error if emailType is not newsletter/marketing', () => {
		cy.createTestUser({
			isUserEmailValidated: true,
		}).then(({ idapiUserId }) => {
			const data = createData(marketingId, idapiUserId);
			unsubscribeWithFakeEmailType(data);
		});
	});

	it('should be able to handle a subscribe error if token is invalid', () => {
		cy.createTestUser({
			isUserEmailValidated: true,
		}).then(({ idapiUserId }) => {
			const data = createData(newsletterId, idapiUserId);
			subscribeWithInvalidToken('newsletter', data);
		});
	});

	it('should be able to handle a unsubscribe error if token is invalid', () => {
		cy.createTestUser({
			isUserEmailValidated: true,
		}).then(({ idapiUserId }) => {
			const data = createData(newsletterId, idapiUserId);
			subscribe('newsletter', data);
			unsubscribeWithInvalidToken('newsletter', data);
		});
	});

	it('should be able to handle a subscribe error if newsletterId is invalid', () => {
		cy.createTestUser({
			isUserEmailValidated: true,
		}).then(({ idapiUserId }) => {
			const data = createData(`${newsletterId}-fake`, idapiUserId);
			subscribe('newsletter', data, false);
		});
	});

	it('should be able to handle an unsubscribe error if newsletterId is invalid', () => {
		cy.createTestUser({
			isUserEmailValidated: true,
		}).then(({ idapiUserId }) => {
			const data = createData(newsletterId, idapiUserId);
			subscribe('newsletter', data);
			const fakeData = createData(`${newsletterId}-fake`, idapiUserId);
			unsubscribe('newsletter', fakeData, false);
		});
	});

	it('should be able to handle a subscribe error if marketingId is invalid', () => {
		cy.createTestUser({
			isUserEmailValidated: true,
		}).then(({ idapiUserId }) => {
			const data = createData(`${marketingId}-fake`, idapiUserId);
			subscribe('marketing', data, false);
		});
	});

	it('should be able to handle an unsubscribe error if marketingId is invalid', () => {
		cy.createTestUser({
			isUserEmailValidated: true,
		}).then(({ idapiUserId }) => {
			const data = createData(marketingId, idapiUserId);
			subscribe('marketing', data);
			const fakeData = createData(`${marketingId}-fake`, idapiUserId);
			unsubscribe('marketing', fakeData, false);
		});
	});

	it('should be able to handle a subscribe error if userId is invalid', () => {
		const data = createData(marketingId, 'not-an-id');
		subscribe('marketing', data, false);
	});

	it('should be able to handle a unsubscribe error if userId is invalid', () => {
		const data = createData(marketingId, 'not-an-id');
		unsubscribe('marketing', data, false);
	});

	it('should be able to handle a subscribe error if data is invalid', () => {
		subscribeWithInvalidData('marketing');
	});

	it('should be able to handle a unsubscribe error if data is invalid', () => {
		unsubscribeWithInvalidData('marketing');
	});
});
