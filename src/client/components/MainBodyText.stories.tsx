import React from 'react';
import { Meta } from '@storybook/react';

import { MainBodyText } from './MainBodyText';

export default {
  title: 'Components/MainBodyText',
  component: MainBodyText,
  parameters: { layout: 'fullscreen' },
} as Meta;

export const Default = () => (
  <MainBodyText>Here is some body text to use in the MainLayout.</MainBodyText>
);
Default.storyName = 'with Default';

export const Paragraphs = () => (
  <>
    <MainBodyText>
      Here is some body text to use in the MainLayout.
    </MainBodyText>
    <MainBodyText>
      Some more text here to make multiple paragraphs!
    </MainBodyText>
  </>
);
Paragraphs.storyName = 'with Paragraphs';
