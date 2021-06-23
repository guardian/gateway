import * as AWS from 'aws-sdk';

const AWS_REGION = 'eu-west-1';
const PROFILE = 'identity';

const CREDENTIAL_PROVIDER = new AWS.CredentialProviderChain([
  () => new AWS.SharedIniFileCredentials({ profile: PROFILE }),
  ...AWS.CredentialProviderChain.defaultProviders,
]);

export const awsConfig = {
  region: AWS_REGION,
  credentialProvider: CREDENTIAL_PROVIDER,
};
