import React from 'react';
import { Meta } from '@storybook/react';

import { Page } from './Page';
import { Header } from './Header';
import { Text } from './Text';
import { Footer } from './Footer';
import { SubHeader } from './SubHeader';
import { renderMJML } from '../testUtils';

export default {
  title: 'Email/Components/Page',
  component: Page,
  parameters: { layout: 'fullscreen' },
} as Meta;

export const Default = () => {
  return renderMJML(
    <Page>
      <Header />
      <SubHeader>Example page</SubHeader>
      <Text>
        <p>Some example text</p>
      </Text>
      <Footer />
    </Page>,
  );
};
Default.storyName = 'with defaults';
