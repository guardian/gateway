import React from 'react';
import { space } from '@guardian/source-foundations';
import { errorContextSpacing } from '@/client/styles/Shared';

export const DetailedRecaptchaError = () => (
	<>
		<p css={errorContextSpacing}>
			If the problem persists please try the following:
		</p>
		<ul css={errorContextSpacing}>
			<li>Disable your browser plugins</li>
			<li>Ensure that JavaScript is enabled</li>
			<li>Update your browser</li>
		</ul>
		<p css={[errorContextSpacing, { marginBottom: `${space[3]}px` }]}>
			For further help please contact our customer service team at{' '}
			<a href="email:customer.help@theguardian.com">
				customer.help@theguardian.com
			</a>
		</p>
	</>
);
