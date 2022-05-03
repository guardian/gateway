import React from 'react';

import { MjmlSection, MjmlColumn, MjmlImage } from 'mjml-react';
import { brandBackground } from '@guardian/source-foundations';

// header should be 72px in height, using the width 192px of the design, and 6px of top/bottom padding
// we get to 72px height, with the image dimensions itself being 250px height
export const Header = () => (
  <MjmlSection
    background-color={brandBackground.primary}
    padding="0 24px"
    fullWidth
  >
    <MjmlColumn>
      <MjmlImage
        padding="6px 0px"
        width="149px"
        align="right"
        src="https://uploads.guim.co.uk/2022/05/04/guardian.logo.white.med.250.png"
      />
    </MjmlColumn>
  </MjmlSection>
);
