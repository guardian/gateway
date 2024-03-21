import React from 'react';
import { MainBodyText } from '@/client/components/MainBodyText';
import { ExternalLink } from '@/client/components/ExternalLink';
import locations from '@/shared/lib/locations';
import { Divider } from '@guardian/source-react-components-development-kitchen';
import { divider } from '@/client/styles/Shared';

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
