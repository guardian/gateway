import React from 'react';
import { INITIAL_VIEWPORTS } from '@storybook/addon-viewport';
import {
	withThemeFromJSXProvider,
	withThemeByClassName,
} from '@storybook/addon-themes';
import { Global, css } from '@emotion/react';
import { FocusStyleManager, breakpoints } from '@guardian/source/foundations';
import { fontFaces } from '@/client/lib/fonts';
import clientStateDecorator from './clientStateDecorator';
import { neutral } from '@guardian/source/foundations';
import { Theme } from '@/client/styles/Theme';
import { chromaticModes } from './modes';

const GlobalStyles = () => (
	<>
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
		<Theme />
	</>
);

/* Source provides a global utility that manages the appearance of focus styles. When enabled,
 * focus styles will be hidden while the user interacts using the mouse.
 * They will appear when the tab key is pressed to begin keyboard navigation. */
const FocusManagerDecorator = (/** @type {() => any} */ storyFn) => {
	React.useEffect(() => {
		FocusStyleManager.onlyShowFocusOnTabs();
	}, []);

	return <>{storyFn()}</>;
};

const decorators = [
	withThemeFromJSXProvider({
		GlobalStyles,
	}),
	FocusManagerDecorator,
	clientStateDecorator,
	withThemeByClassName({
		themes: {
			light: 'light-theme',
			dark: 'dark-theme',
		},
		defaultTheme: 'light',
	}),
];

const parameters = {
	controls: {
		matchers: {
			color: /(background|color)$/i,
			date: /Date$/,
		},
	},
	chromatic: chromaticModes,
	viewport: {
		viewports: {
			mobile: {
				name: 'Mobile',
				styles: { width: `${breakpoints.mobileMedium}px`, height: '800px' },
			},
			desktop: {
				name: 'Desktop',
				styles: { width: `${breakpoints.desktop}px`, height: '1000px' },
			},
			...INITIAL_VIEWPORTS,
		},
		defaultViewport: 'mobile',
	},
	layout: 'fullscreen',
};

const preview = {
	decorators,
	parameters,
};

export default preview;
