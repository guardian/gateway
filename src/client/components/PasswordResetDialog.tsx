import React from 'react';
import { TextInput } from '@guardian/src-text-input';
import { Button, buttonReaderRevenue } from '@guardian/src-button';
import { SvgArrowRightStraight } from '@guardian/src-icons';
import { css } from '@emotion/core';
import { space } from '@guardian/src-foundations';
import { ThemeProvider } from 'emotion-theming';
import { Routes } from '@/shared/model/Routes';
import {
  resetPasswordBox,
  header,
  main,
  pHeader,
  pMain,
} from '@/client/styles/Reset';

interface PasswordResetDialogProps {
  email?: string;
  headerText: string;
  bodyText: string;
  buttonText: string;
  queryString?: string;
}

const textInput = css`
  margin-bottom: ${space[3]}px;
`;

const form = css`
  padding: ${space[2]}px 0px;
`;

export const PasswordResetDialog = ({
  email = '',
  headerText,
  bodyText,
  buttonText,
  queryString = '',
}: PasswordResetDialogProps) => {
  return (
    <div css={resetPasswordBox}>
      <div css={header}>
        <p css={pHeader}>{headerText}</p>
      </div>
      <div css={main}>
        <p css={pMain}>{bodyText}</p>
        <form css={form} method="post" action={`${Routes.RESET}${queryString}`}>
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
              {buttonText}
            </Button>
          </ThemeProvider>
        </form>
      </div>
    </div>
  );
};
