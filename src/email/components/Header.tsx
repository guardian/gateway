import React from 'react';

import { MjmlSection, MjmlColumn, MjmlImage } from 'mjml-react';
import { brandBackground } from '@guardian/src-foundations/palette';

export const Header = () => (
  <MjmlSection
    background-color={brandBackground.primary}
    padding="0 12px"
    fullWidth
  >
    <MjmlColumn>
      <MjmlImage
        padding="13px 0px"
        width="144px"
        height="46px"
        align="right"
        src="https://s3-eu-west-1.amazonaws.com/identity-public-email-assets/logo.white.med.png"
      />
    </MjmlColumn>
  </MjmlSection>
);
