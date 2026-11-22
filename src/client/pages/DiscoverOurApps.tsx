import { OnboardingSection } from '@/client/components/OnboardingSection';
import { OnboardingCard } from '@/client/components/OnboardingCard';
import { FEAST_APP, GUARDIAN_APP } from '../assets/decorative';
import { RectangleOnboardingImage } from '../components/OnboardingImage';
import { DownloadAppCta } from '@/client/components/DownloadAppCta';

const GUARDIAN_APP_TITLE = 'The Guardian app';
const FEAST_APP_TITLE = 'Guardian Feast app';

export const DiscoverOurApps = () => {
	return (
		<OnboardingSection
			header="Discover our apps"
			subHeader="Enjoy a richer experience on the go."
		>
			<OnboardingCard
				title={GUARDIAN_APP_TITLE}
				description="Get the stuff you want, when you want it — news, sport, podcasts, puzzles and more."
				backgroundColour="#E1EAF7"
				cta={<DownloadAppCta title={GUARDIAN_APP_TITLE} />}
				image={<RectangleOnboardingImage path={GUARDIAN_APP} />}
			/>
			<OnboardingCard
				title={FEAST_APP_TITLE}
				description="Your most useful kitchen utensil, with more than 7,000 recipes and smart, exclusive cooking features."
				backgroundColour="#E1E5D5"
				cta={<DownloadAppCta title={FEAST_APP_TITLE} />}
				image={<RectangleOnboardingImage path={FEAST_APP} />}
			/>
		</OnboardingSection>
	);
};
