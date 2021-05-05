import { breakpoints } from '@guardian/src-foundations/mq';
import { Breakpoints } from '@/client/models/Style';
import { ABProvider } from '@guardian/ab-react';
import { StaticRouter } from 'react-router-dom';

const viewports = {};
for (let breakpoint in Breakpoints) {
  if (isNaN(Number(breakpoint))) {
    // Breakpoints is an enum, not an object, so it also loops the values which we want to avoid here
    viewports[breakpoint] = {
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
    viewports,
    defaultViewport: 'MOBILE',
  },
};

//Add global mocks for ABProvider and StaticRouter
export const decorators = [
  (Story) => (
    <ABProvider
      arrayOfTestObjects={[]}
      abTestSwitches={{}}
      pageIsSensitive={false}
      mvtMaxValue={1000000}
      mvtId={0}
      forcedTestVariants={{}}
    >
      <StaticRouter location={''} context={{}}>
        <Story />
      </StaticRouter>
    </ABProvider>
  ),
];
