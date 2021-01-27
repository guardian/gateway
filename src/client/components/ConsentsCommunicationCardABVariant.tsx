import React, { FunctionComponent } from 'react';
import {
  titlepiece,
  textSans,
  body,
} from '@guardian/src-foundations/typography';
import { css, SerializedStyles } from '@emotion/react';
import { space, palette } from '@guardian/src-foundations';
import { CheckboxGroup, Checkbox } from '@guardian/src-checkbox';
import { from } from '@guardian/src-foundations/mq';

interface CommunicationCardProps {
  title: string;
  body: string;
  value: string;
  checked: boolean;
  image?: string;
  cssOverrides?: SerializedStyles;
}

const communicationCard = css`
  display: flex;
  color: ${palette.text.ctaPrimary};
  flex-direction: column;
  width: 100%;
  margin: 0px 0px ${space[4]}px 0px;
  background-color: ${palette.background.ctaPrimary};
`;

const communicationCardHeadingImage = (image: string) => css`
  background-image: url('${image}');
  background-position: bottom 0px right 0px;
  background-repeat: no-repeat;
  background-size: 75%;
`;

const communicationCardHeadingContainer = (image?: string) => css`
  background-color: ${palette.background.ctaPrimary};

  ${image && communicationCardHeadingImage(image)}

  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 14px ${space[3]}px 14px ${space[3]}px;
  ${from.tablet} {
    height: auto;
  }
  & p {
    ${textSans.medium()}
    font-size: 15px;
    margin-top: 12px;
    margin-bottom: 0;
  }
`;

const communicationCardHeadingText = css`
  margin: 0;
  ${titlepiece.small()};
  font-size: 24px;
  letter-spacing: 0.3px;
`;

const communicationCardBodyContainer = css`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  flex: 1 1 auto;
  padding: ${space[3]}px ${space[3]}px 6px ${space[3]}px;
`;

const communicationCardBodyText = css`
  ${body.medium()}
  margin: 0;
  max-width: 640px;
`;

const communicationCardCheckboxContainer = css`
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: ${space[2]}px ${space[3]}px;
`;

const envelope = css`
  --h: 130px;
  --w: 206px;
  --offset: 37px;

  height: var(--h);
  width: var(--w);
  background-color: purple;
  position: relative;
  box-sizing: content-box;
  transform-style: preserve-3d;
  margin: 0 auto;
  margin-top: calc(var(--h) / 2 - var(--offset) + 41px);
  margin-bottom: calc(var(--offset) + 35px);

  &:before {
    content: ' ';
    display: block;
    top: calc(-1 * var(--h) + var(--offset));
    position: absolute;
    border-left: calc(var(--w) / 2) solid transparent;
    border-right: calc(var(--w) / 2) solid transparent;
    border-top: calc(var(--h) / 2) solid transparent;
    border-bottom: calc(var(--h) / 2) solid white;
    width: var(--w);
    height: var(--h);
    transform: translateZ(-1px);
  }

  &:after {
    content: ' ';
    display: block;
    top: var(--offset);
    position: absolute;
    border-left: calc(var(--w) / 2) solid white;
    border-right: calc(var(--w) / 2) solid white;
    border-top: calc(var(--h) / 2) solid transparent;
    border-bottom: calc(var(--h) / 2) solid white;
    width: var(--w);
    height: var(--h);
  }
`;

// @TODO: If this variant wins, this and possible the entire style of the card component can be set using the 'brand'
// theme in Source.
const checkbox = css`
  color: inherit;
  & label div {
    color: inherit !important;
  }
  & input {
    border-color: ${palette.text.ctaPrimary} !important;
  }
  & label span:before,
  & label span:after {
    background-color: ${palette.text.ctaPrimary};
  }
`;

export const CommunicationCardABVariant: FunctionComponent<CommunicationCardProps> = ({
  title,
  body,
  value,
  image,
  checked,
  cssOverrides,
}) => {
  return (
    <div css={[communicationCard, cssOverrides]}>
      <div css={communicationCardHeadingContainer(image)}>
        <div css={envelope}>placeholder</div>
        <h3 css={communicationCardHeadingText}>
          Sign up to receive an email with our latest offers.
        </h3>
        <p>{title}</p>
      </div>
      <div css={communicationCardBodyContainer}>
        <p css={communicationCardBodyText}>{body}</p>
      </div>
      <div css={communicationCardCheckboxContainer}>
        <CheckboxGroup
          cssOverrides={checkbox}
          name={value}
          label={title}
          hideLabel={true}
        >
          <Checkbox value={value} label="Sign Up" defaultChecked={checked} />
        </CheckboxGroup>
      </div>
    </div>
  );
};
