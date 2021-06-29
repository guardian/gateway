import React from 'react';

import {
  Mjml,
  MjmlBody,
  MjmlColumn,
  MjmlHead,
  MjmlSection,
  MjmlStyle,
  MjmlText,
} from 'mjml-react';

import { Button } from '@/email/components/Button';
import { Header } from '@/email/components/Header';
import { SubHeader } from '@/email/components/SubHeader';
import { Text } from '@/email/components/Text';

type Props = {
  token: string;
};

export const ResetPassword = ({ token }: Props) => {
  console.log('token:', token);
  return (
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
      <MjmlBody>
        <Header />

        <SubHeader>Reset password</SubHeader>
        <Text>
          <p>Hello,</p>
          <p>You’ve requested us to send you a link to reset your password.</p>
          <p>Please click the button below to reset your password.</p>
        </Text>
        <MjmlSection background-color="#FFFFFF" padding="0">
          <MjmlColumn>
            <Button href="https://profile.theguardian.com">
              Reset password
            </Button>
          </MjmlColumn>
        </MjmlSection>

        <MjmlSection background-color="#EDEDED" padding="0">
          <MjmlColumn>
            <MjmlText
              color="#999999"
              font-size="10px"
              padding="0 10px"
              fontFamily="GuardianTextSans, Guardian Text Sans Web, Helvetica Neue, Helvetica, Arial, Lucida Grande, sans-serif"
            >
              <p>
                If you have any queries about this email please contact our
                customer services team at{' '}
                <a href="mailto:userhelp@theguardian.com">
                  userhelp@theguardian.com
                </a>
                .
              </p>
              <p>
                <strong>Your Data</strong> <br /> To find out what personal data
                we collect and how we use it, please visit our{' '}
                <a href="https://www.theguardian.com/help/privacy-policy">
                  privacy policy
                </a>
                .
              </p>
              <p>
                <strong>Terms & Conditions</strong> <br /> By registering with
                theguardian.com you agreed to abide by our terms of service, as
                described at{' '}
                <a href="https://www.theguardian.com/help/terms-of-service">
                  https://www.theguardian.com/help/terms-of-service
                </a>
                .
              </p>
              <p>
                Guardian News and Media Limited, Kings Place, 90 York Way,
                London, N1 9GU, United Kingdom
              </p>
            </MjmlText>
          </MjmlColumn>
        </MjmlSection>
      </MjmlBody>
    </Mjml>
  );
};
