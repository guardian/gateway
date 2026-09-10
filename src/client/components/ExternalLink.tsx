import {
	LinkButton,
	LinkButtonProps,
	LinkProps,
} from '@guardian/source/react-components';
import ThemedLink from '@/client/components/ThemedLink';

interface ExternalLinkProps extends LinkProps {
	openInNewTab?: boolean;
}

export const ExternalLink = ({
	openInNewTab = false,
	...props
}: ExternalLinkProps) => (
	<ThemedLink
		{...props}
		rel="noopener noreferrer"
		target={openInNewTab ? '_blank' : undefined}
	/>
);

export const ExternalLinkButton = (props: LinkButtonProps) => (
	<LinkButton {...props} rel="noopener noreferrer" />
);
