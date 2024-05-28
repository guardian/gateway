import React from 'react';
import { space } from '@guardian/source/foundations';
import { errorContextSpacing } from '@/client/styles/Shared';
import locations from '@/shared/lib/locations';
import { SUPPORT_EMAIL } from '@/shared/model/Configuration';

export const DetailedRecaptchaError = () => (
	<>
		<p css={errorContextSpacing}>
			If the problem persists please try the following:
		</p>
		<ul css={errorContextSpacing}>
			<li>Ensure that JavaScript is enabled</li>
			<li>Temporarily disable VPNs and content blockers</li>
			<li>Disable your browser plugins</li>
			<li>Update your browser</li>
		</ul>
		<p css={[errorContextSpacing, { marginBottom: `${space[3]}px` }]}>
			For further help please contact our customer service team at{' '}
			<a href={locations.SUPPORT_EMAIL_MAILTO}>{SUPPORT_EMAIL}</a>
		</p>
	</>
);
