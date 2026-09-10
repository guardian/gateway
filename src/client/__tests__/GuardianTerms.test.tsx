/**
 * @jest-environment jsdom
 */

import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/jest-globals';
import { GuardianTerms } from '../components/Terms';

test('GuardianTerms renders terms and conditions link with target="_blank" when openLinksInNewTab is true', () => {
	render(<GuardianTerms openLinksInNewTab={true} />);

	// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
	const termsLink = screen.getByText(
		'terms and conditions',
	) as HTMLAnchorElement;
	expect(termsLink).toHaveAttribute('target', '_blank');
});

test('GuardianTerms renders privacy policy link with target="_blank" when openLinksInNewTab is true', () => {
	render(<GuardianTerms openLinksInNewTab={true} />);

	// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
	const privacyLink = screen.getByText('privacy policy') as HTMLAnchorElement;
	expect(privacyLink).toHaveAttribute('target', '_blank');
});

test('GuardianTerms renders terms and conditions link without target="_blank" when openLinksInNewTab is false', () => {
	render(<GuardianTerms openLinksInNewTab={false} />);

	// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
	const termsLink = screen.getByText(
		'terms and conditions',
	) as HTMLAnchorElement;
	expect(termsLink).not.toHaveAttribute('target');
});

test('GuardianTerms renders links without target="_blank" by default when openLinksInNewTab is not provided', () => {
	render(<GuardianTerms />);

	// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
	const termsLink = screen.getByText(
		'terms and conditions',
	) as HTMLAnchorElement;
	// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
	const privacyLink = screen.getByText('privacy policy') as HTMLAnchorElement;
	expect(termsLink).not.toHaveAttribute('target');
	expect(privacyLink).not.toHaveAttribute('target');
});
