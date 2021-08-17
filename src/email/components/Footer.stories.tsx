import React from 'react';
import { Meta } from '@storybook/react';

import { Footer } from './Footer';
import { renderMJMLComponent } from '../testUtils';

export default {
  title: 'Email/Components/Footer',
  component: Footer,
} as Meta;

export const Default = () => {
  return renderMJMLComponent(<Footer />);
};
Default.storyName = 'Default footer';

export const MistakeParagraph = () => {
  return renderMJMLComponent(
    <Footer
      mistakeParagraphComponent={
        <p>
          If you received this email by mistake, simply delete it. You
          won&apos;t be registered if you don&apos;t click the confirmation
          button above.
        </p>
      }
    />,
  );
};
MistakeParagraph.storyName = 'Mistake paragraph in footer';
