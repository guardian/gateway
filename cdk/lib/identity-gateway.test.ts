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
			baseUri: `profile.code.dev-theguardian.com`,
			defaultReturnUri: `https://m.code.dev-theguardian.com`,
		});
		const template = Template.fromStack(stack);
		expect(template.toJSON()).toMatchSnapshot();
	});
});
