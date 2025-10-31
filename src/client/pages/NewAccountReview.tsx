import React from 'react';
import {
	MainBodyText,
	mainBodyTextStyles,
} from '@/client/components/MainBodyText';
import { Consent } from '@/shared/model/Consent';
import { ToggleSwitchInput } from '@/client/components/ToggleSwitchInput';
import {
	InformationBox,
	InformationBoxText,
} from '@/client/components/InformationBox';
import { ExternalLink } from '@/client/components/ExternalLink';
import locations from '@/shared/lib/locations';
import { remSpace } from '@guardian/source/foundations';
import { css } from '@emotion/react';
import { buildUrlWithQueryParams } from '@/shared/lib/routeUtils';
import { QueryParams } from '@/shared/model/QueryParams';
import { consentsFormSubmitOphanTracking } from '@/client/lib/consentsTracking';
import { MinimalLayout } from '@/client/layouts/MinimalLayout';
import { ToggleSwitchList } from '@/client/components/ToggleSwitchList';
import { usePageLoadOphanInteraction } from '@/client/lib/hooks/usePageLoadOphanInteraction';
import { trackFormSubmit } from '@/client/lib/ophan';
import { MainForm } from '@/client/components/MainForm';
import { subheadingStyles } from '../styles/Shared';

const listStyles = css`
	margin-top: 0;
	margin-bottom: 0;
	padding-left: ${remSpace[8]};
`;

export interface NewAccountReviewProps {
	profiling?: Consent;
	advertising?: Consent;
	queryParams: QueryParams;
	shortRequestId?: string;
}

export const NewAccountReview = ({
	profiling,
	advertising,
	queryParams,
	shortRequestId,
}: NewAccountReviewProps) => {
	const formTrackingName = 'new-account-review';
	usePageLoadOphanInteraction(formTrackingName);

	if (!profiling && !advertising) {
		return (
			<MinimalLayout
				shortRequestId={shortRequestId}
				pageHeader="You're signed in! Welcome to the Guardian."
				imageId="welcome"
			>
				<MainForm
					shortRequestId={shortRequestId}
					formAction={buildUrlWithQueryParams(
						'/welcome/review',
						{},
						queryParams,
					)}
					submitButtonText="Continue to the Guardian"
				/>
			</MinimalLayout>
		);
	}
	return (
		<MinimalLayout
			shortRequestId={shortRequestId}
			pageHeader="You're signed in! Welcome to the Guardian."
			imageId="welcome"
			leadText="
				Before you start, confirm how you’d like the Guardian to use your
				signed-in data.
			"
		>
			<MainForm
				formAction={buildUrlWithQueryParams('/welcome/review', {}, queryParams)}
				onSubmit={({ target: form }) => {
					trackFormSubmit(formTrackingName);
					consentsFormSubmitOphanTracking(
						form as HTMLFormElement,
						[profiling, advertising].filter(Boolean) as Consent[],
					);
					return undefined;
				}}
				submitButtonText="Save and continue"
				shortRequestId={shortRequestId}
			>
				<ToggleSwitchList>
					{!!advertising && (
						<ToggleSwitchInput
							id={advertising.id}
							description="Allow personalised advertising with my signed-in data"
							defaultChecked // should opt in by default
						/>
					)}
					{!!profiling && (
						<ToggleSwitchInput
							id={profiling.id}
							description="Allow the Guardian to analyse my signed-in data to improve marketing content"
							defaultChecked // legitimate interests so defaults to true
						/>
					)}
				</ToggleSwitchList>
				{!!advertising && (
					<>
						<MainBodyText cssOverrides={subheadingStyles}>
							Personalised advertising
						</MainBodyText>
						<MainBodyText>We do this by:</MainBodyText>
						<div css={mainBodyTextStyles}>
							<ul css={listStyles}>
								<li>
									Checking if you are already a customer of other trusted
									partners
								</li>
								<li>
									Generating random identifiers based on your email address for
									advertising and marketing
								</li>
							</ul>
						</div>
						<MainBodyText>
							Advertising is a crucial source of our funding. You won't see more
							ads, but your advertising may be more relevant.
						</MainBodyText>
					</>
				)}
				<MainBodyText cssOverrides={subheadingStyles}>
					What we mean by signed-in data
				</MainBodyText>
				<MainBodyText>
					Information you provide when you create an account with us e.g.
				</MainBodyText>
				<div css={mainBodyTextStyles}>
					<ul css={listStyles}>
						<li>First name and last name</li>
						<li>Email address</li>
					</ul>
				</div>
				<InformationBox>
					<InformationBoxText>
						You can change your settings under{' '}
						<ExternalLink href={locations.MMA_DATA_PRIVACY}>
							Data Privacy
						</ExternalLink>{' '}
						on your Guardian account at any time.
					</InformationBoxText>
				</InformationBox>
			</MainForm>
		</MinimalLayout>
	);
};
