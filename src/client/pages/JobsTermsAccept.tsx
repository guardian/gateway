import React from 'react';

import { MainBodyText } from '@/client/components/MainBodyText';
import { css } from '@emotion/react';
import {
	neutral,
	remSpace,
	textSans,
	until,
} from '@guardian/source/foundations';
import ThemedLink from '@/client/components/ThemedLink';
import { MainForm } from '@/client/components/MainForm';
import NameInputField from '@/client/components/NameInputField';
import { useNameInputFieldError } from '@/client/lib/hooks/useNameFieldInputError';
import { MinimalLayout } from '@/client/layouts/MinimalLayout';

const listBullets = css`
	list-style: none;
	padding-left: 0;
	text-indent: -${remSpace[4]}; /* second line indentation */
	margin-left: ${remSpace[4]}; /* second line indentation */
	li {
		margin-top: 8px;
	}
	/* ::marker is not supported in IE11 */
	li::before {
		content: '';
		margin-right: ${remSpace[2]};
		margin-top: ${remSpace[2]};
		background-color: ${neutral[86]};
		display: inline-block;
		width: 8px;
		height: 8px;
		border-radius: 50%;
		top: -1px;
		position: relative;
	}
`;

const text = css`
	margin: 0;
	${textSans.small()}
	color: var(--color-text);
`;

const leadText = css`
	${textSans.small({ fontWeight: 'bold' })}
`;

const textSpacing = css`
	margin-bottom: ${remSpace[2]};
`;

const noMargin = css`
	margin-top: initial;
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

interface JobsTermsAcceptProps {
	submitUrl: string;
	firstName?: string;
	secondName?: string;
	userBelongsToGRS?: boolean;
	email?: string;
	formError?: string;
}

export const JobsTermsAccept: React.FC<JobsTermsAcceptProps> = ({
	firstName,
	secondName,
	userBelongsToGRS,
	submitUrl,
	email,
	formError,
}) => {
	const {
		nameFieldError,
		nameFieldErrorContext,
		setGroupError,
		setFormSubmitAttempted,
	} = useNameInputFieldError();

	const isNameSet = !!firstName && !!secondName;
	// We just ask for the users' name if they belong to GRS but don't have a name set.
	// Otherwise we show the whole form.
	const showOnlyNameFields = userBelongsToGRS && !isNameSet;

	return (
		<MinimalLayout
			pageHeader="Welcome to Guardian&nbsp;Jobs"
			errorOverride={nameFieldError}
			errorContext={nameFieldErrorContext}
		>
			{showOnlyNameFields ? (
				<>
					{email ? (
						<MainBodyText cssOverrides={textSpacing}>
							Please complete your details for{' '}
							<span css={emailSpan}>{email}</span>
						</MainBodyText>
					) : (
						<MainBodyText cssOverrides={textSpacing}>
							Please complete your details
						</MainBodyText>
					)}
					<MainBodyText cssOverrides={noMargin}>
						We will use these details on your job applications.
					</MainBodyText>
					<MainForm
						submitButtonText="Save and continue"
						hasJobsTerms={false}
						formAction={submitUrl}
						onInvalid={() => setFormSubmitAttempted(true)}
						disableOnSubmit
						formErrorMessageFromParent={formError}
					>
						<NameInputField
							onGroupError={setGroupError}
							firstName={firstName}
							secondName={secondName}
						/>
					</MainForm>
				</>
			) : (
				<>
					<MainBodyText cssOverrides={leadText}>
						Click &lsquo;continue&rsquo; to automatically use your existing
						Guardian account to sign in with Guardian&nbsp;Jobs.
					</MainBodyText>
					<MainBodyText>
						By activating your Guardian&nbsp;Jobs account you will receive a
						welcome email detailing the range of career-enhancing features that
						can be set up on our jobs site. These include:
					</MainBodyText>
					<ul css={[text, listBullets]}>
						<li>
							Creating a job alert and receiving relevant jobs straight to your
							inbox
						</li>
						<li>
							Shortlisting jobs that interest you so you can access them later
							on different devices
						</li>
						<li>Uploading your CV and let employers find you</li>
					</ul>
					<MainForm
						submitButtonText="Continue"
						hasJobsTerms={true}
						formAction={submitUrl}
						onInvalid={() => setFormSubmitAttempted(true)}
						disableOnSubmit
						formErrorMessageFromParent={formError}
					>
						<NameInputField
							onGroupError={setGroupError}
							firstName={firstName}
							secondName={secondName}
						/>
					</MainForm>
					<MainBodyText>
						Or <ThemedLink href={'/signout'}>sign out and continue</ThemedLink>
					</MainBodyText>
				</>
			)}
		</MinimalLayout>
	);
};
