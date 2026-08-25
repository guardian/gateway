import React from 'react';
import { NewsLetter } from '@/shared/model/Newsletter';
import { ToggleSwitchList } from './ToggleSwitchList';
import { ToggleSwitchInput } from './ToggleSwitchInput';
import { MainBodyText } from './MainBodyText';

export const OnboardingNewsletters = ({
	newsletters,
}: {
	newsletters: NewsLetter[];
}) => {
	return (
		<MainBodyText>
			<h3> Explore more newsletters</h3>
			<p>
				{' '}
				Sign up to our newsletters and get exclusive Guardian journalism
				straight to your inbox.
			</p>

			<ToggleSwitchList>
				{newsletters.map((newsletter) => (
					<ToggleSwitchInput
						key={newsletter.id}
						id={newsletter.id}
						title={newsletter.name}
						description={newsletter.description}
						subLabel={newsletter.frequency}
					/>
				))}
			</ToggleSwitchList>
		</MainBodyText>
	);
};
