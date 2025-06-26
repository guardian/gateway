import { App } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { IdentityGateway } from './identity-gateway';

describe('The IdentityGateway stack', () => {
	it('matches the snapshot', () => {
		const app = new App();
		const stack = new IdentityGateway(app, 'IdentityGateway', {
			stack: 'identity',
			stage: 'TEST',
		});
		const template = Template.fromStack(stack);
		expect(template.toJSON()).toMatchSnapshot();
	});
});
