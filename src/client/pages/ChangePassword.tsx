import React, { useContext } from 'react';
import { useParams } from 'react-router-dom';
import { css } from '@emotion/core';
import { space } from '@guardian/src-foundations';
import { headline, textSans } from '@guardian/src-foundations/typography';
import { from } from '@guardian/src-foundations/mq';
import { TextInput } from '@guardian/src-text-input';
import { ThemeProvider } from 'emotion-theming';
import { buttonReaderRevenue, Button } from '@guardian/src-button';
import { SvgArrowRightStraight } from '@guardian/src-svgs';
import { GlobalState } from '@/shared/model/GlobalState';
import { GlobalStateContext } from '../components/GlobalState';
import { Routes } from '@/shared/model/Routes';

const h1 = css`
  margin: 0;
  padding: ${space[2]}px ${space[3]}px;
  ${headline.small()}

  ${from.tablet} {
    ${headline.large()}
  }
`;

const p = css`
  margin: 0;
  padding: ${space[2]}px ${space[3]}px;
  ${textSans.medium()}
`;

const form = css`
  padding: ${space[2]}px ${space[3]}px;
`;

const textInput = css`
  margin-bottom: ${space[3]}px;
`;

export const ChangePasswordPage = () => {
  const globalState: GlobalState = useContext(GlobalStateContext);
  const { email = '' } = globalState;
  const { token } = useParams();

  return (
    <>
      <h1 css={h1}>Please enter your new password for {email}</h1>
      <p css={p}>Reset Password Token: {token}</p>
      <form
        css={form}
        method="post"
        action={`${Routes.CHANGE_PASSWORD}/${token}`}
      >
        <TextInput
          css={textInput}
          label="New Password"
          supporting="Between 6 and 72 characters"
          name="password"
          type="password"
        />
        <TextInput
          css={textInput}
          label="Repeat Password"
          name="password_confirm"
          type="password"
        />
        <ThemeProvider theme={buttonReaderRevenue}>
          <Button
            type="submit"
            icon={<SvgArrowRightStraight />}
            iconSide="right"
          >
            Save Password
          </Button>
        </ThemeProvider>
      </form>
    </>
  );
};
