import { css } from '@emotion/react';
import { until } from '@guardian/source/foundations';
import { LinkButton } from '@guardian/source/react-components';
import React from 'react';
import { MainBodyText } from '@/client/components/MainBodyText';
import NameInputField from '@/client/components/NameInputField';
import { PasswordForm } from '@/client/components/PasswordForm';
import { MinimalLayout } from '@/client/layouts/MinimalLayout';
import { useNameInputFieldError } from '@/client/lib/hooks/useNameFieldInputError';
import { primaryButtonStyles } from '@/client/styles/Shared';
import { buildUrlWithQueryParams } from '@/shared/lib/routeUtils';
import type { FieldError } from '@/shared/model/ClientState';
import type { QueryParams } from '@/shared/model/QueryParams';

type Props = {
	submitUrl: string;
	email?: string;
	fieldErrors: FieldError[];
	passwordSet?: boolean;
	isJobs?: boolean;
	browserName?: string;
	queryParams: QueryParams;
};

const emailSpan = css`
	font-weight: bold;

	/* Avoid long emails causing the page to be scrollable horizontally */
	${until.tablet} {
		overflow: hidden;
		text-overflow: ellipsis;
		display: inline-block;
		vertical-align: bottom;
		max-width: 100%;
	}
`;

export const Welcome = ({
	submitUrl,
	email,
	fieldErrors,
	passwordSet = false,
	isJobs = false,
	browserName,
	queryParams,
}: Props) => {
	const {
		nameFieldError,
		nameFieldErrorContext,
		setGroupError,
		setFormSubmitAttempted,
	} = useNameInputFieldError();

	const messageAction = isJobs ? 'Fill in your details' : 'Set a password';
	const messageContext = isJobs ? 'Details' : 'Password';

	return (
		<MinimalLayout
			pageHeader={isJobs ? 'Complete your account' : 'Create your password'}
			errorOverride={nameFieldError}
			errorContext={nameFieldErrorContext}
			leadText={
				<MainBodyText>
					{passwordSet
						? `${messageContext} already set for `
						: `${messageAction} for `}
					{email ? (
						<>
							Guardian account: <strong css={emailSpan}>{email}</strong>
						</>
					) : (
						'your new account.'
					)}
				</MainBodyText>
			}
		>
			{passwordSet ? (
				<LinkButton
					css={primaryButtonStyles()}
					href={buildUrlWithQueryParams('/welcome/review', {}, queryParams)}
					priority="primary"
				>
					Complete creating account
				</LinkButton>
			) : (
				<PasswordForm
					submitUrl={submitUrl}
					fieldErrors={fieldErrors}
					labelText="Password"
					submitButtonText="Complete creating account"
					autoComplete="new-password"
					formTrackingName="welcome"
					onInvalid={() => setFormSubmitAttempted(true)}
					browserName={browserName}
				>
					{isJobs && <NameInputField onGroupError={setGroupError} />}
				</PasswordForm>
			)}
		</MinimalLayout>
	);
};
