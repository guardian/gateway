import React from 'react';
import { Meta } from '@storybook/react';

import { GlobalError } from '@/client/components/GlobalError';

export default {
	title: 'Components/GlobalError',
	component: GlobalError,
} as Meta;

export const Default = () => (
	<GlobalError
		link={{
			link: 'https://example.com',
			linkText: 'click here',
		}}
		error="An error message. For more information"
	/>
);
Default.storyName = 'default';

export const Left = () => (
	<GlobalError
		link={{
			link: 'https://example.com',
			linkText: 'click here',
		}}
		error="An error message. For more information"
		left={true}
	/>
);
Left.storyName = 'when left';
