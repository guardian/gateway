/**
 * @jest-environment jsdom
 */

import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/jest-globals';
import { ExternalLink } from '../components/ExternalLink';

test('ExternalLink renders with target="_blank" when openInNewTab is true', () => {
	render(
		<ExternalLink href="https://example.com" openInNewTab={true}>
			Click me
		</ExternalLink>,
	);

	// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
	const link = screen.getByText('Click me') as HTMLAnchorElement;
	expect(link).toHaveAttribute('target', '_blank');
	expect(link).toHaveAttribute('rel', 'noopener noreferrer');
});

test('ExternalLink renders without target="_blank" when openInNewTab is false', () => {
	render(
		<ExternalLink href="https://example.com" openInNewTab={false}>
			Click me
		</ExternalLink>,
	);

	// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
	const link = screen.getByText('Click me') as HTMLAnchorElement;
	expect(link).not.toHaveAttribute('target');
	expect(link).toHaveAttribute('rel', 'noopener noreferrer');
});

test('ExternalLink renders without target="_blank" by default when openInNewTab is not provided', () => {
	render(<ExternalLink href="https://example.com">Click me</ExternalLink>);

	// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
	const link = screen.getByText('Click me') as HTMLAnchorElement;
	expect(link).not.toHaveAttribute('target');
	expect(link).toHaveAttribute('rel', 'noopener noreferrer');
});
