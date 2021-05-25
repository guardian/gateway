import React from 'react';
import { css } from '@emotion/react';
import locations from '@/client/lib/locations';
import { Link } from '@guardian/src-link';
import { PageBox } from '@/client/components/PageBox';
import { PageHeader } from '@/client/components/PageHeader';
import { PageBody } from '@/client/components/PageBody';
import { PageBodyText } from '@/client/components/PageBodyText';
import { Main } from '@/client/layouts/Main';
import { Header } from '@/client/components/Header';
import { Footer } from '@/client/components/Footer';

const link = css`
  display: inline-block;
`;

export const NotFoundPage = () => (
  <>
    <Header />
    <Main subTitle="Sign in">
      <PageBox>
        <PageHeader>Sorry – the page does not exist</PageHeader>
        <PageBody>
          <PageBodyText>
            You may have followed an outdated link, or have mistyped a URL. If
            you believe this to be an error, please{' '}
            <Link css={link} href={locations.REPORT_ISSUE}>
              report it
            </Link>
            .
          </PageBodyText>
        </PageBody>
      </PageBox>
    </Main>
    <Footer />
  </>
);
