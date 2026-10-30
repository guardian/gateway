import { OnboardingSection } from '@/client/components/OnboardingSection';
import { OnboardingCard } from '@/client/components/OnboardingCard';
import { SvgDownload } from '@guardian/source/react-components';
import { OnboardingButton } from '../components/OnboardingButton';
import { FEAST_APP, GUARDIAN_APP } from '../assets/decorative';
import { RectangleOnboardingImage } from '../components/OnboardingImage';

export const DiscoverOurApps = () => {
	const DownloadAppCta = (
		<OnboardingButton
			mobileIcon={SvgDownload({
				size: 'xsmall',
			})}
			webIcon={SvgDownload({
				size: 'small',
			})}
			text="Download"
		/>
	);
	return (
		<OnboardingSection
			header="Discover our apps"
			subHeader="Enjoy a richer experience on the go."
		>
			<OnboardingCard
				title="The Guardian app"
				description="Get the stuff you want, when you want it — news, sport, podcasts, puzzles and more."
				backgroundColour="#E1EAF7"
				cta={DownloadAppCta}
				image={<RectangleOnboardingImage path={GUARDIAN_APP} />}
			/>
			<OnboardingCard
				title="Guardian Feast app"
				description="Your most useful kitchen utensil, with more than 7,000 recipes and smart, exclusive cooking features."
				backgroundColour="#E1E5D5"
				cta={DownloadAppCta}
				image={<RectangleOnboardingImage path={FEAST_APP} />}
			/>
		</OnboardingSection>
	);
};
