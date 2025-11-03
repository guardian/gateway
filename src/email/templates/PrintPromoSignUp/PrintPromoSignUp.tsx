import { Header } from '@/email/components/Header';
import { Page } from '@/email/components/Page';
import { SubHeader } from '@/email/components/SubHeader';
import { Text } from '@/email/components/Text';
import { Footer } from '@/email/components/Footer';

export const PrintPromoSignUp = () => {
	return (
		<Page title="Print Promo Sign Up">
			{/* Content for Print Promo Sign Up email goes here */}
			<Header />
			<SubHeader>Welcome to Print Promo Sign Up</SubHeader>
			<Text>
				Thank you for signing up for Print Promo! We're excited to have you on
				board.
			</Text>
			<Footer
				mistakeParagraphComponent={
					<Text>
						If you didn't try to sign up for Print Promo, please ignore this
						email.
					</Text>
				}
			/>
		</Page>
	);
};
