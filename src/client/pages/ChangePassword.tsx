import React, { useContext } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { css } from '@emotion/core';
import { space } from '@guardian/src-foundations';
import { headline } from '@guardian/src-foundations/typography';
import { from } from '@guardian/src-foundations/mq';
import { TextInput } from '@guardian/src-text-input';
import { ThemeProvider } from 'emotion-theming';
import { buttonReaderRevenue, Button } from '@guardian/src-button';
import { SvgArrowRightStraight } from '@guardian/src-svgs';
import { GlobalState } from '@/shared/model/GlobalState';
import { GlobalStateContext } from '@/client/components/GlobalState';
import { Routes } from '@/shared/model/Routes';

const h1 = css`
  margin: 0;
  padding: ${space[2]}px ${space[3]}px;
  width: 100vw;
  overflow-wrap: break-word;
  ${headline.xsmall()}

  ${from.tablet} {
    width: auto;
    ${headline.large()}
  }
`;

const form = css`
  padding: ${space[2]}px ${space[3]}px;
`;

const textInput = css`
  margin-bottom: ${space[3]}px;
`;

export const ChangePasswordPage = () => {
  const { search } = useLocation();
  const globalState: GlobalState = useContext(GlobalStateContext);
  const { email = '', fieldErrors = [] } = globalState;
  const { token } = useParams();

  return (
    <>
      <h1 css={h1}>Please enter your new password for {email}</h1>
      <form
        css={form}
        method="post"
        action={`${Routes.CHANGE_PASSWORD}/${token}${search}`}
      >
        <TextInput
          css={textInput}
          label="New Password"
          supporting="Between 6 and 72 characters"
          name="password"
          type="password"
          error={
            fieldErrors.find(fieldError => fieldError.field === 'password')
              ?.message
          }
        />
        <TextInput
          css={textInput}
          label="Repeat Password"
          name="password_confirm"
          type="password"
          error={
            fieldErrors.find(
              fieldError => fieldError.field === 'password_confirm',
            )?.message
          }
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
