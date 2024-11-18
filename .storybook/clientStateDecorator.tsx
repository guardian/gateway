import React from 'react';
import type { Decorator } from '@storybook/react';

import {
	ClientStateProvider,
	defaultClientState,
} from '../src/client/components/ClientState';

const clientStateDecorator: Decorator = (StoryToDecorate, context) => (
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
