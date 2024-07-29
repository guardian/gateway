import 'source-map-support/register';
import { GuRoot } from '@guardian/cdk/lib/constructs/root';
import { IdentityGateway } from '../lib/identity-gateway';

const app = new GuRoot();
new IdentityGateway(app, 'IdentityGateway-euwest-1-PROD', {
	stack: 'identity',
	stage: 'PROD',
	env: { region: 'eu-west-1' },
});
new IdentityGateway(app, 'IdentityGateway-euwest-1-CODE', {
	stack: 'identity',
	stage: 'CODE',
	env: { region: 'eu-west-1' },
});
