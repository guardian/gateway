import 'source-map-support/register';
import { GuRoot } from '@guardian/cdk/lib/constructs/root';
import { IdentityGateway } from '../lib/identity-gateway';

const app = new GuRoot();
new IdentityGateway(app, 'IdentityGateway-euwest-1-PROD', {
	stack: 'identity',
	stage: 'PROD',
	env: { region: 'eu-west-1' },
	baseUri: `profile.theguardian.com`,
	defaultReturnUri: `https://theguardian.com`,
	scaling: {
		maximumInstances: 12,
		minimumInstances: 3,
	},
});
new IdentityGateway(app, 'IdentityGateway-euwest-1-CODE', {
	stack: 'identity',
	stage: 'CODE',
	env: { region: 'eu-west-1' },
	baseUri: `profile.code.dev-theguardian.com`,
	defaultReturnUri: `https://m.code.dev-theguardian.com`,
	scaling: {
		minimumInstances: 1,
		maximumInstances: 2,
	},
});
