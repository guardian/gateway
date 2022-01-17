import React, { FunctionComponent } from 'react';
import {
  background,
  text,
  neutral,
  titlepiece,
  textSans,
  space,
  from,
} from '@guardian/source-foundations';
import { css, SerializedStyles } from '@emotion/react';
import { CheckboxGroup, Checkbox } from '@guardian/source-react-components';

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
  flex-direction: column;
  width: 100%;
  border: 1px solid white;
  margin: 0px 0px ${space[4]}px 0px;
`;

const communicationCardHeadingImage = (image: string) => css`
  background-image: url('${image}');
  background-position: bottom 0px right 0px;
  background-repeat: no-repeat;
  background-size: 75%;
`;

const communicationCardHeadingContainer = (image?: string) => css`
  background-color: ${background.ctaPrimary};

  ${image && communicationCardHeadingImage(image)}

  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 14px ${space[3]}px 14px ${space[3]}px;
  ${from.tablet} {
    height: auto;
  }
`;

const communicationCardHeadingText = css`
  color: ${text.ctaPrimary};
  margin: 0;
  ${titlepiece.small()};
  font-size: 20px;
  letter-spacing: 0.3px;
`;

const communicationCardBodyContainer = css`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  flex: 1 1 auto;
  background-color: #eaeef5;
  padding: ${space[3]}px ${space[3]}px 6px ${space[3]}px;
`;

const communicationCardBodyText = css`
  color: ${neutral[20]};
  margin: 0;
  ${textSans.medium()}
  max-width: 640px;
`;

const communicationCardCheckboxContainer = css`
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  background-color: #eaeef5;
  padding: ${space[2]}px ${space[3]}px;
`;

// TODO: hacked background colour, should be fixed in future source checkbox implementation
const communicationCardCheckbox = css`
  background: ${neutral[100]};
  z-index: 0 !important;
`;

export const CommunicationCard: FunctionComponent<CommunicationCardProps> = ({
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
        <h3 css={communicationCardHeadingText}>{title}</h3>
      </div>
      <div css={communicationCardBodyContainer}>
        <p css={communicationCardBodyText}>{body}</p>
      </div>
      <div css={communicationCardCheckboxContainer}>
        <CheckboxGroup name={value} label={title} hideLabel={true}>
          <Checkbox
            cssOverrides={communicationCardCheckbox}
            value={value}
            label="Sign Up"
            defaultChecked={checked}
          />
        </CheckboxGroup>
      </div>
    </div>
  );
};
