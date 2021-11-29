import React from 'react';
import { Meta } from '@storybook/react';

import { Page } from './Page';
import { Header } from './Header';
import { Text } from './Text';
import { Footer } from './Footer';
import { SubHeader } from './SubHeader';
import { renderMJML } from '../testUtils';
import { Button } from './Button';

export default {
  title: 'Email/Components/Page',
  component: Page,
  parameters: { layout: 'fullscreen' },
} as Meta;

export const Default = () => {
  return renderMJML(
    <Page title="Example title">
      <Header />
      <SubHeader>Example page</SubHeader>
      <Text>Hello,</Text>
      <Text>Some example text</Text>
      <Text noPaddingBottom>
        Some more example text to go into an email with no bottom padding.
      </Text>
      <Button href="#">Example button</Button>
      <Footer
        mistakeParagraphComponent={
          <>
            If you didn’t request to example action, please ignore this email.
            Your details won’t be changed and no one has accessed your account.
          </>
        }
      />
    </Page>,
  );
};
Default.storyName = 'with defaults';
