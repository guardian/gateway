import React from 'react';

import { MjmlSection, MjmlColumn, MjmlImage } from 'mjml-react';
import { brandBackground } from '@guardian/source-foundations';

// header should be 72px in height, using the width 144px of the design, and 6px of top/bottom padding
// we get to 72px height, with the image dimensions itself being 600x250 (anniversary logo)
export const Header = () => (
  <MjmlSection
    background-color={brandBackground.primary}
    padding="0 24px"
    fullWidth
  >
    <MjmlColumn>
      <MjmlImage
        padding="6px 0px"
        width="144px"
        align="right"
        src="https://s3-eu-west-1.amazonaws.com/identity-public-email-assets/logo.white.med.anniversary.png"
      />
    </MjmlColumn>
  </MjmlSection>
);
