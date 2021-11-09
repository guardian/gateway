import React from 'react';
import { css } from '@emotion/react';
import locations from '@/client/lib/locations';
import { PageBox } from '@/client/components/PageBox';
import { PageHeader } from '@/client/components/PageHeader';
import { PageBody } from '@/client/components/PageBody';
import { PageBodyText } from '@/client/components/PageBodyText';
import { Main } from '@/client/layouts/Main';
import { Header } from '@/client/components/Header';
import { Footer } from '@/client/components/Footer';
import { ExternalLink } from '@/client/components/ExternalLink';

const link = css`
  display: inline-block;
`;

export const UnexpectedErrorPage = () => (
  <>
    <Header />
    <Main subTitle="Sign in">
      <PageBox>
        <PageHeader>Sorry – an unexpected error occurred</PageHeader>
        <PageBody>
          <PageBodyText>
            An error occurred, please try again or{' '}
            <ExternalLink
              css={link}
              href={locations.REPORT_ISSUE}
              subdued={true}
            >
              report it
            </ExternalLink>
            .
          </PageBodyText>
        </PageBody>
      </PageBox>
    </Main>
    <Footer />
  </>
);
