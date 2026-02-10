import { GuEc2App } from '@guardian/cdk';
import { AccessScope } from '@guardian/cdk/lib/constants';
import { GuAlarm } from '@guardian/cdk/lib/constructs/cloudwatch';
import type { GuStackProps } from '@guardian/cdk/lib/constructs/core';
import {
	GuAnghammaradTopicParameter,
	GuStack,
	GuStringParameter,
	GuVpcParameter,
} from '@guardian/cdk/lib/constructs/core';
import { GuAllowPolicy } from '@guardian/cdk/lib/constructs/iam';
import type { GuAsgCapacity } from '@guardian/cdk/lib/types';
import { type App, Duration, Tags } from 'aws-cdk-lib';
import { ComparisonOperator, MathExpression, Metric, Unit } from 'aws-cdk-lib/aws-cloudwatch';
import { SnsAction } from 'aws-cdk-lib/aws-cloudwatch-actions';
import {
	InstanceClass,
	InstanceSize,
	InstanceType,
	Peer,
	SecurityGroup,
	UserData,
} from 'aws-cdk-lib/aws-ec2';
import { Topic } from 'aws-cdk-lib/aws-sns';
import { CfnInclude } from 'aws-cdk-lib/cloudformation-include';

type IdentityGatewayProps = GuStackProps & {
	scaling: GuAsgCapacity;
	domainName: string;
	config: {
		idapiBaseUrl: string;
		signInPageUrl: string;
		oauthBaseUrl: string;
		baseUri: string;
		defaultReturnUri: string;
		oktaOrgUrl: string;
		membersDataApiUrl: string;
	};
};

const alarmPriorities = {
	P1: 'CRITICAL Respond Immediately',
	P2: 'URGENT 9-5',
	P3: 'MODERATE'
} as const;

// Fetched from https://api.fastly.com/public-ip-list
// These are the IP ranges that Fastly uses to connect to the origin
// TODO: Is there a way we can automate the updating of these CIDR ranges when Fastly updates their IP list?
const fastlyCIDR = [
	Peer.ipv4('23.235.32.0/20'),
	Peer.ipv4('43.249.72.0/22'),
	Peer.ipv4('103.244.50.0/24'),
	Peer.ipv4('103.245.222.0/23'),
	Peer.ipv4('103.245.224.0/24'),
	Peer.ipv4('104.156.80.0/20'),
	Peer.ipv4('140.248.64.0/18'),
	Peer.ipv4('140.248.128.0/17'),
	Peer.ipv4('146.75.0.0/17'),
	Peer.ipv4('151.101.0.0/16'),
	Peer.ipv4('157.52.64.0/18'),
	Peer.ipv4('167.82.0.0/17'),
	Peer.ipv4('167.82.128.0/20'),
	Peer.ipv4('167.82.160.0/20'),
	Peer.ipv4('167.82.224.0/20'),
	Peer.ipv4('172.111.64.0/18'),
	Peer.ipv4('185.31.16.0/22'),
	Peer.ipv4('199.27.72.0/21'),
	Peer.ipv4('199.232.0.0/16'),
	Peer.ipv6('2a04:4e40::/32'),
	Peer.ipv6('2a04:4e42::/32'),
];

export class IdentityGateway extends GuStack {
	constructor(scope: App, id: string, props: IdentityGatewayProps) {
		super(scope, id, props);

		const app = 'identity-gateway';
		const {
			stack,
			stage,
			scaling,
			domainName,
			config: {
				idapiBaseUrl,
				signInPageUrl,
				oauthBaseUrl,
				baseUri,
				defaultReturnUri,
				oktaOrgUrl,
				membersDataApiUrl,
			},
		} = props;

		const artifactBucket = new GuStringParameter(
			this,
			'IdentityArtifactBucket',
			{},
		);

		const configBucket = new GuStringParameter(
			this,
			'IdentityConfigBucket',
			{},
		);

		const vpcId = GuVpcParameter.getInstance(this);

		const redisHost = new GuStringParameter(this, 'RedisHost', {
			default: `/${stack}/${app}/${stage}/redis-host`,
			fromSSM: true,
		});

		const redisSecurityGroupParam = new GuStringParameter(
			this,
			'RedisSecurityGroup',
			{
				default: `/${stage}/${stack}/redis-security-group`,
				fromSSM: true,
			},
		);

		const redisSecurityGroup = SecurityGroup.fromSecurityGroupId(
			this,
			'RedisSecurityGroupInstance',
			redisSecurityGroupParam.valueAsString,
			{ mutable: false },
		);

		new CfnInclude(this, 'IdentityGateway', {
			templateFile: '../cloudformation.yaml',
			parameters: {
				VpcId: vpcId.valueAsString,
				RedisHost: redisHost.valueAsString,
				IdentityArtifactBucket: artifactBucket.valueAsString,
				IdentityConfigBucket: configBucket.valueAsString,
			},
		});

		const alarmTopic = Topic.fromTopicArn(this, 'AlarmTopic', GuAnghammaradTopicParameter.getInstance(this).valueAsString);

		// Allow Gateway to read artefacts and configuration files from S3
		const bucketPolicy = new GuAllowPolicy(
			this,
			'IdentityGatewayS3ReadPolicy',
			{
				actions: ['s3:GetObject'],
				resources: [
					`arn:aws:s3:::${configBucket.valueAsString}/${stage}/${app}/*`,
					`arn:aws:s3:::${artifactBucket.valueAsString}/${stage}/${app}/*`,
				],
			},
		);

		// Allow Gateway to read configuration values from SSM Parameter Store
		const ssmPolicy = new GuAllowPolicy(this, 'IdentityGatewaySSMReadPolicy', {
			actions: ['ssm:GetParameter'],
			resources: [
				`arn:aws:ssm:${this.region}:${this.account}:parameter/${stack}/${app}/${stage}/*`,
			],
		});

		// Allow Gateway to send emails to readers
		const sesPolicy = new GuAllowPolicy(this, 'IdentityGatewaySESSendPolicy', {
			actions: ['ses:SendEmail'],
			resources: [`*`],
		});

		// Allow Gateway to publish Custom Metrics to Cloudwatch
		const pushMetricsPolicy = new GuAllowPolicy(this, 'IdentityGatewayCloudWatchPolicy', {
			actions: ["cloudwatch:PutMetricData"],
			resources: ["*"],
		});

		const userData = UserData.custom(`#!/bin/bash -ev

mkdir /etc/gu

# Get Riff Raff deployed artefact S3
aws s3 cp s3://${artifactBucket.valueAsString}/${stage}/${app}/${app}.zip /etc/gu
unzip -o /etc/gu/${app}.zip -d /etc/gu

# Get Rate Limiter configuration file
# Try multiple times to the config file. The s3 cp command can fail when called immediately on instance startup.
while true; do
	if \
		aws s3 cp s3://${configBucket.valueAsString}/${stage}/${app}/.ratelimit.json /etc/gu/.ratelimit.json
		then break
	fi
	sleep 1
done

# Setup user
groupadd ${app}
useradd -r -s /usr/bin/nologin -g ${app} ${app}
chown -R ${app}:${app} /etc/gu

# Setup logs
touch /var/log/${app}.log
chown ${app}:${app} /var/log/${app}.log

# Try multiple times to get parameter store values. The SSM command can fail when called immediately on instance startup.
while true; do
if \
	IDAPI_CLIENT_ACCESS_TOKEN=$(aws ssm get-parameter --name '/${stack}/${app}/${stage}/idapi-client-access-token' --with-decryption --region eu-west-1 --query="Parameter.Value" --output="text") && \
	APP_SECRET=$(aws ssm get-parameter --name '/${stack}/${app}/${stage}/appSecret' --with-decryption --region eu-west-1 --query="Parameter.Value" --output="text") && \
	GOOGLE_RECAPTCHA_SITE_KEY=$(aws ssm get-parameter --name '/${stack}/${app}/${stage}/recaptcha-site-key' --with-decryption --region eu-west-1 --query="Parameter.Value" --output="text") && \
	GOOGLE_RECAPTCHA_SECRET_KEY=$(aws ssm get-parameter --name '/${stack}/${app}/${stage}/recaptcha-secret-key' --with-decryption --region eu-west-1 --query="Parameter.Value" --output="text") && \
	REDIS_PASSWORD=$(aws ssm get-parameter --name '/${stack}/${app}/${stage}/redis-password' --with-decryption --region eu-west-1 --query="Parameter.Value" --output="text") && \
	ENCRYPTION_SECRET_KEY=$(aws ssm get-parameter --name '/${stack}/${app}/${stage}/encryption-secret-key' --with-decryption --region eu-west-1 --query="Parameter.Value" --output="text") && \
	OKTA_API_TOKEN=$(aws ssm get-parameter --name '/${stack}/${app}/${stage}/okta-api-token' --with-decryption --region eu-west-1 --query="Parameter.Value" --output="text") && \
	OKTA_CUSTOM_OAUTH_SERVER=$(aws ssm get-parameter --name '/${stack}/${app}/${stage}/oktaCustomOAuthServer' --with-decryption --region eu-west-1 --query="Parameter.Value" --output="text") && \
	OKTA_CLIENT_ID=$(aws ssm get-parameter --name '/${stack}/${app}/${stage}/oktaClientId' --with-decryption --region eu-west-1 --query="Parameter.Value" --output="text") && \
	OKTA_CLIENT_SECRET=$(aws ssm get-parameter --name '/${stack}/${app}/${stage}/oktaClientSecret' --with-decryption --region eu-west-1 --query="Parameter.Value" --output="text")
	OKTA_IDP_APPLE=$(aws ssm get-parameter --name '/${stack}/${app}/${stage}/oktaIdpApple' --with-decryption --region eu-west-1 --query="Parameter.Value" --output="text")
	OKTA_IDP_GOOGLE=$(aws ssm get-parameter --name '/${stack}/${app}/${stage}/oktaIdpGoogle' --with-decryption --region eu-west-1 --query="Parameter.Value" --output="text")
	OKTA_GUARDIAN_USERS_ALL_GROUP_ID=$(aws ssm get-parameter --name '/${stack}/${app}/${stage}/oktaGuardianUsersAllGroupId' --with-decryption --region eu-west-1 --query="Parameter.Value" --output="text")
	USER_BENEFITS_API_URL=$(aws ssm get-parameter --name '/${stack}/${app}/${stage}/user-benefits-api-url' --with-decryption --region eu-west-1 --query="Parameter.Value" --output="text")
	DELETE_ACCOUNT_STEP_FUNCTION_URL=$(aws ssm get-parameter --name '/${stack}/${app}/${stage}/deleteAccountStepFunctionUrl' --with-decryption --region eu-west-1 --query="Parameter.Value" --output="text")
	DELETE_ACCOUNT_STEP_FUNCTION_API_KEY=$(aws ssm get-parameter --name '/${stack}/${app}/${stage}/deleteAccountStepFunctionApiKey' --with-decryption --region eu-west-1 --query="Parameter.Value" --output="text")
	then break
fi

sleep 1
done

# systemd setup
cat > /etc/systemd/system/${app}.service <<EOL
[Service]
ExecStart=/bin/sh -ec '/usr/bin/node /etc/gu/server.js 2>&1'
Restart=always
StandardOutput=journal
StandardError=journal
SyslogIdentifier=${app}
User=${app}
Group=${app}
Environment=NODE_ENV=production
Environment=PORT=9233
Environment=IDAPI_CLIENT_ACCESS_TOKEN=$IDAPI_CLIENT_ACCESS_TOKEN
Environment=IDAPI_BASE_URL=${idapiBaseUrl}
Environment=SIGN_IN_PAGE_URL=${signInPageUrl}
Environment=OAUTH_BASE_URL=${oauthBaseUrl}
Environment=BASE_URI=${baseUri}
Environment=DEFAULT_RETURN_URI=${defaultReturnUri}
Environment=STAGE=${stage}
Environment=IS_HTTPS=true
Environment=APP_SECRET=$APP_SECRET
Environment=GOOGLE_RECAPTCHA_SITE_KEY=$GOOGLE_RECAPTCHA_SITE_KEY
Environment=GOOGLE_RECAPTCHA_SECRET_KEY=$GOOGLE_RECAPTCHA_SECRET_KEY
Environment=ENCRYPTION_SECRET_KEY=$ENCRYPTION_SECRET_KEY
Environment=OKTA_ORG_URL=${oktaOrgUrl}
Environment=OKTA_API_TOKEN=$OKTA_API_TOKEN
Environment=OKTA_CUSTOM_OAUTH_SERVER=$OKTA_CUSTOM_OAUTH_SERVER
Environment=OKTA_CLIENT_ID=$OKTA_CLIENT_ID
Environment=OKTA_CLIENT_SECRET=$OKTA_CLIENT_SECRET
Environment=OKTA_IDP_APPLE=$OKTA_IDP_APPLE
Environment=OKTA_IDP_GOOGLE=$OKTA_IDP_GOOGLE
Environment=OKTA_GUARDIAN_USERS_ALL_GROUP_ID=$OKTA_GUARDIAN_USERS_ALL_GROUP_ID            
Environment=REDIS_PASSWORD=$REDIS_PASSWORD
Environment=REDIS_HOST=${redisHost.valueAsString}
Environment=REDIS_SSL_ON=true
Environment=MEMBERS_DATA_API_URL=${membersDataApiUrl}
Environment=USER_BENEFITS_API_URL=$USER_BENEFITS_API_URL
Environment=DELETE_ACCOUNT_STEP_FUNCTION_URL=$DELETE_ACCOUNT_STEP_FUNCTION_URL
Environment=DELETE_ACCOUNT_STEP_FUNCTION_API_KEY=$DELETE_ACCOUNT_STEP_FUNCTION_API_KEY

[Install]
WantedBy=multi-user.target
EOL

systemctl enable ${app}
systemctl start ${app}
		`);

		const nodeApp = new GuEc2App(this, {
			userData,
			access: {
				scope: AccessScope.RESTRICTED,
				cidrRanges: [...fastlyCIDR],
			},
			monitoringConfiguration:
				stage === 'PROD'
					? {
							snsTopicName: alarmTopic.topicArn,
							http5xxAlarm: {
								tolerated5xxPercentage: 0.05,
							},
							http4xxAlarm: {
								tolerated4xxPercentage: 0.05,
							},
							unhealthyInstancesAlarm: true,
						}
					: { noMonitoring: true },
			instanceType: InstanceType.of(InstanceClass.T4G, InstanceSize.SMALL),
			scaling,
			instanceMetricGranularity: '1Minute',
			app,
			certificateProps: {
				domainName,
			},
			imageRecipe: 'gateway-arm64',
			applicationPort: 9233,
			applicationLogging: {
				enabled: true,
			},
			roleConfiguration: {
				additionalPolicies: [bucketPolicy, ssmPolicy, sesPolicy, pushMetricsPolicy],
			},
		});

		// TODO: Remove this tag once the ASG is migrated to CDK.
		// This is required or else Riff Raff panics when it identifies more than
		// one ASG with the same Stack, Stage, App tags.
		Tags.of(nodeApp.autoScalingGroup).add('gu:riffraff:new-asg', 'true');

		nodeApp.autoScalingGroup.connections.addSecurityGroup(redisSecurityGroup);
		nodeApp.autoScalingGroup.scaleOnCpuUtilization('CpuScalingPolicy', {
			targetUtilizationPercent: 10
		});

		///
		/// Custom Alarms
		/// We have some custom alarms that we want to create that aren't covered by the default alarms provided by GuEc2App.
		/// These test various app specific functionality such as OAuth2 flows.
		///

		// Alert us if for some reason we're not seeing any sign-ins
		const signInInactivityAlarm = new GuAlarm(this, 'SignInInactivityAlarm', {
			snsTopicName: alarmTopic.topicArn,
			alarmName: `${alarmPriorities.P1} - ${app} ${stage} has had no new sign-ins in the last 20 minutes`,
			alarmDescription: 'No one has successfully signed ins in the last 20 minutes.',
			metric: new MathExpression({
				expression: 'oktaSignInCount + oktaIdxSignInCount',
				usingMetrics: {
					'oktaSignInCount': new Metric({
						namespace: 'Gateway',
						metricName: 'OktaSignIn::Success',
						dimensionsMap: {
							Stage: stage,
							ApiMode: app
						},
						period: Duration.minutes(20),
						statistic: 'Sum',
						unit: Unit.COUNT
					}),
					'oktaIdxSignInCount': new Metric({
						namespace: 'Gateway',
						metricName: 'OktaIdxSignIn::Success',
						dimensionsMap: {
							Stage: stage,
							ApiMode: app
						},
						period: Duration.minutes(20),
						statistic: 'Sum',
						unit: Unit.COUNT
					})
				}
			}),
			comparisonOperator: ComparisonOperator.LESS_THAN_THRESHOLD,
			threshold: 1,
			evaluationPeriods: 1,
			app,
			actionsEnabled: stage === 'PROD'
		});
		signInInactivityAlarm.addInsufficientDataAction(new SnsAction(alarmTopic));

		const registerInactivityAlarm = new GuAlarm(this, 'RegisterInactivityAlarm', {
			snsTopicName: alarmTopic.topicArn,
			alarmName: `${alarmPriorities.P1} - ${app} ${stage} has had no new registrations in the last hour`,
			alarmDescription: 'No one has successfully registered in the last hour.',
			metric: new MathExpression({
				expression: 'oktaIdxRegistrationCount + oktaRegistrationCount',
				usingMetrics: {
					'oktaRegistrationCount': new Metric({
						namespace: 'Gateway',
						metricName: 'OktaRegister::Success',
						dimensionsMap: {
							Stage: stage,
							ApiMode: app
						},
						period: Duration.hours(1),
						statistic: 'Sum',
						unit: Unit.COUNT
					}),
					'oktaIdxRegistrationCount': new Metric({
						namespace: 'Gateway',
						metricName: 'OktaIDXRegister::Success',
						dimensionsMap: {
							Stage: stage,
							ApiMode: app
						},
						period: Duration.hours(1),
						statistic: 'Sum',
						unit: Unit.COUNT
					})
				}
			}),
			comparisonOperator: ComparisonOperator.LESS_THAN_THRESHOLD,
			threshold: 1,
			evaluationPeriods: 1,
			app,
			actionsEnabled: stage === 'PROD'
		});
		registerInactivityAlarm.addInsufficientDataAction(new SnsAction(alarmTopic));

		const oauthAuthenticationCallbackInactivityAlarm = new GuAlarm(this, 'OauthAuthenticationCallbackInactivityAlarm', {
			snsTopicName: alarmTopic.topicArn,
			alarmName: `${alarmPriorities.P1} - ${app} ${stage} has had no success OAuth Authorization code flow callbacks for Authentication in the last 20 minutes`,
			alarmDescription: 'No one has successfully completed OAuth Authorization code flow callbacks for Authentication in the last 20 minutes.',
			metric: new Metric({
				namespace: 'Gateway',
				metricName: 'OAuthAuthenticationCallback::Success',
				dimensionsMap: {
					Stage: stage,
					ApiMode: app
				},
				period: Duration.minutes(20),
				statistic: 'Sum',
				unit: Unit.COUNT
			}),
			comparisonOperator: ComparisonOperator.LESS_THAN_THRESHOLD,
			threshold: 1,
			evaluationPeriods: 1,
			app,
			actionsEnabled: stage === 'PROD'
		});
		oauthAuthenticationCallbackInactivityAlarm.addInsufficientDataAction(new SnsAction(alarmTopic));

		const oauthApplicationInactivityAlarm = new GuAlarm(this, 'OAuthApplicationCallbackInactivityAlarm', {
			snsTopicName: alarmTopic.topicArn,
			alarmName: `${alarmPriorities.P1} - ${app} ${stage} has had no success OAuth Authorization code flow callbacks for internal Gateway routes in the last 1 hour`,
			alarmDescription: 'No one has successfully completed OAuth Authorization code flow callbacks for internal Gateway routes in the last 1 hour.',
			metric: new Metric({
				namespace: 'Gateway',
				metricName: 'OAuthApplicationCallback::Success',
				dimensionsMap: {
					Stage: stage,
					ApiMode: app
				},
				period: Duration.hours(1),
				statistic: 'Sum',
				unit: Unit.COUNT
			}),
			comparisonOperator: ComparisonOperator.LESS_THAN_THRESHOLD,
			threshold: 1,
			evaluationPeriods: 1,
			app,
			actionsEnabled: stage === 'PROD'
		});
		oauthApplicationInactivityAlarm.addInsufficientDataAction(new SnsAction(alarmTopic));

		const deletionInactivityAlarm = new GuAlarm(this, 'DeletionInactivityAlarm', {
			snsTopicName: alarmTopic.topicArn,
			alarmName: `${alarmPriorities.P2} - ${app} ${stage} has had no success self service user deletion in the last 6 hours`,
			alarmDescription: ' No one has successfully deleted their account in the last 6 hours.',
			metric: new Metric({
				namespace: 'Gateway',
				metricName: 'OAuthDeleteCallback::Success',
				dimensionsMap: {
					Stage: stage,
					ApiMode: app
				},
				period: Duration.hours(6),
				statistic: 'Sum',
				unit: Unit.COUNT
			}),
			comparisonOperator: ComparisonOperator.LESS_THAN_THRESHOLD,
			threshold: 1,
			evaluationPeriods: 1,
			app,
			actionsEnabled: stage === 'PROD'
		});
		deletionInactivityAlarm.addInsufficientDataAction(new SnsAction(alarmTopic));

		const unsubscribeAllInactivityAlarm = new GuAlarm(this, 'UnsubscribeAllInactivityAlarm', {
			snsTopicName: alarmTopic.topicArn,
			alarmName: `${alarmPriorities.P2} - ${app} ${stage} has had successful no unsubscribe all from email clients in the last hour`,
			alarmDescription: 'No one has successfully unsubscribed all from email clients in the last hour.',
			metric: new Metric({
				namespace: 'Gateway',
				metricName: 'UnsubscribeAll::Success',
				dimensionsMap: {
					Stage: stage,
					ApiMode: app
				},
				period: Duration.hours(1),
				statistic: 'Sum',
				unit: Unit.COUNT
			}),
			comparisonOperator: ComparisonOperator.LESS_THAN_THRESHOLD,
			threshold: 1,
			evaluationPeriods: 1,
			app,
			actionsEnabled: stage === 'PROD'
		});
		unsubscribeAllInactivityAlarm.addInsufficientDataAction(new SnsAction(alarmTopic));
	}
}
