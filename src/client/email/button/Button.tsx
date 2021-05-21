import React from 'react';

import { MjmlButton } from 'mjml-react';

export const Button = ({ children }: { children: React.ReactNode }) => (
  <MjmlButton background-color="#052962" color="#FFFFFF" border-radius="24px">
    {children}
  </MjmlButton>
);
