import React, { FunctionComponent } from 'react';
import {
  neutral,
  space,
  from,
  brand,
  headline,
  body,
} from '@guardian/source-foundations';
import { css, SerializedStyles } from '@emotion/react';
import {
  CheckboxGroup,
  Checkbox,
  SvgEnvelope,
} from '@guardian/source-react-components';
import { greyBorderBottom, greyBorderTop } from '../styles/Consents';

interface CommunicationCardProps {
  title: string;
  titleLevel?: 1 | 2 | 3 | 4 | 5;
  body: string;
  value: string;
  checked: boolean;
  image?: string;
  cssOverrides?: SerializedStyles;
}

const communicationCardHeadingText = css`
  color: ${brand[400]};
  margin: 0;
  ${headline.medium()};
  font-size: 20px;
  letter-spacing: 0.3px;
  ${from.tablet} {
    padding-left: ${space[3]}px;
  }
`;

const communicationCardBodyContainer = css`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  flex: 1 1 auto;
  padding: ${space[3]}px 0 6px;
  ${from.tablet} {
    padding: ${space[3]}px ${space[3]}px 6px ${space[3]}px;
  }
`;

const communicationCardBodyText = css`
  color: ${neutral[20]};
  margin: 0;
  ${body.medium()}
  max-width: 640px;
`;

const communicationCardCheckboxContainer = css`
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: ${space[2]}px 0;
  ${from.tablet} {
    padding: ${space[2]}px ${space[3]}px;
  }
`;

// TODO: hacked background colour, should be fixed in future source checkbox implementation
const communicationCardCheckbox = css`
  background: ${neutral[100]};
  z-index: 0 !important;
`;

const communicationCardInfoContainer = css`
  display: flex;
  flex-direction: column;
  ${from.tablet} {
    flex-direction: row;
    ${greyBorderBottom}
  }
`;

// min-height here is due to IE being strange
// https://stackoverflow.com/questions/8673356/ie-doesnt-support-height-auto-for-images-what-should-i-use
const img = css`
  width: 100%;
  height: auto;
  min-height: 1px;
  ${from.tablet} {
    width: auto;
    height: 162px;
  }
`;

const iconStyles = css`
  display: inline-block;
  background-color: ${brand[400]};
  border-radius: 100%;
  margin-top: ${space[2]}px;
  padding: 2px;
  svg {
    display: block;
    fill: ${neutral[100]};
    height: 22px;
    width: 22px;
  }
`;

const blueBorderBottom = css`
  border-bottom: 1px solid ${brand[400]};
  padding-bottom: ${space[1]}px;
`;

// IE11 doesn't know that block-level elements shouldn't overflow their parent
const ieFlexOverflowFix = css`
  width: 100%;
`;

export const CommunicationCard: FunctionComponent<CommunicationCardProps> = ({
  title,
  titleLevel = 3,
  body,
  value,
  image,
  checked,
}) => {
  const HeadingTag = `h${titleLevel}` as const;

  return (
    <div css={[greyBorderTop, blueBorderBottom, ieFlexOverflowFix]}>
      <div css={[communicationCardInfoContainer]}>
        <img css={img} src={image} alt={title} />
        <div css={ieFlexOverflowFix}>
          <HeadingTag css={communicationCardHeadingText}>{title}</HeadingTag>
          <div css={communicationCardBodyContainer}>
            <p css={communicationCardBodyText}>{body}</p>
          </div>
          <div css={communicationCardCheckboxContainer}>
            <CheckboxGroup name={value} label={title} hideLabel={true}>
              <Checkbox
                cssOverrides={communicationCardCheckbox}
                value={value}
                label="Yes, sign me up"
                defaultChecked={checked}
              />
            </CheckboxGroup>
          </div>
        </div>
      </div>
      <span css={iconStyles}>
        <SvgEnvelope />
      </span>
    </div>
  );
};
