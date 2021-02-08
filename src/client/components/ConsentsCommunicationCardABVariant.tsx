import React, { FunctionComponent } from 'react';
import { body, headline } from '@guardian/src-foundations/typography';
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
  background-color: ${palette.background.ctaPrimary};
  ${from.tablet} {
    margin: 0;
    padding: ${space[6]}px 0;
  }
  ${from.desktop} {
    padding: ${space[6]}px 0 71px;
  }
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
  ${from.tablet} {
    height: auto;
  }
  & p {
    ${body.medium()};
    font-size: 18px;
    margin-top: 6px;
    margin-bottom: 0;
  }
`;

const communicationCardHeadingText = css`
  margin: 0;
  ${headline.medium({ fontWeight: 'bold' })};
  letter-spacing: 0.3px;
  ${from.tablet} {
    ${headline.small({ fontWeight: 'bold' })};
  }
  ${from.desktop} {
    ${headline.medium({ fontWeight: 'bold' })};
  }
`;

const communicationCardBodyContainer = css`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  flex: 1 1 auto;
  margin-top: ${space[9]}px;
`;

const communicationCardBodyText = css`
  ${body.small()}
  font-size: 16px;
  margin: 0;
  max-width: 640px;
  border-top: 1px solid rgb(246 246 246 / 0.4);
  padding-top: ${space[2]}px;
  ${from.desktop} {
    ${body.medium()};
  }
`;

const communicationCardCheckboxContainer = css`
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  margin-top: ${space[4]}px;
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

// @TODO: If this variant wins then the concept of the consent card maybe obsolete.
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
          Sign up to our email guide with our latest offers
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
