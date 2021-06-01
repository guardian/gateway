import React from 'react';
import { Meta } from '@storybook/react';

import { GlobalError } from './GlobalError';

export default {
  title: 'Components/GlobalError',
  component: GlobalError,
} as Meta;

export const Default = () => (
  <GlobalError
    link={{
      link: '',
      linkText: 'click here',
    }}
    error="An error message. For more informaition"
  />
);
Default.storyName = 'default';

export const Left = () => (
  <GlobalError
    link={{
      link: '',
      linkText: 'click here',
    }}
    error="An error message. For more informaition"
    left={true}
  />
);
Left.storyName = 'when left';
