import { breakpoints } from '@guardian/src-foundations/mq';


const guardianViewports = {}

for ( const name in breakpoints) {
  guardianViewports[name] = {
		name,
		styles: {
			width: `${breakpoints[name]}px`,
			height: '800px',
		},
	}
}

export const parameters = {
  actions: { argTypesRegex: "^on[A-Z].*" },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
	viewport: {
		viewports: guardianViewports,
		defaultViewport: 'mobileMedium',
	},
}
