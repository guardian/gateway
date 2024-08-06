import { css } from '@emotion/react';
import { remSpace, textSans } from '@guardian/source/foundations';
import React from 'react';
import { ExternalLink } from '@/client/components/ExternalLink';
import {
	InformationBox,
	InformationBoxText,
} from '@/client/components/InformationBox';
import { MainBodyText } from '@/client/components/MainBodyText';
import { MainForm } from '@/client/components/MainForm';
import { ToggleSwitchInput } from '@/client/components/ToggleSwitchInput';
import { ToggleSwitchList } from '@/client/components/ToggleSwitchList';
import { MinimalLayout } from '@/client/layouts/MinimalLayout';
import { consentsFormSubmitOphanTracking } from '@/client/lib/consentsTracking';
import { usePageLoadOphanInteraction } from '@/client/lib/hooks/usePageLoadOphanInteraction';
import { trackFormSubmit } from '@/client/lib/ophan';
import locations from '@/shared/lib/locations';
import { buildUrlWithQueryParams } from '@/shared/lib/routeUtils';
import type { Consent } from '@/shared/model/Consent';
import type { QueryParams } from '@/shared/model/QueryParams';

const subheadingStyles = css`
	${textSans.medium({ fontWeight: 'bold' })};
`;

const listStyles = css`
	margin-top: 0;
	margin-bottom: 0;
	padding-left: ${remSpace[8]};
`;

export interface NewAccountReviewProps {
	profiling?: Consent;
	advertising?: Consent;
	queryParams: QueryParams;
}

export const NewAccountReview = ({
	profiling,
	advertising,
	queryParams,
}: NewAccountReviewProps) => {
	const formTrackingName = 'new-account-review';
	usePageLoadOphanInteraction(formTrackingName);

	if (!profiling && !advertising) {
		return (
			<MinimalLayout
				pageHeader="You're signed in! Welcome to the Guardian."
				imageId="welcome"
			>
				<MainForm
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
			>
				<ToggleSwitchList>
					{!!advertising && (
						<ToggleSwitchInput
							id={advertising.id}
							description="Allow personalised advertising with my signed-in data"
							defaultChecked={advertising.consented ?? false}
						/>
					)}
					{!!profiling && (
						<ToggleSwitchInput
							id={profiling.id}
							description="Allow the Guardian to analyse my signed-in data to improve marketing content"
							defaultChecked={profiling.consented ?? true} // legitimate interests so defaults to true
						/>
					)}
				</ToggleSwitchList>
				{!!advertising && (
					<>
						<MainBodyText cssOverrides={subheadingStyles}>
							Personalised advertising
						</MainBodyText>
						<MainBodyText>
							Advertising is a crucial source of our funding. You won’t see more
							ads, and your data won’t be shared with third parties to use for
							their own advertising. Instead, we would analyse your information
							to predict what you might be interested in.
						</MainBodyText>
					</>
				)}
				<MainBodyText cssOverrides={subheadingStyles}>
					What we mean by signed-in data
				</MainBodyText>
				<MainBodyText>
					<ul css={listStyles}>
						<li>Information you provide e.g. email address</li>
						<li>Products or services you buy from us</li>
						<li>
							Pages you view on theguardian.com or other Guardian websites when
							signed in
						</li>
					</ul>
				</MainBodyText>
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
