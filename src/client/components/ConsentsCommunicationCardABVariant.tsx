import React, { FunctionComponent } from 'react';
import { titlepiece, textSans } from '@guardian/src-foundations/typography';
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
  border: 1px solid white;
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
  font-size: 17px;
  margin: 0;
  max-width: 640px;
`;

const communicationCardCheckboxContainer = css`
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: ${space[2]}px ${space[3]}px;
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
