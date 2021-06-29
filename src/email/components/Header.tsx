import React from 'react';

import { MjmlSection, MjmlColumn, MjmlImage } from 'mjml-react';

export const Header = () => (
  <MjmlSection background-color="#EDEDED" padding="0">
    <MjmlColumn>
      <MjmlImage
        width="200px"
        align="right"
        src="https://s3-eu-west-1.amazonaws.com/identity-public-email-assets/logo.gh.gif"
      />
    </MjmlColumn>
  </MjmlSection>
);
