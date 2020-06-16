import React from 'react';
import { TextInput } from '@guardian/src-text-input';
import { Button } from '@guardian/src-button';
import { SvgArrowRightStraight } from '@guardian/src-icons';
import { css } from '@emotion/core';
import { space } from '@guardian/src-foundations';
import { Routes } from '@/shared/model/Routes';
import { header, main, h2, p } from '@/client/styles/Reset';

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
    <div>
      <div css={header}>
        <h2 css={h2}>{headerText}</h2>
      </div>
      <div css={main}>
        <p css={p}>{bodyText}</p>
        <form css={form} method="post" action={`${Routes.RESET}${queryString}`}>
          <TextInput
            css={textInput}
            label="Email address"
            name="email"
            type="email"
            defaultValue={email}
          />
          <Button
            type="submit"
            icon={<SvgArrowRightStraight />}
            iconSide="right"
          >
            {buttonText}
          </Button>
        </form>
      </div>
    </div>
  );
};
