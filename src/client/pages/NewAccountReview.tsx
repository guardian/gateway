import React from 'react';
import { MainLayout, buttonStyles } from '@/client/layouts/Main';
import { MainBodyText } from '@/client/components/MainBodyText';
import { Consent } from '@/shared/model/Consent';
import { ToggleSwitchInput } from '@/client/components/ToggleSwitchInput';
import {
	InformationBox,
	InformationBoxText,
} from '@/client/components/InformationBox';
import { ExternalLink } from '@/client/components/ExternalLink';
import locations from '@/shared/lib/locations';
import { palette, space, textSans } from '@guardian/source-foundations';
import { css } from '@emotion/react';
import { Button } from '@guardian/source-react-components';
import { buildUrlWithQueryParams } from '@/shared/lib/routeUtils';
import { CsrfFormField } from '@/client/components/CsrfFormField';
import { QueryParams } from '@/shared/model/QueryParams';
import { consentsFormSubmitOphanTracking } from '@/client/lib/consentsTracking';

const consentToggleCss = css`
	display: flex;
	margin-top: ${space[6]}px;
	margin-bottom: ${space[4]}px;
	flex-direction: column;
	gap: ${space[3]}px;
`;

const switchRow = css`
	border: 0;
	padding: 0;
	margin: 0;
	${textSans.medium()}
	border-radius: 4px;
	border: 1px solid ${palette.neutral[38]};
	padding: ${space[2]}px;
`;

const labelStyles = css`
	justify-content: space-between;
	& > span:first-of-type {
		color: ${palette.neutral[20]};
		${textSans.xsmall({ fontWeight: 'bold' })}
	}
	& > span:last-of-type {
		align-self: flex-start;
		color: ${palette.neutral[46]};
		${textSans.xsmall()}
	}
`;

const subheadingStyles = css`
	margin-top: ${space[6]}px;
	margin-bottom: ${space[1]}px;
	${textSans.medium({ fontWeight: 'bold' })};
`;

const listStyles = css`
	margin-top: 0;
	padding-left: 1rem;
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
	if (!profiling && !advertising) {
		return (
			<MainLayout pageHeader="You're signed in! Welcome to the Guardian.">
				<form
					action={buildUrlWithQueryParams('/welcome/review', {}, queryParams)}
					method="post"
				>
					<CsrfFormField />
					<Button css={buttonStyles({})} type="submit" priority="primary">
						Continue to the Guardian
					</Button>
				</form>
			</MainLayout>
		);
	}
	return (
		<MainLayout pageHeader="You're signed in! Welcome to the Guardian.">
			<MainBodyText>
				Before you start, confirm how you’d like the Guardian to use your
				signed-in data.
			</MainBodyText>
			<form
				action={buildUrlWithQueryParams('/welcome/review', {}, queryParams)}
				method="post"
				onSubmit={({ target: form }) => {
					consentsFormSubmitOphanTracking(
						form as HTMLFormElement,
						[profiling, advertising].filter(Boolean) as Consent[],
					);
				}}
			>
				<CsrfFormField />
				<div css={consentToggleCss}>
					{!!advertising && (
						<fieldset css={switchRow}>
							<ToggleSwitchInput
								id={advertising.id}
								label="Allow personalised advertising with my signed-in data"
								defaultChecked={advertising.consented ?? false}
								cssOverrides={labelStyles}
							/>
						</fieldset>
					)}
					{!!profiling && (
						<fieldset css={switchRow}>
							<ToggleSwitchInput
								id={profiling.id}
								label="Allow the Guardian to analyse my signed-in data to improve marketing content"
								defaultChecked={profiling.consented ?? true} // legitimate interests so defaults to true
								cssOverrides={labelStyles}
							/>
						</fieldset>
					)}
				</div>
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
				<Button css={buttonStyles({})} type="submit" priority="primary">
					Save and continue
				</Button>
			</form>
		</MainLayout>
	);
};
