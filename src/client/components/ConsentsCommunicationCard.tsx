import React, { FunctionComponent } from 'react';
import { titlepiece, textSans } from '@guardian/src-foundations/typography';
import { css } from '@emotion/core';
import { space, palette } from '@guardian/src-foundations';
import { CheckboxGroup, Checkbox } from '@guardian/src-checkbox';
import { from } from '@guardian/src-foundations/mq';

interface CommunicationCardProps {
  titleTop?: string;
  titleBottom: string;
  body: string;
  value: string;
}

const communicationCard = css`
  display: flex;
  flex-direction: column;
  width: 100%;
  border: 1px solid white;
  margin: ${space[2]}px 0px;

  ${from.tablet} {
    margin: ${space[3]}px 0px;
    width: 50%;
  }

  ${from.wide} {
    width: calc(100% / 3);
  }
`;

const communicationCardHeadingContainer = css`
  background-color: ${palette.background.ctaPrimary};
  height: 45%;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: ${space[24]}px ${space[3]}px ${space[2]}px ${space[3]}px;
`;

const communicationCardHeadingText = css`
  color: ${palette.text.ctaPrimary};
  margin: 0;
  ${titlepiece.small()};
  font-size: 27px;
  line-height: 29px;
`;

const communicationCardBodyContainer = css`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  height: 40%;
  background-color: #eaeef5;
  padding: ${space[2]}px ${space[3]}px;
`;

const communicationCardBodyText = css`
  color: ${palette.text.primary};
  margin: 0;
  width: 70%;
  ${textSans.small({ lineHeight: 'tight' })};
`;

const communicationCardForm = css`
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  height: 15%;
  background-color: #eaeef5;
  padding: ${space[2]}px ${space[3]}px;
`;

export const CommunicationCard: FunctionComponent<CommunicationCardProps> = ({
  titleTop,
  titleBottom,
  body,
  value,
}) => {
  return (
    <div css={communicationCard}>
      <div css={communicationCardHeadingContainer}>
        <h3 css={communicationCardHeadingText}>
          {titleTop}
          <br />
          {titleBottom}
        </h3>
      </div>
      <div css={communicationCardBodyContainer}>
        <p css={communicationCardBodyText}>{body}</p>
      </div>
      <form css={communicationCardForm}>
        <CheckboxGroup name="emails">
          <Checkbox value={value} label="Sign Up" checked={false} />
        </CheckboxGroup>
      </form>
    </div>
  );
};
