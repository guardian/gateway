import React from 'react';

import { MjmlSection, MjmlColumn, MjmlImage } from 'mjml-react';
import { brandBackground } from '@guardian/source-foundations';

export const Header = () => (
  <MjmlSection background-color={brandBackground.primary} padding="0">
    <MjmlColumn>
      <MjmlImage
        width="200px"
        align="right"
        src="https://s3-eu-west-1.amazonaws.com/identity-public-email-assets/logo.white.med.png"
      />
    </MjmlColumn>
  </MjmlSection>
);
