import React, { FunctionComponent } from 'react';
import { SerializedStyles, css } from '@emotion/react';
import { space, neutral, from, textSans } from '@guardian/source-foundations';
import { ToggleSwitchInput } from './ToggleSwitchInput';
import { greyBorderTop, text } from '@/client/styles/Consents';
import { topMargin } from '@/client/styles/Shared';

const containerStyles = css`
  display: flex;
  flex-direction: column;
  border: ${neutral[0]} 3px dashed;
  border-radius: 12px;
  margin-bottom: ${space[3]}px;
  padding: ${space[2]}px;

  ${from.tablet} {
    padding: ${space[2]}px ${space[3]}px;
    p {
      padding-right: ${space[5]}px;
    }
  }

  :not(:last-of-type) {
    margin-bottom: ${space[5]}px;
  }
`;

const toggleSwitchAlignment = css`
  justify-content: space-between;
  span {
    align-self: flex-start;
    margin-top: ${space[2]}px;
  }
`;

const labelStyles = css`
  ${textSans.small()}
  font-weight: bold;
  span {
    margin-top: 2px !important;
  }
`;

const switchRow = css`
  border: 0;
  padding: 0;
  ${topMargin}
`;

interface ConsentCardProps {
  id: string;
  defaultChecked?: boolean;
  cssOverrides?: SerializedStyles;
}

export const ConsentCardOnboarding: FunctionComponent<ConsentCardProps> = ({
  id,
  defaultChecked,
  cssOverrides,
}) => {
  return (
    <article css={[containerStyles, cssOverrides]}>
      <p css={[text]}>
        As a benefit of creating an account, you&apos;ll receive Saturday
        Roundup, an exclusive newsletter free for four weeks, featuring
        highlights of the last week from the Guardian and ways to support our
        journalism.
      </p>
      <fieldset css={[switchRow, greyBorderTop]}>
        <ToggleSwitchInput
          id={id}
          defaultChecked={defaultChecked}
          label={'Receive Saturday Roundup'}
          cssOverrides={[labelStyles, toggleSwitchAlignment]}
        ></ToggleSwitchInput>
      </fieldset>
    </article>
  );
};
