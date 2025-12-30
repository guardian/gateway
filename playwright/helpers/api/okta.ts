import { APIRequestContext } from '@playwright/test';
import {
	TokenResponse,
	UserResponse,
	SessionResponse,
} from '@/server/models/okta/User';
import { Group } from '@/server/models/okta/Group';

interface OktaUserProfile {
	isJobsUser?: boolean;
	firstName?: string;
	lastName?: string;
	legacyIdentityId?: string | null;
}

export async function getTestOktaUser(
	request: APIRequestContext,
	id: string,
): Promise<UserResponse> {
	try {
		const response = await request.get(
			`${process.env.OKTA_ORG_URL}/api/v1/users/${id}`,
			{
				headers: {
					Authorization: `SSWS ${process.env.OKTA_API_TOKEN}`,
				},
			},
		);

		return await response.json();
	} catch (error) {
		throw new Error('Failed to get Okta test user: ' + error);
	}
}

export async function updateOktaTestUserProfile(
	request: APIRequestContext,
	id: string,
	profile: OktaUserProfile,
): Promise<TokenResponse> {
	try {
		const response = await request.post(
			`${process.env.OKTA_ORG_URL}/api/v1/users/${id}`,
			{
				headers: {
					Authorization: `SSWS ${process.env.OKTA_API_TOKEN}`,
				},
				data: {
					profile,
				},
			},
		);

		return await response.json();
	} catch (error) {
		throw new Error('Failed to update Okta test user: ' + error);
	}
}

export async function activateTestOktaUser(
	request: APIRequestContext,
	id: string,
): Promise<TokenResponse> {
	try {
		const response = await request.post(
			`${process.env.OKTA_ORG_URL}/api/v1/users/${id}/lifecycle/activate?sendEmail=false`,
			{
				headers: {
					Authorization: `SSWS ${process.env.OKTA_API_TOKEN}`,
				},
			},
		);

		return await response.json();
	} catch (error) {
		throw new Error('Failed to activate Okta test user: ' + error);
	}
}

export async function resetOktaUserPassword(
	request: APIRequestContext,
	id: string,
): Promise<TokenResponse> {
	try {
		const response = await request.post(
			`${process.env.OKTA_ORG_URL}/api/v1/users/${id}/lifecycle/reset_password?sendEmail=false`,
			{
				headers: {
					Authorization: `SSWS ${process.env.OKTA_API_TOKEN}`,
				},
			},
		);

		const body = await response.json();
		const token = body.resetPasswordUrl.split('/').slice(-1)[0];
		return { token } as TokenResponse;
	} catch (error) {
		throw new Error('Failed to reset password for Okta test user: ' + error);
	}
}

export async function expireOktaUserPassword(
	request: APIRequestContext,
	id: string,
): Promise<UserResponse> {
	try {
		const response = await request.post(
			`${process.env.OKTA_ORG_URL}/api/v1/users/${id}/lifecycle/expire_password`,
			{
				headers: {
					Authorization: `SSWS ${process.env.OKTA_API_TOKEN}`,
				},
			},
		);

		return await response.json();
	} catch (error) {
		throw new Error('Failed to expire password for Okta test user: ' + error);
	}
}

export async function suspendOktaUser(
	request: APIRequestContext,
	id: string,
): Promise<boolean> {
	try {
		await request.post(
			`${process.env.OKTA_ORG_URL}/api/v1/users/${id}/lifecycle/suspend`,
			{
				headers: {
					Authorization: `SSWS ${process.env.OKTA_API_TOKEN}`,
				},
			},
		);

		return true;
	} catch (error) {
		throw new Error('Failed to suspend Okta test user: ' + error);
	}
}

export async function getOktaUserGroups(
	request: APIRequestContext,
	id: string,
): Promise<Group[]> {
	try {
		const response = await request.get(
			`${process.env.OKTA_ORG_URL}/api/v1/users/${id}/groups`,
			{
				headers: {
					Authorization: `SSWS ${process.env.OKTA_API_TOKEN}`,
				},
			},
		);

		return await response.json();
	} catch (error) {
		throw new Error('Failed to get user groups: ' + error);
	}
}

export async function addOktaUserToGroup(
	request: APIRequestContext,
	id: string,
	groupId: string,
): Promise<boolean> {
	try {
		await request.put(
			`${process.env.OKTA_ORG_URL}/api/v1/groups/${groupId}/users/${id}`,
			{
				headers: {
					Authorization: `SSWS ${process.env.OKTA_API_TOKEN}`,
				},
			},
		);

		return true;
	} catch (error) {
		throw new Error('Failed to add Okta test user to group: ' + error);
	}
}

export async function findEmailValidatedOktaGroupId(
	request: APIRequestContext,
): Promise<string> {
	try {
		const response = await request.get(
			`${process.env.OKTA_ORG_URL}/api/v1/groups?q=GuardianUser-EmailValidated`,
			{
				headers: {
					Authorization: `SSWS ${process.env.OKTA_API_TOKEN}`,
				},
			},
		);

		const body = await response.json();
		const group = body[0]?.id as string | undefined;
		if (!group) {
			throw new Error('Failed to find Okta group');
		}
		return group;
	} catch (error) {
		throw new Error(
			'Failed to get ID of GuardianUser-EmailValidated group: ' + error,
		);
	}
}

export async function getCurrentOktaSession(
	request: APIRequestContext,
	{ idx }: { idx?: string },
): Promise<SessionResponse> {
	try {
		const Cookie = `${idx ? `idx=${idx};` : ''}`;
		const response = await request.get(
			`${process.env.OKTA_ORG_URL}/api/v1/sessions/me`,
			{
				headers: {
					Cookie,
				},
			},
		);

		return await response.json();
	} catch (error) {
		throw new Error('Failed to get current Okta session: ' + error);
	}
}

export async function closeCurrentOktaSession(
	request: APIRequestContext,
	{ idx }: { idx?: string },
): Promise<boolean> {
	try {
		const Cookie = `${idx ? `idx=${idx};` : ''}`;
		const response = await request.delete(
			`${process.env.OKTA_ORG_URL}/api/v1/sessions/me`,
			{
				headers: {
					Cookie,
				},
			},
		);

		if (response.status() === 204 || response.status() === 404) {
			return true;
		}
		return false;
	} catch (error) {
		throw new Error('Failed to close current Okta session: ' + error);
	}
}
