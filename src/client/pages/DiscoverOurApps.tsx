import { OnboardingSection } from '@/client/components/OnboardingSection';
import { OnboardingCard } from '@/client/components/OnboardingCard';

export const DiscoverOurApps = () => {
	return (
		<OnboardingSection
			header="Discover our Apps"
			subHeader="Enjoy a richer experience on the go."
		>
			<OnboardingCard
				title="The Guardian app"
				text="Get the stuff you want, when you want it — news, sport, podcasts, puzzles and more."
				backgroundColour="#E1EAF7"
			/>
			<OnboardingCard
				title="The Guardian Feast app"
				text="Level up your cooking with more than 6,000 recipes and smart, exclusive cooking features."
				backgroundColour="#E1E5D5"
			/>
		</OnboardingSection>
	);
};
