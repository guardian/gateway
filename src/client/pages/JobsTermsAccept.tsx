import React from 'react';

import { MainLayout } from '@/client/layouts/Main';
import { MainBodyText } from '@/client/components/MainBodyText';
import { css } from '@emotion/react';
import { neutral, space, textSans, until } from '@guardian/source-foundations';
import { getAutoRow, gridItemYourData } from '@/client/styles/Grid';
import { Link } from '@guardian/source-react-components';
import { MainForm } from '@/client/components/MainForm';
import NameInputField from '@/client/components/NameInputField';
import { useNameInputFieldError } from '@/client/lib/hooks/useNameFieldInputError';

const listBullets = css`
	list-style: none;
	padding-left: 0;
	text-indent: -${space[5]}px; /* second line indentation */
	margin-left: ${space[5]}px; /* second line indentation */
	li {
		font-size: 17px;
		margin-top: 6px;
	}
	/* ::marker is not supported in IE11 */
	li::before {
		content: '';
		margin-right: ${space[2]}px;
		margin-top: ${space[2]}px;
		background-color: ${neutral[86]};
		display: inline-block;
		width: 12px;
		height: 12px;
		border-radius: 50%;
	}
`;

const text = css`
	margin: 0;
	${textSans.medium()}
`;

const belowFormMarginTopSpacingStyle = css`
	margin-top: ${space[4]}px;
`;

const heading = css`
	color: ${neutral[0]};
	margin: 0 0 ${space[2]}px;
	font-weight: bold;
`;

const textSpacing = css`
	margin-bottom: ${space[2]}px;
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
	const autoYourDataRow = getAutoRow(1, gridItemYourData);

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
		<MainLayout
			useJobsHeader={true}
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
					<MainBodyText cssOverrides={heading}>
						Click &lsquo;continue&rsquo; to automatically use your existing
						Guardian account to sign in with Guardian&nbsp;Jobs.
					</MainBodyText>
					<MainBodyText cssOverrides={textSpacing}>
						By activating your Guardian&nbsp;Jobs account you will receive a
						welcome email detailing the range of career-enhancing features that
						can be set up on our jobs site. These include:
					</MainBodyText>
					<ul css={[text, listBullets, autoYourDataRow()]}>
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
					<MainBodyText cssOverrides={belowFormMarginTopSpacingStyle}>
						Or <Link href={'/signout'}>sign out and continue</Link>
					</MainBodyText>
				</>
			)}
		</MainLayout>
	);
};
