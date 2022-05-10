import React from 'react';

import { MainLayout } from '@/client/layouts/Main';
import { MainBodyText } from '@/client/components/MainBodyText';
import { css } from '@emotion/react';
import {
  headline,
  neutral,
  space,
  textSans,
} from '@guardian/source-foundations';
import { getAutoRow, gridItemYourData } from '../styles/Grid';
import { InfoSummary } from '@guardian/source-react-components-development-kitchen';
import { Link } from '@guardian/source-react-components';
import { MainForm } from '../components/MainForm';
import NameInputField, {
  useNameInputFieldError,
} from '../components/NameInputField';

const listBullets = css`
  list-style: none;
  padding-left: 0;
  text-indent: -18px; /* second line indentation */
  margin-left: 18px; /* second line indentation */
  li {
    font-size: 17px;
  }
  li:first-of-type {
    /* margin-top: 6px; */
  }
  /* ::marker is not supported in IE11 */
  li::before {
    content: '';
    margin-right: ${space[2]}px;
    margin-top: ${space[2]}px;
    background-color: ${neutral[86]};
    display: inline-block;
    width: 12px;
    height: 12px;
    border-radius: 50%;
  }
`;

export const text = css`
  margin: 0;
  ${textSans.medium()}
`;

const belowFormMarginTopSpacingStyle = css`
  margin-top: ${space[4]}px;
`;

const heading = css`
  color: ${neutral[0]};
  margin: 0 0 ${space[3]}px;
  ${headline.xxxsmall({ fontWeight: 'bold' })};
`;

export const JobsTermsAccept = () => {
  const autoYourDataRow = getAutoRow(1, gridItemYourData);

  const {
    nameFieldError,
    nameFieldErrorContext,
    setGroupError,
    setFormInvalidOnSubmit,
  } = useNameInputFieldError();

  return (
    <>
      <MainLayout
        pageHeader="Welcome to Guardian Jobs"
        errorOverride={nameFieldError}
        errorContext={nameFieldErrorContext}
      >
        <h2 css={[heading]}>
          Click &lsquo;continue&rsquo; to automatically use your existing
          Guardian account to sign in with Guardian Jobs
        </h2>
        <InfoSummary
          cssOverrides={belowFormMarginTopSpacingStyle}
          message={
            <MainBodyText>
              By activating your Guardian Jobs account you will receive a
              welcome email detailing the range of career-enhancing features
              that can be set up on our jobs site.
            </MainBodyText>
          }
          context={
            <>
              <p css={text}>These include:</p>
              <ul css={[text, listBullets, autoYourDataRow()]}>
                <li>
                  Creating a job alert and receiving relevant jobs straight to
                  your inbox
                </li>
                <li>
                  Shortlisting jobs that interest you so you can access them
                  later on different devices
                </li>
                <li>Uploading your CV and let employers find you</li>
              </ul>
            </>
          }
        />
        <MainForm
          submitButtonText="Continue"
          hasJobsTerms={true}
          formAction="/agree/GRS"
          onInvalid={() => setFormInvalidOnSubmit(true)}
        >
          <NameInputField onGroupError={setGroupError} />
        </MainForm>
        <MainBodyText cssOverrides={belowFormMarginTopSpacingStyle}>
          Or{' '}
          <Link subdued={true} href={'/signout'}>
            sign out
          </Link>{' '}
          to browse jobs anonymously.
        </MainBodyText>
      </MainLayout>
    </>
  );
};
