import { App } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { IdentityGateway } from './identity-gateway';

describe('The IdentityGateway stack', () => {
	it('matches the snapshot', () => {
		const app = new App();
		const stack = new IdentityGateway(app, 'IdentityGateway', {
			stack: 'identity',
			stage: 'TEST',
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
			domainName: `profile.code.dev-theguardian.com.origin.guardianapis.com`,
		});
		const template = Template.fromStack(stack);
		expect(template.toJSON()).toMatchSnapshot();
	});
});
