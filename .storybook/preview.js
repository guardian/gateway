import { INITIAL_VIEWPORTS } from '@storybook/addon-viewport';
import React from 'react';
import { FocusStyleManager } from '@guardian/source-foundations';

import { Breakpoints } from '@/client/models/Style';
import clientStateDecorator from './clientStateDecorator';

/* Source provides a global utility that manages the appearance of focus styles. When enabled,
 * focus styles will be hidden while the user interacts using the mouse.
 * They will appear when the tab key is pressed to begin keyboard navigation. */
export const FocusManagerDecorator = (storyFn) => {
  React.useEffect(() => {
    FocusStyleManager.onlyShowFocusOnTabs();
  }, []);

  return <>{storyFn()}</>;
};

const customViewports = {};
for (let breakpoint in Breakpoints) {
  if (isNaN(Number(breakpoint))) {
    // Breakpoints is an enum, not an object, so it also loops the values which we want to avoid here
    customViewports[breakpoint] = {
      name: `${breakpoint} (${Breakpoints[breakpoint]})`,
      styles: {
        width: `${Breakpoints[breakpoint]}px`,
        height: '100vh',
      },
    };
  }
}

export const decorators = [FocusManagerDecorator, clientStateDecorator];

export const parameters = {
  actions: { argTypesRegex: '^on[A-Z].*' },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
  viewport: {
    viewports: {
      ...customViewports,
      ...INITIAL_VIEWPORTS,
    },
    defaultViewport: 'MOBILE',
  },
};
