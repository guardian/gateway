import { fromNodeProviderChain } from '@aws-sdk/credential-providers';
import { NodeHttpHandler } from '@smithy/node-http-handler';
import { CloudWatchClientConfig } from '@aws-sdk/client-cloudwatch';

const AWS_REGION = 'eu-west-1';

// in github actions, we use the default credentials provider chain profile
// while on a server/local dev, we use the `identity` profile
const PROFILE = !process.env.GITHUB_ACTION ? 'identity' : undefined;

const CREDENTIAL_PROVIDER = fromNodeProviderChain({
	profile: PROFILE,
});

// shared config for all aws clients, using the CloudwatchClientConfig type as
// the base type for the shared config
type SharedAwsConfig = Pick<
	CloudWatchClientConfig,
	'region' | 'credentials' | 'maxAttempts' | 'requestHandler'
>;

export const awsConfig: SharedAwsConfig = {
	region: AWS_REGION,
	credentials: CREDENTIAL_PROVIDER,
	maxAttempts: 0,
	requestHandler: new NodeHttpHandler({
		connectionTimeout: 500,
		socketTimeout: 250,
	}),
};
