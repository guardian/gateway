import React from 'react';
import { MinimalLayout } from '@/client/layouts/MinimalLayout';
import {
	NewsLetter,
	newsletterAdditionalTerms,
	NewslettersWithImages,
} from '@/shared/model/Newsletter';
import { MainBodyText } from '@/client/components/MainBodyText';
import { MainForm } from '@/client/components/MainForm';
import { buildUrlWithQueryParams } from '@/shared/lib/routeUtils';
import { QueryParams } from '@/shared/model/QueryParams';
import {
	InformationBox,
	InformationBoxText,
} from '@/client/components/InformationBox';
import ThemedLink from '@/client/components/ThemedLink';
import { NEWSLETTER_IMAGES } from '@/client/models/Newsletter';
import { newslettersFormSubmitOphanTracking } from '@/client/lib/consentsTracking';
import { usePageLoadOphanInteraction } from '@/client/lib/hooks/usePageLoadOphanInteraction';
import { ToggleSwitchList } from '@/client/components/ToggleSwitchList';
import { ToggleSwitchInput } from '../components/ToggleSwitchInput';

export interface NewAccountNewslettersProps {
	newsletters?: NewsLetter[];
	queryParams: QueryParams;
	accountManagementUrl?: string;
	shortRequestId?: string;
}

export const NewAccountNewsletters = ({
	newsletters,
	queryParams,
	accountManagementUrl = 'https://manage.theguardian.com',
	shortRequestId,
}: NewAccountNewslettersProps) => {
	const formTrackingName = 'new-account-newsletters';
	usePageLoadOphanInteraction(formTrackingName);

	const [toggleSwitchesChecked, setToggleSwitchesChecked] = React.useState<
		string[]
	>([]);

	const handleToggleSwitchChange = ({
		checked,
		name,
	}: {
		checked: boolean;
		name: string;
	}) => {
		if (checked) {
			setToggleSwitchesChecked([...toggleSwitchesChecked, name]);
		} else {
			setToggleSwitchesChecked(
				toggleSwitchesChecked.filter((item) => item !== name),
			);
		}
	};

	return (
		<MinimalLayout
			shortRequestId={shortRequestId}
			pageHeader="One last thing..."
			wide={true}
			leadText={
				<>
					<MainBodyText>
						Our newsletters help you get closer to our quality, independent
						journalism.
					</MainBodyText>
					<MainBodyText>{newsletterAdditionalTerms}</MainBodyText>
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
					toggleSwitchesChecked.length
						? 'Subscribe and continue'
						: 'Maybe later'
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
				shortRequestId={shortRequestId}
			>
				{newsletters?.length ? (
					<ToggleSwitchList columns={2}>
						{newsletters.map((newsletter: NewsLetter) => (
							<ToggleSwitchInput
								key={newsletter.id}
								id={newsletter.id}
								title={newsletter.name}
								description={newsletter.description}
								imagePath={
									NEWSLETTER_IMAGES[newsletter.id as NewslettersWithImages]
								}
								onChange={(id, checked) => {
									handleToggleSwitchChange({
										checked,
										name: id,
									});
								}}
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
