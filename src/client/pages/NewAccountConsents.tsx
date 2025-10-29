import React, { useRef } from 'react';
import { MainForm } from '@/client/components/MainForm';
import { buildUrlWithQueryParams } from '@/shared/lib/routeUtils';
import { usePageLoadOphanInteraction } from '@/client/lib/hooks/usePageLoadOphanInteraction';
import { RegistrationProps } from '@/client/pages/Registration';
import { GeoLocation } from '@/shared/model/Geolocation';
import { registrationFormSubmitOphanTracking } from '@/client/lib/consentsTracking';
import { RegistrationConsents } from '@/client/components/RegistrationConsents';
import { AppName } from '@/shared/lib/appNameUtils';
import { newsletterAdditionalTerms } from '@/shared/model/Newsletter';
import { MinimalLayout } from '@/client/layouts/MinimalLayout';
import { MainBodyText } from '@/client/components/MainBodyText';
import ThemedLink from '@/client/components/ThemedLink';
import locations from '@/shared/lib/locations';
import { SUPPORT_EMAIL } from '@/shared/model/Configuration';
import { PasscodeErrors } from '@/shared/model/Errors';
import useClientState from '../lib/hooks/useClientState';
import { getRegistrationConsentsList } from '@/shared/model/Consent';

type NewAccountConsentsProps = RegistrationProps & {
	geolocation?: GeoLocation;
	appName?: AppName;
	shortRequestId?: string;
	pageError?: string;
};

const getErrorContext = (pageError?: string) => {
	if (pageError === PasscodeErrors.PASSCODE_EXPIRED) {
		return (
			<>
				<div>
					Please request a new verification code to create your account.
				</div>
				<br />
				<div>
					If you are still having trouble, please contact our customer service
					team at{' '}
					<ThemedLink href={locations.SUPPORT_EMAIL_MAILTO}>
						{SUPPORT_EMAIL}
					</ThemedLink>
					.
				</div>
			</>
		);
	}
};

export const NewAccountConsents = ({
	email,
	recaptchaSiteKey,
	queryParams,
	formError,
	geolocation,
	appName,
	shortRequestId,
	pageError,
}: NewAccountConsentsProps) => {
	const formTrackingName = 'register';

	const formRef = useRef(null);
	const formSubmitMethodRef = useRef(null);

	usePageLoadOphanInteraction(formTrackingName);

	const isJobs = queryParams.clientId === 'jobs';
	const clientState = useClientState();
	const consentList = getRegistrationConsentsList(
		isJobs ?? false,
		geolocation,
		appName,
	);

	const handleConsentChange = async () => {
		try {
			const csrfToken = clientState.csrf?.token;
			if (!csrfToken) {
				throw new Error('missing CSRF token for consent update fetch request');
			}

			const formEl = formRef.current as HTMLFormElement | null;
			if (!formEl) {
				throw new Error('error, could not locate existing consents form');
			}
			const formData = new FormData(formEl);

			const requestFormData = new URLSearchParams();
			requestFormData.append('_csrf', csrfToken);
			Array.from(formData.entries()).forEach((formDataEntry) => {
				const formDataEntryExistsInConsentsList = consentList.findIndex(
					(consent) => consent.id === formDataEntry[0],
				);
				if (formDataEntryExistsInConsentsList !== -1) {
					requestFormData.append(formDataEntry[0], 'on');
				}
			});
			const response = await fetch('/welcome/submit-consent', {
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded',
				},
				method: 'POST',
				credentials: 'include',
				body: requestFormData.toString(),
			});
			if (!response.ok) {
				throw new Error('response status error');
			}
		} catch {
			// the error is swallowed here as the server will report an error if one occurs
			// and the client will show an error if the same consents fail when clicking on the submit button
		}
	};

	return (
		<MinimalLayout
			pageHeader="Complete your account"
			shortRequestId={shortRequestId}
			errorContext={getErrorContext(pageError)}
			errorOverride={pageError}
		>
			<MainBodyText>
				<strong>{email}</strong>
			</MainBodyText>
			<MainForm
				formRef={formRef}
				formAction={buildUrlWithQueryParams(
					'/welcome/complete-account',
					{},
					queryParams,
				)}
				submitButtonText="Next"
				recaptchaSiteKey={recaptchaSiteKey}
				formTrackingName={formTrackingName}
				disableOnSubmit
				formErrorMessageFromParent={formError}
				onSubmit={(e) => {
					const formSubmitMethodInput =
						formSubmitMethodRef.current as HTMLInputElement | null;
					if (formSubmitMethodInput) {
						// eslint-disable-next-line functional/immutable-data -- we need to mutate the object here to distinguish between the different methods of submittng the form
						formSubmitMethodInput.value = 'submit-button';
					}
					registrationFormSubmitOphanTracking(e.target as HTMLFormElement);
					return undefined;
				}}
				additionalTerms={[newsletterAdditionalTerms, isJobs === false].filter(
					Boolean,
				)}
				shortRequestId={shortRequestId}
			>
				<input
					type="hidden"
					name="formSubmitMethod"
					value="submit-button"
					ref={formSubmitMethodRef}
				/>
				<RegistrationConsents
					geolocation={geolocation}
					appName={appName}
					isJobs={isJobs}
					onChange={handleConsentChange}
				/>
			</MainForm>
		</MinimalLayout>
	);
};
