import React from 'react';

import { brand } from '@guardian/src-foundations/palette';

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
