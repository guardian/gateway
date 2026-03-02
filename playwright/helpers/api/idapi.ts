import { APIRequestContext } from '@playwright/test';
import { Consent } from '@/shared/model/Consent';

type Networks = 'apple' | 'google';

type SocialLink = {
	socialId: number;
	network: Networks;
};

type IDAPITestUserOptions = {
	primaryEmailAddress?: `${string}@${string}.mailosaur.net`;
	isUserEmailValidated?: boolean;
	socialLinks?: SocialLink[];
	password?: string;
	deleteAfterMinute?: boolean;
	isGuestUser?: boolean;
};

interface IDAPIUserProfile {
	id: string;
	privateFields: {
		firstName?: string;
		secondName?: string;
	};
	userGroups: Array<{
		path: string;
		packageCode: string;
		joinedDate: string;
	}>;
	consents: Consent[];
}

type IDAPITestUserResponse = [
	{
		key: 'GU_U';
		value: string;
	},
	{
		key: 'SC_GU_LA';
		sessionCookie: boolean;
		value: string;
	},
	{
		key: 'SC_GU_U';
		value: string;
	},
];

export const randomMailosaurEmail = () => {
	return (
		crypto.randomUUID() +
		'@' +
		process.env.CYPRESS_MAILOSAUR_SERVER_ID +
		'.mailosaur.net'
	);
};

export const randomPassword = () => crypto.randomUUID();

export async function getTestUserDetails(
	request: APIRequestContext,
	idapiUserId?: string,
) {
	const response = await request.get(
		`${process.env.IDAPI_BASE_URL}/user/${idapiUserId}`,
		{
			headers: {
				'Content-Type': 'application/json',
				'X-GU-ID-Client-Access-Token': `Bearer ${process.env.IDAPI_CLIENT_ACCESS_TOKEN}`,
			},
		},
	);

	const body = await response.json();
	return {
		status: body.status,
		user: body.user as IDAPIUserProfile,
	};
}

export async function updateTestUser(
	request: APIRequestContext,
	idapiUserId: string,
	body: object,
) {
	const response = await request.post(
		`${process.env.IDAPI_BASE_URL}/user/${idapiUserId}`,
		{
			headers: {
				'Content-Type': 'application/json',
				'X-GU-ID-Client-Access-Token': `Bearer ${process.env.IDAPI_CLIENT_ACCESS_TOKEN}`,
			},
			data: JSON.stringify(body),
		},
	);

	const responseBody = await response.json();
	return {
		status: responseBody.status,
	};
}

export async function createTestUser(
	request: APIRequestContext,
	{
		primaryEmailAddress,
		password,
		socialLinks = [],
		isUserEmailValidated = false,
		deleteAfterMinute = true,
		isGuestUser = false,
	}: IDAPITestUserOptions,
) {
	const finalEmail = primaryEmailAddress || randomMailosaurEmail();
	const finalPassword = password || crypto.randomUUID();

	try {
		const response = await request.post(
			`${process.env.IDAPI_BASE_URL}/user/test`,
			{
				headers: {
					'X-GU-ID-Client-Access-Token': `Bearer ${process.env.IDAPI_CLIENT_ACCESS_TOKEN}`,
				},
				data: {
					primaryEmailAddress: finalEmail,
					isUserEmailValidated,
					socialLinks,
					password: finalPassword,
					deleteAfterMinute,
					isGuestUser,
				} as IDAPITestUserOptions,
			},
		);

		const body = await response.json();
		const cookies = body.values as IDAPITestUserResponse;
		const guUCookie = cookies.find((cookie) => cookie.key === 'GU_U');
		if (!guUCookie) {
			throw new Error('Failed to create IDAPI test user');
		}
		const idapiUserId = JSON.parse(atob(guUCookie.value.split('.')[0]))[0];
		return {
			emailAddress: finalEmail,
			cookies: body.values as IDAPITestUserResponse,
			finalPassword,
			idapiUserId,
		};
	} catch (error) {
		throw new Error(
			`Failed to create IDAPI test user: ${JSON.stringify(error)}`,
		);
	}
}

export async function sendConsentEmail(
	request: APIRequestContext,
	{
		emailAddress,
		consents,
		newsletters,
	}: {
		emailAddress: string;
		consents?: string[];
		newsletters?: string[];
	},
) {
	try {
		const requestBody = {
			email: emailAddress,
			'set-consents': consents,
			'set-lists': newsletters,
		};
		const response = await request.post(
			`${process.env.IDAPI_BASE_URL}/consent-email`,
			{
				headers: {
					'Content-Type': 'application/json',
					'X-GU-ID-Client-Access-Token': `Bearer ${process.env.IDAPI_CLIENT_ACCESS_TOKEN}`,
				},
				data: requestBody,
			},
		);
		if (!response.ok()) {
			const body = await response.text();
			throw new Error(
				`IDAPI consent-email returned ${response.status()}: ${body}`,
			);
		}
	} catch (error) {
		throw new Error(`Failed to send consents email: ${JSON.stringify(error)}`);
	}
}
