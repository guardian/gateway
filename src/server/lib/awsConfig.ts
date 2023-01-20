import {
  ConfigurationOptions,
  CredentialProviderChain,
  SharedIniFileCredentials,
} from 'aws-sdk';

const AWS_REGION = 'eu-west-1';
const PROFILE = 'identity';

const CREDENTIAL_PROVIDER = new CredentialProviderChain([
  () => new SharedIniFileCredentials({ profile: PROFILE }),
  ...CredentialProviderChain.defaultProviders,
]);

export const awsConfig: ConfigurationOptions = {
  region: AWS_REGION,
  credentialProvider: CREDENTIAL_PROVIDER,
  maxRetries: 0,
  httpOptions: {
    connectTimeout: 500,
    timeout: 250,
  },
};
