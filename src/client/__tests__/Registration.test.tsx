/**
 * @jest-environment jsdom
 */
/** @jsx jsx */

import { jsx } from '@emotion/react';
import { render, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/jest-globals';
import { Registration, RegistrationProps } from '../pages/Registration';

const setup = (extraProps?: Partial<RegistrationProps>) =>
	render(
		<Registration
			recaptchaSiteKey="6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"
			// oauthBaseUrl="https://oauth.theguardian.com/"
			queryParams={{
				returnUrl: 'https://www.theguardian.com/uk',
			}}
			email="test@test.com"
			{...extraProps}
		/>,
	);

test('Default terms and conditions in document when clientId not set', async () => {
	const { queryByText } = setup({
		queryParams: {
			returnUrl: 'https://www.theguardian.com/uk',
		},
	});

	/**
	 * A helper function to check if the specified text appears in any tag in the document,
	 * including that tag's children.
	 */
	const queryByTextContent = (text: string) => {
		// Passing function to testing-library's `queryByText`
		return queryByText((content, element) => {
			const hasText = (element: Element | null) =>
				element?.textContent === text;
			const elementHasText = hasText(element);
			const childrenDontHaveText = Array.from(element?.children || []).every(
				(child) => !hasText(child),
			);
			return elementHasText && childrenDontHaveText;
		});
	};

	const defaultTerms = queryByTextContent(
		'By proceeding, you agree to our terms & conditions. For information about how we use your data, see our privacy policy.',
	);
	const jobsTerms = queryByTextContent(
		'By proceeding, you agree to our Guardian Jobs terms & conditions.',
	);
	await waitFor(() => {
		expect(defaultTerms).toBeInTheDocument();
		expect(jobsTerms).not.toBeInTheDocument();
	});
});

test('Jobs terms and conditions in document when clientId equals "jobs"', async () => {
	const { queryByText } = setup({
		queryParams: {
			returnUrl: 'https://www.theguardian.com/uk',
			clientId: 'jobs',
		},
	});

	/**
	 * A helper function to check if the specified text appears in any tag in the document,
	 * including that tag's children.
	 */
	const queryByTextContent = (text: string) => {
		// Passing function to testing-library's `queryByText`
		return queryByText((content, element) => {
			const hasText = (element: Element | null) =>
				element?.textContent === text;
			const elementHasText = hasText(element);
			const childrenDontHaveText = Array.from(element?.children || []).every(
				(child) => !hasText(child),
			);
			return elementHasText && childrenDontHaveText;
		});
	};

	const defaultTerms = queryByTextContent(
		'By proceeding, you agree to our terms & conditions',
	);
	const jobsTerms = queryByTextContent(
		'By proceeding, you agree to our Guardian Jobs terms & conditions. For information about how we use your data, see our Guardian Jobs privacy policy.',
	);
	await waitFor(() => {
		expect(defaultTerms).not.toBeInTheDocument();
		expect(jobsTerms).toBeInTheDocument();
	});
});
