import React from 'react';

import { brand } from '@guardian/source-foundations';

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
