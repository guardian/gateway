import 'source-map-support/register';
import { GuRoot } from '@guardian/cdk/lib/constructs/root';
import { IdentityGateway } from '../lib/identity-gateway';

const app = new GuRoot();
new IdentityGateway(app, 'IdentityGateway-euwest-1-PROD', {
	stack: 'identity',
	stage: 'PROD',
	env: { region: 'eu-west-1' },
	scaling: {
		minimumInstances: 3,
		maximumInstances: 12,
	},
	config: {
		idapiBaseUrl: 'https://idapi.theguardian.com',
		signInPageUrl: 'https://profile.theguardian.com/signin',
		oauthBaseUrl: 'https://oauth.theguardian.com',
		baseUri: 'profile.theguardian.com',
		defaultReturnUri: 'https://theguardian.com',
		oktaOrgUrl: 'https://profile.theguardian.com',
		membersDataApiUrl: 'https://members-data-api.theguardian.com',
	},
	domainName: `gateway-origin.guardianapis.com`,
});

new IdentityGateway(app, 'IdentityGateway-euwest-1-CODE', {
	stack: 'identity',
	stage: 'CODE',
	env: { region: 'eu-west-1' },
	scaling: {
		minimumInstances: 1,
		maximumInstances: 2,
	},
	config: {
		idapiBaseUrl: 'https://idapi.code.dev-theguardian.com',
		signInPageUrl: 'https://profile.code.dev-theguardian.com/signin',
		oauthBaseUrl: 'https://oauth.code.dev-theguardian.com',
		baseUri: 'profile.code.dev-theguardian.com',
		defaultReturnUri: 'https://m.code.dev-theguardian.com',
		oktaOrgUrl: 'https://profile.code.dev-theguardian.com',
		membersDataApiUrl: 'https://members-data-api.code.dev-theguardian.com',
	},
	domainName: `gateway-origin.code.dev-guardianapis.com`,
});
