import React from 'react';
import { css } from '@emotion/react';
import { space, until } from '@guardian/source-foundations';
import {
	LinkButton,
	SvgArrowRightStraight,
} from '@guardian/source-react-components';
import { PasswordForm } from '@/client/components/PasswordForm';
import { FieldError } from '@/shared/model/ClientState';
import { ConsentsLayout } from '@/client/layouts/ConsentsLayout';
import { getAutoRow, passwordFormSpanDef } from '@/client/styles/Grid';
import { controls, text, greyBorderTop } from '@/client/styles/Consents';
import { CONSENTS_PAGES } from '@/client/models/ConsentsPages';
import { buildUrlWithQueryParams } from '@/shared/lib/routeUtils';
import NameInputField from '@/client/components/NameInputField';
import { useNameInputFieldError } from '@/client/lib/hooks/useNameFieldInputError';
import { QueryParams } from '@/shared/model/QueryParams';

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
	width: 150px;
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

	return (
		<ConsentsLayout
			title="Welcome to the Guardian"
			current={CONSENTS_PAGES.DETAILS}
			showContinueButton={false}
			errorMessage={nameFieldError}
			errorContext={nameFieldErrorContext}
		>
			<p css={[text, greyBorderTop, autoRow()]}>
				{passwordSet
					? 'Password already set for '
					: 'Please complete your details for '}
				{email ? <span css={emailSpan}>{email}</span> : 'your new account'}
			</p>
			{passwordSet ? (
				<div css={[controls, autoRow()]}>
					<LinkButton
						css={linkButton}
						href={buildUrlWithQueryParams('/consents', {}, queryParams)}
						priority="primary"
						icon={<SvgArrowRightStraight />}
						iconSide="right"
					>
						Continue
					</LinkButton>
				</div>
			) : (
				<PasswordForm
					submitUrl={submitUrl}
					fieldErrors={fieldErrors}
					labelText="Password"
					submitButtonText="Save and continue"
					gridAutoRow={autoRow}
					autoComplete="new-password"
					formTrackingName="welcome"
					onInvalid={() => setFormSubmitAttempted(true)}
					browserName={browserName}
				>
					{isJobs && <NameInputField onGroupError={setGroupError} />}
				</PasswordForm>
			)}
		</ConsentsLayout>
	);
};
