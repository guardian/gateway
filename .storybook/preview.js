import { INITIAL_VIEWPORTS } from '@storybook/addon-viewport';
import { Breakpoints } from '@/client/models/Style';

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
