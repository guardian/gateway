/**
 * @jest-environment jsdom
 */
/** @jsx jsx */

import { jsx } from '@emotion/react';
import { render, waitFor, within } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { SignIn, SignInProps } from '../pages/SignIn';

const setup = (extraProps?: Partial<SignInProps>) =>
  render(
    <SignIn
      recaptchaSiteKey="6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"
      isReauthenticate={false}
      queryParams={{
        returnUrl: 'https://www.theguardian.com/uk',
      }}
      {...extraProps}
    />,
  );

test('Register button not shown when reauthenticate is set to true', async () => {
  const { queryByText } = setup({ isReauthenticate: true });
  await waitFor(() => {
    // This may need to be made a bit more specific if we ever put the word
    // 'Register' on the page but it works for the moment!
    expect(queryByText('Register')).not.toBeInTheDocument();
  });
});

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
    'By proceeding, you agree to our terms & conditions.',
  );
  const privacyPolicy = queryByTextContent(
    'For information about how we use your data, see our privacy policy.',
  );
  const jobsTerms = queryByTextContent(
    'By proceeding, you agree to our Guardian Jobs terms & conditions.',
  );
  await waitFor(() => {
    expect(defaultTerms).toBeInTheDocument();
    expect(privacyPolicy).toBeInTheDocument();
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
  const privacyPolicy = queryByTextContent(
    'For information about how we use your data, see our Guardian Jobs privacy policy.',
  );
  const jobsTerms = queryByTextContent(
    'By proceeding, you agree to our Guardian Jobs terms & conditions.',
  );
  await waitFor(() => {
    expect(defaultTerms).not.toBeInTheDocument();
    expect(privacyPolicy).toBeInTheDocument();
    expect(jobsTerms).toBeInTheDocument();
  });
});

test('Shows an error inside the form when formError is set', async () => {
  const errorText = 'Alas, poor Yorick, an error has occurred.';
  const { getByTestId } = setup({
    formError: errorText,
  });
  const mainForm = getByTestId('main-form');
  const formError = within(mainForm).queryByText(errorText, { exact: false });
  await waitFor(() => {
    expect(formError).toBeInTheDocument();
  });
});

test('Shows an error outside the form when pageError is set', async () => {
  const errorText = 'Alas, poor Yorick, an error has occurred.';
  const { getByTestId, queryByText } = setup({
    pageError: errorText,
  });
  const mainForm = getByTestId('main-form');
  const formError = within(mainForm).queryByText(errorText, { exact: false });
  await waitFor(() => {
    expect(formError).not.toBeInTheDocument();
    expect(queryByText(errorText)).toBeInTheDocument();
  });
});
