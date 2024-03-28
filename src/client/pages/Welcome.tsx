import React from 'react';
import { css } from '@emotion/react';
import { space, until } from '@guardian/source-foundations';
import {
	LinkButton,
	SvgArrowRightStraight,
} from '@guardian/source-react-components';
import { PasswordForm } from '@/client/components/PasswordForm';
import { FieldError } from '@/shared/model/ClientState';
import { getAutoRow, passwordFormSpanDef } from '@/client/styles/Grid';
import { buildUrlWithQueryParams } from '@/shared/lib/routeUtils';
import NameInputField from '@/client/components/NameInputField';
import { useNameInputFieldError } from '@/client/lib/hooks/useNameFieldInputError';
import { QueryParams } from '@/shared/model/QueryParams';
import { MainLayout } from '../layouts/Main';
import { MainBodyText } from '../components/MainBodyText';

type Props = {
	submitUrl: string;
	email?: string;
	fieldErrors: FieldError[];
	passwordSet?: boolean;
	isJobs?: boolean;
	browserName?: string;
	queryParams: QueryParams;
};

const linkButton = css`
	margin-top: ${space[3]}px;
`;

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
	const autoRow = getAutoRow(1, passwordFormSpanDef);
	const {
		nameFieldError,
		nameFieldErrorContext,
		setGroupError,
		setFormSubmitAttempted,
	} = useNameInputFieldError();

	const messageAction = isJobs ? 'Fill in your details' : 'Set a password';
	const messageContext = isJobs ? 'Details' : 'Password';

	return (
		<MainLayout
			pageHeader={isJobs ? 'Complete your account' : 'Create your password'}
			errorOverride={nameFieldError}
			errorContext={nameFieldErrorContext}
		>
			<MainBodyText>
				{passwordSet
					? `${messageContext} already set for `
					: `${messageAction} for `}
				{email ? (
					<>
						Guardian account: <span css={emailSpan}>{email}</span>
					</>
				) : (
					'your new account.'
				)}
			</MainBodyText>
			{passwordSet ? (
				<LinkButton
					css={linkButton}
					href={buildUrlWithQueryParams('/welcome/review', {}, queryParams)}
					priority="primary"
					icon={<SvgArrowRightStraight />}
					iconSide="right"
				>
					Complete creating account
				</LinkButton>
			) : (
				<PasswordForm
					submitUrl={submitUrl}
					fieldErrors={fieldErrors}
					labelText="Password"
					submitButtonText="Complete creating account"
					gridAutoRow={autoRow}
					autoComplete="new-password"
					formTrackingName="welcome"
					onInvalid={() => setFormSubmitAttempted(true)}
					browserName={browserName}
				>
					{isJobs && <NameInputField onGroupError={setGroupError} />}
				</PasswordForm>
			)}
		</MainLayout>
	);
};
