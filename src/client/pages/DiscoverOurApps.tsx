import { OnboardingSection } from '@/client/components/OnboardingSection';
import { OnboardingCard } from '@/client/components/OnboardingCard';

export const DiscoverOurApps = () => {
	return (
		<OnboardingSection
			header="Discover our apps"
			subHeader="Enjoy a richer experience on the go."
		>
			<OnboardingCard
				title="The Guardian app"
				text="Get the stuff you want, when you want it — news, sport, podcasts, puzzles and more."
				backgroundColour="#E1EAF7"
			/>
			<OnboardingCard
				title="Guardian Feast app"
				text="Your most useful kitchen utensil, with more than 7,000 recipes and smart, exclusive cooking features."
				backgroundColour="#E1E5D5"
			/>
		</OnboardingSection>
	);
};
