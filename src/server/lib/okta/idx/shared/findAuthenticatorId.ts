import { selectAuthenticationAuthenticateSchema } from '../identify';
import { IntrospectRemediationNames, IntrospectResponse } from '../introspect';
import { authenticatorVerificationDataRemediationSchema } from '../recover';
import { Authenticators, selectAuthenticationEnrollSchema } from './schemas';

type Params = {
	response: IntrospectResponse; // all responses regardless of api call will overlap with the introspect response
	remediationName: Extract<
		IntrospectRemediationNames,
		| 'authenticator-verification-data'
		| 'select-authenticator-authenticate'
		| 'select-authenticator-enroll'
	>;
	authenticator: Authenticators;
};

/**
 * @name findAuthenticatorId
 * @description Find the authenticator id from a given response, remediation name, and authenticator type
 * @param response - The response object
 * @param remediationName - The remediation name
 * @param authenticator - The authenticator type - email or password
 * @returns string | undefined - The authenticator id
 */
export const findAuthenticatorId = ({
	response,
	remediationName,
	authenticator,
}: Params): string | undefined =>
	response.remediation.value
		.flatMap((remediation) => {
			// depending on the remediation name, the schema shape will be different
			// so we can't do the same check to get the id
			// instead we have to check which schema to use, and then attempt to get the authenticator id
			// depending on the authenticator type and schema

			// this is the schema where the remediation value is of selectAuthenticatorValueSchema type
			const selectAuthenticatorValueRemediation = (() => {
				switch (remediationName) {
					case 'select-authenticator-authenticate':
						return selectAuthenticationAuthenticateSchema.safeParse(
							remediation,
						);
					case 'select-authenticator-enroll':
						return selectAuthenticationEnrollSchema.safeParse(remediation);
					default:
						break;
				}
			})();

			// this is the schema where the remediation value is of authenticatorVerificationDataRemediationSchema type
			const authenticatorVerificationDataRemediation = (() => {
				switch (remediationName) {
					case 'authenticator-verification-data':
						return authenticatorVerificationDataRemediationSchema.safeParse(
							remediation,
						);
					default:
						break;
				}
			})();

			// if the remediation value is of selectAuthenticatorValueSchema type, we can get the authenticator id using this
			if (selectAuthenticatorValueRemediation?.success) {
				return selectAuthenticatorValueRemediation.data.value.flatMap(
					(value) => {
						if (value.name === 'authenticator') {
							return value.options.flatMap((option) => {
								if (option.label.toLowerCase() === authenticator) {
									if (
										option.value.form.value.some(
											(v) => v.value === authenticator,
										)
									) {
										return [
											option.value.form.value.find((v) => v.name === 'id')
												?.value,
										];
									}
								}
							});
						}
					},
				);
			}

			// if the remediation value is of authenticatorVerificationDataRemediationSchema type, we can get the authenticator id using this
			if (authenticatorVerificationDataRemediation?.success) {
				return authenticatorVerificationDataRemediation.data.value.flatMap(
					(value) => {
						if (
							value.name === 'authenticator' &&
							value.label.toLowerCase() === authenticator
						) {
							return value.form.value.find((v) => v.name === 'id')?.value;
						}
					},
				);
			}
		})
		.filter((id): id is string => typeof id === 'string' && id.length > 0)
		.at(0);
