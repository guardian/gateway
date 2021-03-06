import React from 'react';

import { Mjml, MjmlStyle, MjmlHead, MjmlBody } from 'mjml-react';

type Props = { children: React.ReactNode };

export const Page = ({ children }: Props) => (
  <Mjml>
    <MjmlHead>
      <MjmlStyle>
        {`
      @font-face{font-family:GT Guardian Titlepiece;font-weight:700;src:url(https://assets.guim.co.uk/static/frontend/fonts/guardian-titlepiece/noalts-not-hinted/GTGuardianTitlepiece-Bold.woff) format('woff'),url(https://assets.guim.co.uk/static/frontend/fonts/guardian-titlepiece/noalts-not-hinted/GTGuardianTitlepiece-Bold.ttf) format('ttf');font-display:swap;}
      @font-face{font-family:GH Guardian Headline;font-weight:700;src:url(https://assets.guim.co.uk/static/frontend/fonts/guardian-headline/noalts-not-hinted/GHGuardianHeadline-Bold.woff) format('woff'),url(https://assets.guim.co.uk/static/frontend/fonts/guardian-headline/noalts-not-hinted/GHGuardianHeadline-Bold.ttf) format('ttf');font-display:swap;}
      @font-face{font-family:GH Guardian Headline;font-weight:500;src:url(https://assets.guim.co.uk/static/frontend/fonts/guardian-headline/noalts-not-hinted/GHGuardianHeadline-Medium.woff) format('woff'),url(https://assets.guim.co.uk/static/frontend/fonts/guardian-headline/noalts-not-hinted/GHGuardianHeadline-Medium.ttf) format('ttf');font-display:swap;}
      @font-face{font-family:GH Guardian Headline;font-weight:500;font-style:italic;src:url(https://assets.guim.co.uk/static/frontend/fonts/guardian-headline/noalts-not-hinted/GHGuardianHeadline-MediumItalic.woff) format('woff'),url(https://assets.guim.co.uk/static/frontend/fonts/guardian-headline/noalts-not-hinted/GHGuardianHeadline-MediumItalic.ttf) format('ttf');font-display:swap;}
      @font-face{font-family:GH Guardian Headline;font-weight:300;src:url(https://assets.guim.co.uk/static/frontend/fonts/guardian-headline/noalts-not-hinted/GHGuardianHeadline-Light.woff) format('woff'),url(https://assets.guim.co.uk/static/frontend/fonts/guardian-headline/noalts-not-hinted/GHGuardianHeadline-Light.ttf) format('ttf');font-display:swap;}
      @font-face{font-family:GH Guardian Headline;font-weight:300;font-style:italic;src:url(https://assets.guim.co.uk/static/frontend/fonts/guardian-headline/noalts-not-hinted/GHGuardianHeadline-LightItalic.woff) format('woff'),url(https://assets.guim.co.uk/static/frontend/fonts/guardian-headline/noalts-not-hinted/GHGuardianHeadline-LightItalic.ttf) format('ttf');font-display:swap;}
      @font-face{font-family:GuardianTextEgyptian;font-weight:700;src:url(https://assets.guim.co.uk/static/frontend/fonts/guardian-textegyptian/noalts-not-hinted/GuardianTextEgyptian-Bold.woff) format('woff'),url(https://assets.guim.co.uk/static/frontend/fonts/guardian-textegyptian/noalts-not-hinted/GuardianTextEgyptian-Bold.ttf) format('ttf');font-display:swap;}
      @font-face{font-family:GuardianTextEgyptian;font-weight:700;font-style:italic;src:url(https://assets.guim.co.uk/static/frontend/fonts/guardian-textegyptian/noalts-not-hinted/GuardianTextEgyptian-BoldItalic.woff) format('woff'),url(https://assets.guim.co.uk/static/frontend/fonts/guardian-textegyptian/noalts-not-hinted/GuardianTextEgyptian-BoldItalic.ttf) format('ttf');font-display:swap;}
      @font-face{font-family:GuardianTextEgyptian;font-weight:400;src:url(https://assets.guim.co.uk/static/frontend/fonts/guardian-textegyptian/noalts-not-hinted/GuardianTextEgyptian-Regular.woff) format('woff'),url(https://assets.guim.co.uk/static/frontend/fonts/guardian-textegyptian/noalts-not-hinted/GuardianTextEgyptian-Regular.ttf) format('ttf');font-display:swap;}
      @font-face{font-family:GuardianTextEgyptian;font-weight:400;font-style:italic;src:url(https://assets.guim.co.uk/static/frontend/fonts/guardian-textegyptian/noalts-not-hinted/GuardianTextEgyptian-RegularItalic.woff) format('woff'),url(https://assets.guim.co.uk/static/frontend/fonts/guardian-textegyptian/noalts-not-hinted/GuardianTextEgyptian-RegularItalic.ttf) format('ttf');font-display:swap;}
      @font-face{font-family:GuardianTextSans;font-weight:700;src:url(https://assets.guim.co.uk/static/frontend/fonts/guardian-textsans/noalts-not-hinted/GuardianTextSans-Bold.woff) format('woff'),url(https://assets.guim.co.uk/static/frontend/fonts/guardian-textsans/noalts-not-hinted/GuardianTextSans-Bold.ttf) format('ttf');font-display:swap;}
      @font-face{font-family:GuardianTextSans;font-weight:400;src:url(https://assets.guim.co.uk/static/frontend/fonts/guardian-textsans/noalts-not-hinted/GuardianTextSans-Regular.woff) format('woff'),url(https://assets.guim.co.uk/static/frontend/fonts/guardian-textsans/noalts-not-hinted/GuardianTextSans-Regular.ttf) format('ttf');font-display:swap;}
      @font-face{font-family:GuardianTextSans;font-weight:400;font-style:italic;src:url(https://assets.guim.co.uk/static/frontend/fonts/guardian-textsans/noalts-not-hinted/GuardianTextSans-RegularItalic.woff) format('woff'),url(https://assets.guim.co.uk/static/frontend/fonts/guardian-textsans/noalts-not-hinted/GuardianTextSans-RegularItalic.ttf) format('ttf');font-display:swap;}html{height:100%;}body{height:100%;}#app{min-height:100%;height:100%;display:-webkit-box;display:-webkit-flex;display:-ms-flexbox;display:flex;-webkit-flex-direction:column;-ms-flex-direction:column;flex-direction:column;}*{box-sizing:border-box;}
    `}
      </MjmlStyle>
    </MjmlHead>
    <MjmlBody>{children}</MjmlBody>
  </Mjml>
);
