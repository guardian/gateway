import { GuEc2App } from '@guardian/cdk';
import { AccessScope } from '@guardian/cdk/lib/constants';
import type { GuStackProps } from '@guardian/cdk/lib/constructs/core';
import {
	GuDistributionBucketParameter,
	GuParameter,
	GuStack,
} from '@guardian/cdk/lib/constructs/core';
import { GuRole } from '@guardian/cdk/lib/constructs/iam';
import type { GuAsgCapacity } from '@guardian/cdk/lib/types';
import { type App, Duration } from 'aws-cdk-lib';
import { CfnScalingPolicy } from 'aws-cdk-lib/aws-autoscaling';
import type { MetricProps } from 'aws-cdk-lib/aws-cloudwatch';
import {
	ComparisonOperator,
	MathExpression,
	Metric,
	TreatMissingData,
	Unit,
} from 'aws-cdk-lib/aws-cloudwatch';
import { SnsAction } from 'aws-cdk-lib/aws-cloudwatch-actions';
import {
	InstanceClass,
	InstanceSize,
	InstanceType,
	UserData,
} from 'aws-cdk-lib/aws-ec2';
import type { CfnLoadBalancer } from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import {
	HttpCodeElb,
	HttpCodeTarget,
} from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import {
	type CfnRole,
	Effect,
	PolicyDocument,
	PolicyStatement,
	WebIdentityPrincipal,
} from 'aws-cdk-lib/aws-iam';
import { Topic } from 'aws-cdk-lib/aws-sns';
import { EmailSubscription } from 'aws-cdk-lib/aws-sns-subscriptions';

const gatewayMetric = (
	props: Omit<MetricProps, 'namespace'> & { stage: string },
) =>
	new Metric({
		...props,
		namespace: 'Gateway',
		dimensionsMap: {
			Stage: props.stage,
			ApiMode: 'identity-gateway',
		},
	});

type IdentityGatewayProps = {
	baseUri: string;
	defaultReturnUri: string;
	scaling: GuAsgCapacity;
} & GuStackProps;

export class IdentityGateway extends GuStack {
	constructor(scope: App, id: string, props: IdentityGatewayProps) {
		super(scope, id, props);

		const { stack, stage, baseUri, defaultReturnUri, scaling } = props;
		const app = 'identity-gateway';
		const applicationPort = 9233;

		const distributionBucket = GuDistributionBucketParameter.getInstance(this);
		// A little hacky. Identity currently has 2 distribution buckets and unfortunately Gateway doesn't use the
		// correct one, override the default account distribution bucket here.
		distributionBucket.default = '/account/services/identity.artifact.bucket';

		const identityConfigBucket = new GuParameter(this, 'IdentityConfigBucket', {
			description: 'S3 Bucket to read identity config from',
		});

		const idapiBaseUrl = new GuParameter(this, 'IdapiBaseUrl', {
			description: 'The base url for idapi',
			default: `/${stack}/${app}/${stage}/idapi-base-url`,
			fromSSM: true,
		});
		const signInPageUrl = new GuParameter(this, 'SignInPageUrl', {
			description:
				'Sign in page URL used as a fallback if auth redirect retrieval fails.',
			default: `/${stack}/${app}/${stage}/sign-in-url`,
			fromSSM: true,
		});
		const oauthBaseUrl = new GuParameter(this, 'OauthBaseUrl', {
			description: 'The base url for social sign-in with google or apple',
			default: `/${stack}/${app}/${stage}/oauth-base-url`,
			fromSSM: true,
		});
		const oktaOrgUrl = new GuParameter(this, 'OktaOrgUrl', {
			description: 'The org url for interacting with okta APIs',
			default: `/${stack}/${app}/${stage}/okta-org-url`,
			fromSSM: true,
		});
		const sentryDsn = new GuParameter(this, 'SentryDsn', {
			description: 'Public data source name for us to send Sentry logs to',
			default: `/${stack}/${app}/${stage}/sentryDsn`,
			fromSSM: true,
		});
		const redisHost = new GuParameter(this, 'RedisHost', {
			description: 'The Redis server URL, used for rate limiting.',
			default: `/${stack}/${app}/${stage}/redis-host`,
			fromSSM: true,
		});
		const membersDataApiUrl = new GuParameter(this, 'MembersDataApiUrl', {
			description: 'The url for members-data-api',
			default: `/${stack}/${app}/${stage}/members-data-api-url`,
			fromSSM: true,
		});
		const alarmEmailAddress = new GuParameter(this, 'AlarmEmailAddress', {
			description: 'Email address to send CloudWatch alerts',
		});

		const snsTopic = new Topic(this, 'SendEmailToIdentityDev', {
			displayName: 'SendEmailToIdentityDev',
		});
		snsTopic.addSubscription(
			new EmailSubscription(alarmEmailAddress.valueAsString),
		);

		// SNS Topics are stateful and we don't want Cloudformation to recreate this Topic post moving to GuCDK
		(snsTopic.node.defaultChild as CfnLoadBalancer).overrideLogicalId(
			'TopicSendEmail',
		);

		const userData = UserData.forLinux({});
		userData.addCommands(`
      mkdir /etc/gu

      # Get Riff Raff deployed artefact S3
      aws s3 cp s3://${distributionBucket.valueAsString}/${stage}/${app}/${app}.zip /etc/gu
      unzip -o /etc/gu/${app}.zip -d /etc/gu

      # Get Rate Limiter configuration file
      # Try multiple times to the config file. The s3 cp command can fail when called immediately on instance startup.
      while true; do
        if \
          aws s3 cp s3://${identityConfigBucket.valueAsString}/${stage}/${app}/.ratelimit.json /etc/gu/.ratelimit.json
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
      Environment=PORT=${applicationPort}
      Environment=IDAPI_CLIENT_ACCESS_TOKEN=$IDAPI_CLIENT_ACCESS_TOKEN
      Environment=IDAPI_BASE_URL=${idapiBaseUrl.valueAsString}
      Environment=SIGN_IN_PAGE_URL=${signInPageUrl.valueAsString}
      Environment=OAUTH_BASE_URL=${oauthBaseUrl.valueAsString}
      Environment=BASE_URI=${baseUri}
      Environment=DEFAULT_RETURN_URI=${defaultReturnUri}
      Environment=STAGE=${stage}
      Environment=IS_HTTPS=true
      Environment=APP_SECRET=$APP_SECRET
      Environment=GOOGLE_RECAPTCHA_SITE_KEY=$GOOGLE_RECAPTCHA_SITE_KEY
      Environment=GOOGLE_RECAPTCHA_SECRET_KEY=$GOOGLE_RECAPTCHA_SECRET_KEY
      Environment=ENCRYPTION_SECRET_KEY=$ENCRYPTION_SECRET_KEY
      Environment=OKTA_ORG_URL=${oktaOrgUrl.valueAsString}
      Environment=OKTA_API_TOKEN=$OKTA_API_TOKEN
      Environment=OKTA_CUSTOM_OAUTH_SERVER=$OKTA_CUSTOM_OAUTH_SERVER
      Environment=OKTA_CLIENT_ID=$OKTA_CLIENT_ID
      Environment=OKTA_CLIENT_SECRET=$OKTA_CLIENT_SECRET
      Environment=OKTA_IDP_APPLE=$OKTA_IDP_APPLE
      Environment=OKTA_IDP_GOOGLE=$OKTA_IDP_GOOGLE
      Environment=OKTA_GUARDIAN_USERS_ALL_GROUP_ID=$OKTA_GUARDIAN_USERS_ALL_GROUP_ID            
      Environment=SENTRY_DSN=${sentryDsn.valueAsString}
      Environment=REDIS_PASSWORD=$REDIS_PASSWORD
      Environment=REDIS_HOST=${redisHost.valueAsString}
      Environment=REDIS_SSL_ON=true
      Environment=MEMBERS_DATA_API_URL=${membersDataApiUrl.valueAsString}
      Environment=DELETE_ACCOUNT_STEP_FUNCTION_URL=$DELETE_ACCOUNT_STEP_FUNCTION_URL
      Environment=DELETE_ACCOUNT_STEP_FUNCTION_API_KEY=$DELETE_ACCOUNT_STEP_FUNCTION_API_KEY

      [Install]
      WantedBy=multi-user.target
      EOL

      systemctl enable ${app}
      systemctl start ${app}`);

		const gatewayApp = new GuEc2App(this, {
			app,
			userData,
			imageRecipe: 'gateway-arm64',
			applicationPort: applicationPort,
			access: {
				scope: AccessScope.PUBLIC,
			},
			monitoringConfiguration: {
				// We use our own alarm stack
				noMonitoring: true,
			},
			applicationLogging: {
				enabled: true,
			},
			accessLogging: {
				enabled: true,
				prefix: `ELBLogs/${stage}/${app}/${stage}`,
			},
			healthcheck: {
				enabled: true,
				path: '/healthcheck',
				port: `${applicationPort}`,
				healthyThresholdCount: 2,
			},
			instanceType: InstanceType.of(InstanceClass.T4G, InstanceSize.SMALL),
			scaling,
		});

		gatewayApp.autoScalingGroup.addToRolePolicy(
			new PolicyStatement({
				effect: Effect.ALLOW,
				actions: ['ses:SendEmail'],
				resources: ['*'],
			}),
		);

		// Load balancers are stateful and we don't want Cloudformation to recreate this ALB post moving to GuCDK
		const cfnLoadBalancer = gatewayApp.loadBalancer.node
			.defaultChild as CfnLoadBalancer;
		cfnLoadBalancer.overrideLogicalId('LoadBalancer');
		cfnLoadBalancer.addPropertyOverride('Name', `${stack}-${app}-${stage}`);
		// These properties weren't set and had the default values before but CDK sets them explicitly to the default values.
		// Despite the fact that these properties technically haven't changed Cloudformation will still try to update them, which requires recreating the LoadBalancer,
		// therefore we un-set them here to prevent this.
		cfnLoadBalancer.addPropertyDeletionOverride('Type');
		cfnLoadBalancer.addPropertyDeletionOverride('Scheme');

		if (stage === 'PROD' || stage === 'TEST') {
			const scaleUpPolicy = new CfnScalingPolicy(this, 'ScaleUpPolicy', {
				autoScalingGroupName: gatewayApp.autoScalingGroup.autoScalingGroupName,
				policyType: 'SimpleScaling',
				scalingAdjustment: 1,
				cooldown: Duration.minutes(5).toSeconds().toString(),
			});

			const scaleDownPolicy = new CfnScalingPolicy(this, 'ScaleDownPolicy', {
				autoScalingGroupName: gatewayApp.autoScalingGroup.autoScalingGroupName,
				policyType: 'SimpleScaling',
				scalingAdjustment: -1,
				cooldown: Duration.minutes(30).toSeconds().toString(),
			});

			const alarmHighLatencyScaling = gatewayApp.loadBalancer.metrics
				.targetResponseTime({
					period: Duration.minutes(1),
				})
				.createAlarm(this, 'AlarmHighLatencyScaling', {
					alarmName: `MODERATE - ${app}-${stage} high load balancer latency scaling`,
					alarmDescription: `Scale-Up if latency is greater than 0.5 seconds over last 60 seconds`,
					threshold: 0.5,
					evaluationPeriods: 1,
				});

			// TODO: Switch to a StepScaling policy which has better CDK support, and allows for more complex scaling policies
			(
				alarmHighLatencyScaling.node.defaultChild as CfnScalingPolicy
			).addPropertyOverride('AlarmActions', scaleUpPolicy.ref);
			(
				alarmHighLatencyScaling.node.defaultChild as CfnScalingPolicy
			).addPropertyOverride('OKAction', scaleDownPolicy.ref);

			const alarmHighLatency = gatewayApp.loadBalancer.metrics
				.targetResponseTime({ period: Duration.minutes(1) })
				.createAlarm(this, 'AlarmHighLatency', {
					threshold: 0.5,
					evaluationPeriods: 5,
					alarmName: `MODERATE - ${app}-${stage} high load balancer latency`,
					alarmDescription: `Latency is greater than 0.5 seconds over 60 seconds for last 5 periods`,
				});

			alarmHighLatency.addAlarmAction(new SnsAction(snsTopic));
			alarmHighLatency.addInsufficientDataAction(new SnsAction(snsTopic));

			const alarmNoHealthyHosts = gatewayApp.targetGroup.metrics
				.healthyHostCount({ period: Duration.minutes(1) })
				.createAlarm(this, 'AlarmNoHealthyHosts', {
					comparisonOperator: ComparisonOperator.LESS_THAN_THRESHOLD,
					threshold: scaling.minimumInstances,
					evaluationPeriods: 1,
					alarmName: `MODERATE - ${app}-${stage} insufficient healthy hosts`,
					alarmDescription: `There are insufficient healthy hosts`,
				});

			alarmNoHealthyHosts.addAlarmAction(new SnsAction(snsTopic));
			alarmNoHealthyHosts.addInsufficientDataAction(new SnsAction(snsTopic));
			alarmNoHealthyHosts.addOkAction(new SnsAction(snsTopic));

			const alarm5XXSustained = new MathExpression({
				expression: 'backend5XXCount + elb5XXCount',
				period: Duration.minutes(1),
				usingMetrics: {
					backend5XXCount: gatewayApp.targetGroup.metrics.httpCodeTarget(
						HttpCodeTarget.TARGET_5XX_COUNT,
						{
							unit: Unit.COUNT,
						},
					),
					elb5XXCount: gatewayApp.loadBalancer.metrics.httpCodeElb(
						HttpCodeElb.ELB_5XX_COUNT,
						{ unit: Unit.COUNT },
					),
				},
			}).createAlarm(this, 'Alarm5XXSustained', {
				alarmName: `URGENT 9-5 - ${app}-${stage} sustained 5xx errors`,
				alarmDescription: `Sustained server errors detected`,
				threshold: 15,
				evaluationPeriods: 5,
				comparisonOperator:
					ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
				treatMissingData: TreatMissingData.NOT_BREACHING,
			});

			alarm5XXSustained.addAlarmAction(new SnsAction(snsTopic));
			alarm5XXSustained.addInsufficientDataAction(new SnsAction(snsTopic));
			alarm5XXSustained.addOkAction(new SnsAction(snsTopic));

			const alarmSigninInactivity = new MathExpression({
				expression: 'oktaSignInCount + oktaIdxSignInCount',
				period: Duration.minutes(20),
				usingMetrics: {
					oktaSignInCount: gatewayMetric({
						stage,
						metricName: 'OktaSignIn::Success',
						statistic: 'Sum',
						unit: Unit.COUNT,
					}),
					oktaIdxSignInCount: gatewayMetric({
						stage,
						metricName: 'OktaIdxSignIn::Success',
						statistic: 'Sum',
						unit: Unit.COUNT,
					}),
				},
			}).createAlarm(this, 'AlarmSigninInactivity', {
				alarmName: `CRITICAL Respond Immediately - ${app}-${stage} has had no new sign-ins in the last 20 minutes`,
				alarmDescription: `Sustained server errors detected`,
				threshold: 1,
				evaluationPeriods: 1,
				comparisonOperator: ComparisonOperator.LESS_THAN_THRESHOLD,
			});

			alarmSigninInactivity.addAlarmAction(new SnsAction(snsTopic));
			alarmSigninInactivity.addInsufficientDataAction(new SnsAction(snsTopic));

			const alarmRegisterInactivity = new MathExpression({
				expression: 'oktaRegistrationCount + oktaIdxRegistrationCount',
				period: Duration.hours(1),
				usingMetrics: {
					oktaRegistrationCount: gatewayMetric({
						stage,
						metricName: 'OktaRegistration::Success',
						statistic: 'Sum',
						unit: Unit.COUNT,
					}),
					oktaIdxRegistrationCount: gatewayMetric({
						stage,
						metricName: 'OktaIDXRegister::Success',
						statistic: 'Sum',
						unit: Unit.COUNT,
					}),
				},
			}).createAlarm(this, 'AlarmRegisterInactivity', {
				alarmName: `CRITICAL Respond Immediately - ${app}-${stage} has had no new registrations in the last hour`,
				alarmDescription: `No one has successfully registered in the last hour.`,
				threshold: 1,
				evaluationPeriods: 1,
				comparisonOperator: ComparisonOperator.LESS_THAN_THRESHOLD,
			});

			alarmRegisterInactivity.addAlarmAction(new SnsAction(snsTopic));
			alarmRegisterInactivity.addInsufficientDataAction(
				new SnsAction(snsTopic),
			);

			const alarmOAuthAuthenticationCallbackInactivity = gatewayMetric({
				stage,
				metricName: 'OAuthAuthenticationCallback::Success',
				period: Duration.minutes(20),
				statistic: 'Sum',
				unit: Unit.COUNT,
			}).createAlarm(this, 'AlarmOAuthAuthenticationCallbackInactivity', {
				alarmName: `CRITICAL Respond Immediately - ${app}-${stage} has had no success OAuth Authorization code flow callbacks for Authentication in the last 20 minutes`,
				alarmDescription: `No one has successfully completed OAuth Authorization code flow callbacks for Authentication in the last 20 minutes.`,
				threshold: 1,
				evaluationPeriods: 1,
				comparisonOperator: ComparisonOperator.LESS_THAN_THRESHOLD,
			});

			alarmOAuthAuthenticationCallbackInactivity.addAlarmAction(
				new SnsAction(snsTopic),
			);
			alarmOAuthAuthenticationCallbackInactivity.addInsufficientDataAction(
				new SnsAction(snsTopic),
			);

			const alarmOAuthApplicationCallbackInactivity = gatewayMetric({
				stage,
				metricName: 'OAuthApplicationCallback::Success',
				period: Duration.hours(1),
				statistic: 'Sum',
				unit: Unit.COUNT,
			}).createAlarm(this, 'AlarmOAuthApplicationCallbackInactivity', {
				alarmName: `CRITICAL Respond Immediately - ${app}-${stage} has had no success OAuth Authorization code flow callbacks for internal Gateway routes in the last 1 hour`,
				alarmDescription: `No one has successfully completed OAuth Authorization code flow callbacks for internal Gateway routes in the last 1 hour.`,
				threshold: 1,
				evaluationPeriods: 1,
				comparisonOperator: ComparisonOperator.LESS_THAN_THRESHOLD,
			});

			alarmOAuthApplicationCallbackInactivity.addAlarmAction(
				new SnsAction(snsTopic),
			);
			alarmOAuthApplicationCallbackInactivity.addInsufficientDataAction(
				new SnsAction(snsTopic),
			);

			const alarmDeletionInactivity = gatewayMetric({
				stage,
				metricName: 'OAuthDeleteCallback::Success',
				period: Duration.hours(6),
				statistic: 'Sum',
				unit: Unit.COUNT,
			}).createAlarm(this, 'AlarmDeletionInactivity', {
				alarmName: `URGENT 9-5 - ${app}-${stage}  has had no success self service user deletion in the last 6 hours`,
				alarmDescription: `No one has successfully deleted their account in the last 6 hours.`,
				threshold: 1,
				evaluationPeriods: 1,
				comparisonOperator: ComparisonOperator.LESS_THAN_THRESHOLD,
			});

			alarmDeletionInactivity.addAlarmAction(new SnsAction(snsTopic));
			alarmDeletionInactivity.addInsufficientDataAction(
				new SnsAction(snsTopic),
			);

			const alarmUnsubscribeAllInactivity = gatewayMetric({
				stage,
				metricName: 'UnsubscribeAll::Success',
				period: Duration.hours(1),
				statistic: 'Sum',
				unit: Unit.COUNT,
			}).createAlarm(this, 'AlarmUnsubscribeAllInactivity', {
				alarmName: `URGENT 9-5 - ${app}-${stage} has had successful no unsubscribe all from email clients in the last hour`,
				alarmDescription: `No one has successfully unsubscribed all from email clients in the last hour.`,
				threshold: 1,
				evaluationPeriods: 1,
				comparisonOperator: ComparisonOperator.LESS_THAN_THRESHOLD,
			});

			alarmUnsubscribeAllInactivity.addAlarmAction(new SnsAction(snsTopic));
			alarmUnsubscribeAllInactivity.addInsufficientDataAction(
				new SnsAction(snsTopic),
			);
		}

		if (stage === 'CODE' || stage === 'TEST') {
			const role = new GuRole(this, 'GithubActionsSESSendEmailsRole', {
				roleName: 'GithubActionsSESSendEmailsRole',
				assumedBy: new WebIdentityPrincipal(
					`arn:aws:iam::${this.account}:oidc-provider/token.actions.githubusercontent.com`,
					{
						StringLike: {
							'token.actions.githubusercontent.com:sub':
								'repo:guardian/gateway:*',
						},
					},
				),
				inlinePolicies: {
					SendEmailSES: new PolicyDocument({
						statements: [
							new PolicyStatement({
								effect: Effect.ALLOW,
								actions: ['ses:SendEmail'],
								resources: ['*'],
							}),
						],
					}),
				},
			});

			// Cloudformation will fail to re-create this role as Role Names must be unique, and the Pre-CDK role wont be deleted
			// until AFTER the new one is successfully created. By overriding the logical ID we ensure Cloudformation updates
			// the old role instead of creating a new one.
			// This is a temporary solution, at some point we should update our tests to use a new role name.
			(role.node.defaultChild as CfnRole).overrideLogicalId(
				'GithubActionsSESSendEmailsRole',
			);
		}
	}
}
