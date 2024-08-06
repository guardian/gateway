import { css } from '@emotion/react';
import { palette, textSans } from '@guardian/source/foundations';
import React from 'react';
import { CheckboxInput } from '@/client/components/CheckboxInput';
import {
	InformationBox,
	InformationBoxText,
} from '@/client/components/InformationBox';
import { MainBodyText } from '@/client/components/MainBodyText';
import { MainForm } from '@/client/components/MainForm';
import ThemedLink from '@/client/components/ThemedLink';
import { ToggleSwitchList } from '@/client/components/ToggleSwitchList';
import { MinimalLayout } from '@/client/layouts/MinimalLayout';
import { newslettersFormSubmitOphanTracking } from '@/client/lib/consentsTracking';
import { usePageLoadOphanInteraction } from '@/client/lib/hooks/usePageLoadOphanInteraction';
import { NEWSLETTER_IMAGES } from '@/client/models/Newsletter';
import { buildUrlWithQueryParams } from '@/shared/lib/routeUtils';
import type {
	NewsLetter,
	NewslettersWithImages,
} from '@/shared/model/Newsletter';
import type { QueryParams } from '@/shared/model/QueryParams';

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

export interface NewAccountNewslettersProps {
	newsletters?: NewsLetter[];
	queryParams: QueryParams;
	accountManagementUrl?: string;
}

export const NewAccountNewsletters = ({
	newsletters,
	queryParams,
	accountManagementUrl = 'https://manage.theguardian.com',
}: NewAccountNewslettersProps) => {
	const formTrackingName = 'new-account-newsletters';
	usePageLoadOphanInteraction(formTrackingName);

	const [checkboxesChecked, setCheckboxesChecked] = React.useState<string[]>(
		[],
	);

	const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const { checked, name } = event.target;
		if (checked) {
			setCheckboxesChecked([...checkboxesChecked, name]);
		} else {
			setCheckboxesChecked(checkboxesChecked.filter((item) => item !== name));
		}
	};

	return (
		<MinimalLayout
			pageHeader="One last thing..."
			wide={true}
			leadText={
				<>
					<MainBodyText>
						Our newsletters help you get closer to our quality, independent
						journalism.
					</MainBodyText>
					<MainBodyText>
						Newsletters may contain information about Guardian products,
						services and chosen charities or online advertisements.
					</MainBodyText>
				</>
			}
		>
			<MainForm
				wideLayout={true}
				formAction={buildUrlWithQueryParams(
					'/welcome/newsletters',
					{},
					queryParams,
				)}
				submitButtonText={
					checkboxesChecked.length ? 'Subscribe and continue' : 'Maybe later'
				}
				onSubmit={({ target: form }) => {
					newslettersFormSubmitOphanTracking(
						form as HTMLFormElement,
						newsletters,
					);
					// onSubmit expects an error object or undefined
					return undefined;
				}}
				formTrackingName={formTrackingName}
			>
				{newsletters?.length ? (
					<ToggleSwitchList columns={2}>
						{newsletters.map((newsletter: NewsLetter) => (
							<CheckboxInput
								key={newsletter.id}
								id={newsletter.id}
								label={newsletter.name}
								subLabel={newsletter.frequency}
								context={newsletter.description}
								cssOverrides={labelStyles}
								imagePath={
									NEWSLETTER_IMAGES[newsletter.id as NewslettersWithImages]
								}
								onToggle={handleCheckboxChange}
							/>
						))}
					</ToggleSwitchList>
				) : (
					<InformationBox>
						<InformationBoxText>
							We&lsquo;re having difficulty retrieving our newsletters at the
							moment. You can subscribe to newsletters later in your{' '}
							<ThemedLink href={`${accountManagementUrl}/email-prefs`}>
								Emails & marketing settings
							</ThemedLink>
							.
						</InformationBoxText>
					</InformationBox>
				)}
			</MainForm>
		</MinimalLayout>
	);
};
