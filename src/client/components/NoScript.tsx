import React from 'react';
import { ErrorSummary } from '@guardian/source-development-kitchen/react-components';
import locations from '@/shared/lib/locations';
import { SUPPORT_EMAIL } from '@/shared/model/Configuration';
import {
	errorContextSpacing,
	errorContextLastTypeSpacing,
	errorMessageStyles,
} from '@/client/styles/Shared';

// don't use any non-default html tags, or react components,
// inside the context within the noscript tag, as this
// has the possibility to break styling outside of the noscript tag
export const NoScriptContext = () => (
	<>
		<p css={errorContextSpacing}>
			We use JavaScript to provide a seamless and secure authentication
			experience. Please{' '}
			<a
				href="https://www.whatismybrowser.com/guides/how-to-enable-javascript/"
				rel="noopener noreferrer"
			>
				enable JavaScript
			</a>{' '}
			in your browser settings and reload the page.
		</p>
		<p css={[errorContextSpacing, errorContextLastTypeSpacing]}>
			For further help please contact our customer service team at{' '}
			<a href={locations.SUPPORT_EMAIL_MAILTO}>{SUPPORT_EMAIL}</a>
		</p>
	</>
);

export const NoScript = () => {
	return (
		<noscript>
			<ErrorSummary
				message="Please enable JavaScript in your browser"
				context={<NoScriptContext />}
				cssOverrides={errorMessageStyles}
			/>
		</noscript>
	);
};
