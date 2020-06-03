import React, { useContext } from 'react';
import { TextInput } from '@guardian/src-text-input';
import { Button, buttonReaderRevenue } from '@guardian/src-button';
import { SvgArrowRightStraight } from '@guardian/src-svgs';
import { css } from '@emotion/core';
import { space } from '@guardian/src-foundations';
import { ThemeProvider } from 'emotion-theming';
import { GlobalState } from '@/shared/model/GlobalState';
import { GlobalStateContext } from '@/client/components/GlobalState';
import { Routes } from '@/shared/model/Routes';
import {
  resetPasswordBox,
  header,
  main,
  pHeader,
  pMain,
} from '@/client/styles/Reset';

const textInput = css`
  margin-bottom: ${space[3]}px;
`;

const form = css`
  padding: ${space[2]}px 0px;
`;

export const ResetPasswordPage = () => {
  const globalState: GlobalState = useContext(GlobalStateContext);
  const { email = '' } = globalState;

  return (
    <div css={resetPasswordBox}>
      <div css={header}>
        <p css={pHeader}>Forgotten or need to set your password?</p>
      </div>
      <div css={main}>
        <p css={pMain}>We will email you a link to reset it.</p>
        <form css={form} method="post" action={Routes.RESET}>
          <TextInput
            css={textInput}
            label="Email address"
            name="email"
            type="email"
            defaultValue={email}
          />
          <ThemeProvider theme={buttonReaderRevenue}>
            <Button
              type="submit"
              icon={<SvgArrowRightStraight />}
              iconSide="right"
            >
              Reset Password
            </Button>
          </ThemeProvider>
        </form>
      </div>
    </div>
  );
};
