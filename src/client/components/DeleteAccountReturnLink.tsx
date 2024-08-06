import { Divider } from '@guardian/source-development-kitchen/react-components';
import React from 'react';
import { ExternalLink } from '@/client/components/ExternalLink';
import { MainBodyText } from '@/client/components/MainBodyText';
import { divider } from '@/client/styles/Shared';
import locations from '@/shared/lib/locations';

export const DeleteAccountReturnLink = () => (
	<>
		<Divider spaceAbove="tight" size="full" cssOverrides={divider} />
		<MainBodyText>
			<ExternalLink href={locations.MANAGE_SETTINGS}>
				Return to account settings
			</ExternalLink>
		</MainBodyText>
	</>
);
