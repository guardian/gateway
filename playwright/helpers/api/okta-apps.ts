import { APIRequestContext } from '@playwright/test';

export interface AppResponse {
	id: string;
	name: string;
	label: string;
	status: string;
}

export async function oktaGetApps(
	request: APIRequestContext,
	label?: string,
): Promise<AppResponse[]> {
	try {
		const response = await request.get(
			`${process.env.OKTA_ORG_URL}/api/v1/apps${label ? `?q=${label}` : ''}`,
			{
				headers: {
					Authorization: `SSWS ${process.env.OKTA_API_TOKEN}`,
				},
			},
		);

		return await response.json();
	} catch (error) {
		throw new Error('Failed to list okta apps: ' + error);
	}
}
