import React from 'react';
import { PageBox } from '@/client/components/PageBox';
import { PageHeader } from '@/client/components/PageHeader';
import { PageBodyText } from '@/client/components/PageBodyText';
import { PageBody } from '@/client/components/PageBody';
import { linkButton } from '@/client/styles/Shared';
import { MainOld } from '@/client/layouts/MainOld';
import { Header } from '@/client/components/Header';
import { Footer } from '@/client/components/Footer';
import { SvgArrowRightStraight } from '@guardian/src-icons';
import { ExternalLinkButton } from '@/client/components/ExternalLink';

type ChangePasswordCompleteProps = {
  headerText: string;
  email?: string;
  returnUrl?: string;
};

export const ChangePasswordComplete = ({
  headerText,
  email,
  returnUrl = 'https://www.theguardian.com/uk',
}: ChangePasswordCompleteProps) => {
  return (
    <>
      <Header />
      <MainOld subTitle="Sign in">
        <PageBox>
          <PageHeader>{headerText}</PageHeader>
          <PageBody>
            {email ? (
              <PageBodyText>
                The password for <b>{email}</b> was successfully updated.
              </PageBodyText>
            ) : (
              <PageBodyText>
                The password for your account was successfully updated.
              </PageBodyText>
            )}
          </PageBody>
          <ExternalLinkButton
            css={linkButton}
            iconSide="right"
            nudgeIcon={true}
            icon={<SvgArrowRightStraight />}
            href={returnUrl}
          >
            Continue to the Guardian
          </ExternalLinkButton>
        </PageBox>
      </MainOld>
      <Footer />
    </>
  );
};
