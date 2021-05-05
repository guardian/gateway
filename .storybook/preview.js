import { breakpoints } from '@guardian/src-foundations/mq';
import { MaxWidth } from '@/client/models/Style';

const viewports = {};
for (let breakpoint in MaxWidth) {
  if (isNaN(Number(breakpoint))) {
    // MaxWidth is an enum, not an object, so it also loops the values which we want to avoid here
    viewports[breakpoint] = {
      name: `${breakpoint} (${MaxWidth[breakpoint]})`,
      styles: {
        width: `${MaxWidth[breakpoint]}px`,
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
    viewports,
    defaultViewport: 'MOBILE',
  },
};
