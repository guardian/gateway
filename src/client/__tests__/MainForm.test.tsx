/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { MainForm } from '../components/MainForm';

const setup = () => {
  const utils = render(
    <MainForm
      recaptchaSiteKey="invalid-key"
      formAction="/"
      submitButtonText="Submit"
    />,
  );

  return {
    ...utils,
  };
};

test('errors with nothing submitted', async () => {
  const {} = setup();
});
