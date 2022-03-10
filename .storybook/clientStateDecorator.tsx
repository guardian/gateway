import React from 'react';
import { DecoratorFn } from '@storybook/react';

import {
  ClientStateProvider,
  defaultClientState,
} from '../src/client/components/ClientState';

const clientStateDecorator: DecoratorFn = (StoryToDecorate, context) => (
  <ClientStateProvider
    clientState={{
      ...defaultClientState,
      ...context.parameters.clientState,
    }}
  >
    <StoryToDecorate />
  </ClientStateProvider>
);

export default clientStateDecorator;
