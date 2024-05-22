import React from 'react';
import { MainLayout } from '@/client/layouts/Main';
import { NewsLetter, NewslettersWithImages } from '@/shared/model/Newsletter';
import { palette, space, textSans } from '@guardian/source-foundations';
import { css } from '@emotion/react';
import { MainBodyText } from '@/client/components/MainBodyText';
import { CheckboxInput } from '@/client/components/CheckboxInput';
import { MainForm } from '@/client/components/MainForm';
import { buildUrlWithQueryParams } from '@/shared/lib/routeUtils';
import { QueryParams } from '@/shared/model/QueryParams';
import {
	InformationBox,
	InformationBoxText,
} from '@/client/components/InformationBox';
import { Link } from '@guardian/source-react-components';
import { NEWSLETTER_IMAGES } from '@/client/models/Newsletter';

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
		<MainLayout pageHeader="One last thing...">
			<MainBodyText>
				Our newsletters help you get closer to our quality, independent
				journalism. Newsletters may contain information about Guardian products,
				services and chosen charities or online advertisements.
			</MainBodyText>
			<MainForm
				formAction={buildUrlWithQueryParams(
					'/welcome/newsletters',
					{},
					queryParams,
				)}
				submitButtonText={
					checkboxesChecked.length ? 'Subscribe and continue' : 'Maybe later'
				}
			>
				{newsletters?.length ? (
					newsletters.map((newsletter: NewsLetter) => (
						<div key={newsletter.id} css={consentToggleCss}>
							<fieldset css={switchRow}>
								<CheckboxInput
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
							</fieldset>
						</div>
					))
				) : (
					<InformationBox>
						<InformationBoxText>
							We&lsquo;re having difficulty retrieving our newsletters at the
							moment. You can subscribe to newsletters later in your{' '}
							<Link href={`${accountManagementUrl}/email-prefs`}>
								Emails & marketing settings
							</Link>
							.
						</InformationBoxText>
					</InformationBox>
				)}
			</MainForm>
		</MainLayout>
	);
};
