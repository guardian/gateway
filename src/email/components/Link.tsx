import { brand } from '@guardian/source/foundations';
import React from 'react';

type Props = { children: React.ReactNode; href: string };

export const Link = ({ children, href }: Props) => (
	<a
		style={{
			textDecoration: 'none !important',
			color: brand[500],
		}}
		href={href}
	>
		{children}
	</a>
);
