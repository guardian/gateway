import { OnboardingSection } from '@/client/components/OnboardingSection';
import { OnboardingCard } from '@/client/components/OnboardingCard';
import { Hide, Button, SvgDownload } from '@guardian/source/react-components';
import { FEAST_APP, GUARDIAN_APP } from '../assets/decorative';
const cta = (
	<>
		<Hide from="tablet">
			<Button
				priority="primary"
				size="xsmall"
				type="button"
				isLoading={false}
				icon={SvgDownload({
					size: 'xsmall',
				})}
			>
				Download
			</Button>
		</Hide>
		<Hide until="tablet">
			<Button
				priority="primary"
				size="small"
				type="button"
				isLoading={false}
				icon={SvgDownload({
					size: 'small',
				})}
			>
				Download
			</Button>
		</Hide>
	</>
);
export const DiscoverOurApps = () => {
	return (
		<OnboardingSection
			header="Discover our apps"
			subHeader="Enjoy a richer experience on the go."
		>
			<OnboardingCard
				title="The Guardian app"
				description="Get the stuff you want, when you want it — news, sport, podcasts, puzzles and more."
				backgroundColour="#E1EAF7"
				cta={cta}
				imagePath={FEAST_APP}
				imageType="rectangle"
			/>
			<OnboardingCard
				title="Guardian Feast app"
				description="Your most useful kitchen utensil, with more than 7,000 recipes and smart, exclusive cooking features."
				backgroundColour="#E1E5D5"
				cta={cta}
				imagePath={GUARDIAN_APP}
				imageType="rectangle"
			/>
		</OnboardingSection>
	);
};
