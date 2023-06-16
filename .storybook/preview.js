import React from 'react';
import { INITIAL_VIEWPORTS } from '@storybook/addon-viewport';
import { withThemeFromJSXProvider } from '@storybook/addon-styling';
import { Global, css } from '@emotion/react';
import { FocusStyleManager } from '@guardian/source-foundations';
import { fontFaces } from '@/client/lib/fonts';
import { Breakpoints } from '@/client/models/Style';
import clientStateDecorator from './clientStateDecorator';
import { neutral } from '@guardian/source-foundations';

const GlobalStyles = () => (
  <Global
    styles={css`
      ${fontFaces}
      html {
        height: 100%;
        box-sizing: border-box;
      }
      body {
        height: 100%;
        color: ${neutral[7]};
      }
      #storybook-root {
        min-height: 100%;
        display: flex;
        flex-direction: column;
      }
      *,
      *:before,
      *:after {
        box-sizing: inherit;
      }
      .grecaptcha-badge {
        visibility: hidden;
      }
    `}
  />
);

/* Source provides a global utility that manages the appearance of focus styles. When enabled,
 * focus styles will be hidden while the user interacts using the mouse.
 * They will appear when the tab key is pressed to begin keyboard navigation. */
const FocusManagerDecorator = (storyFn) => {
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

const decorators = [
  withThemeFromJSXProvider({
    GlobalStyles,
  }),
  FocusManagerDecorator,
  clientStateDecorator,
];

const parameters = {
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

const preview = {
  decorators,
  parameters,
};

export default preview;
