import React, { FunctionComponent } from 'react';
import { SerializedStyles, css } from '@emotion/react';
import {
  CheckboxGroup,
  Checkbox,
  SvgEnvelope,
} from '@guardian/source-react-components';
import {
  brand,
  space,
  headline,
  textSans,
  body,
  neutral,
  from,
  between,
} from '@guardian/source-foundations';

const image = (imagePath?: string, imagePosition?: string) => {
  const base = css`
    display: block;
    height: 0;
    width: 0;
  `;

  if (imagePath) {
    return css`
      ${base}
      padding: 60% 100% 0 0;
      background-image: url('${imagePath}');
      background-position: ${imagePosition ?? 'center'};
      background-repeat: no-repeat;
      background-size: cover;
      ${from.tablet} {
        padding: 26% 38% 0 0;
      }
    `;
  }

  return css`
    ${base}
    padding: 60% calc(100% - 6px) 0 0;
    border: 3px solid black;
    background: linear-gradient(
        to top right,
        transparent 49.5%,
        black 49.5%,
        black 50.5%,
        transparent 50.5%,
        transparent 100%
      ),
      linear-gradient(
        to top left,
        transparent 49.5%,
        black 49.5%,
        black 50.5%,
        transparent 50.5%,
        transparent 100%
      );
    ${from.tablet} {
      padding: 26% calc(38% - 6px) 0 0;
    }
  `;
};

const titleHeading = (noImage?: boolean) => css`
  ${headline.small()};
  margin: ${space[noImage ? 1 : 3]}px 0 ${space[2]}px;
  font-size: 24px;

  ${between.tablet.and.desktop} {
    font-size: 20px;
  }

  ${from.tablet} {
    margin-top: ${space[1]}px;
  }
`;

const frequencyHeading = css`
  ${textSans.small({ fontWeight: 'bold' })};
  font-size: 12px;
  margin: 0;
`;

const p = css`
  margin: 0;
  ${body.medium()};
  flex-grow: 1;

  ${between.tablet.and.desktop} {
    ${body.small()};
  }
`;

const checkbox = css`
  label * {
    ${textSans.medium()};

    ${from.tablet} {
      ${textSans.small()};
    }
  }
`;

const article = css`
  display: flex;
  flex-direction: column;
`;

const spaceBottom = css`
  :not(:last-of-type) {
    margin-bottom: ${space[5]}px;
  }
`;

// @TODO: hacked background colour, should be fixed in future source checkbox implementation
const checkBoxBackgroundColorBugFix = css`
  background: ${neutral[100]};
  z-index: 0 !important;
`;

export const iconStyles = css`
  width: 23px;
  height: 23px;
  border-radius: 100%;
  padding: 2px;
  svg {
    display: block;
    fill: ${neutral[100]};
  }
  margin-right: ${space[1]}px;
`;

const descriptionBlock = (noTopBorderMobile?: boolean) => css`
  ${!noTopBorderMobile && `border-top: 1px solid ${neutral[86]};`}

  ${from.tablet} {
    display: flex;
    border-bottom: 1px solid ${neutral[86]};
    border-top: 1px solid ${neutral[86]};
  }
`;

const infoGroup = (noImage?: boolean) => css`
  position: relative;
  display: flex;
  flex-direction: column;

  ${!noImage &&
  `
    ${from.tablet} {
      padding-left: ${space[5]}px;
    }
  `}
`;

// IE11 doesn't know that block-level elements shouldn't overflow their parent
const ieFlexOverflowFix = css`
  width: 100%;
`;

const frequencyStyles = css`
  display: flex;
  align-items: center;
  padding: ${space[2]}px 0;
`;

type HeadingLevel = 1 | 2 | 3 | 4 | 5;

interface ConsentCardProps {
  title: string;
  titleLevel?: HeadingLevel;
  description: string;
  id: string;
  defaultChecked?: boolean;
  imagePath?: string;
  imagePosition?: string;
  noImage?: boolean;
  highlightColor?: string;
  frequency?: string;
  hiddenInput?: boolean;
  noTopBorderMobile?: boolean;
  cssOverrides?: SerializedStyles;
}

export const ConsentCard: FunctionComponent<ConsentCardProps> = ({
  title,
  titleLevel = 1,
  description,
  id,
  defaultChecked,
  imagePath,
  imagePosition,
  noImage,
  highlightColor = brand[400],
  frequency,
  hiddenInput = false,
  noTopBorderMobile,
  cssOverrides,
}) => {
  const TitleHeadingTag = `h${titleLevel}` as const;
  const frequencyHeadingLevel = Math.min(titleLevel + 1, 5) as HeadingLevel;
  const FrequencyHeadingTag = `h${frequencyHeadingLevel}` as const;
  const checkboxChildren = [
    <Checkbox
      value={id}
      cssOverrides={checkBoxBackgroundColorBugFix}
      label="Yes, sign me up"
      defaultChecked={defaultChecked}
      key="visible"
    />,
  ];

  if (hiddenInput) {
    /**
     * if the Checkbox is unchecked, this hidden empty value will be sent in
     * form submit POST, to signal possible unsubscribe event
     */
    checkboxChildren.push(
      <input type="hidden" name={id} value="" key="hidden" />,
    );
  }

  return (
    <article
      css={[
        article,
        spaceBottom,
        `border-bottom: 1px solid ${highlightColor}}`,
        cssOverrides,
      ]}
    >
      <div css={descriptionBlock(noTopBorderMobile)}>
        {!noImage && <div css={image(imagePath, imagePosition)} />}
        <div css={[infoGroup(noImage), ieFlexOverflowFix]}>
          <TitleHeadingTag
            css={[titleHeading(noImage), `color: ${highlightColor}`]}
          >
            {title}
          </TitleHeadingTag>
          <p css={p}>{description}</p>
          <CheckboxGroup name={id} cssOverrides={checkbox}>
            {checkboxChildren}
          </CheckboxGroup>
        </div>
      </div>
      <div css={frequencyStyles}>
        <div css={[iconStyles, `background-color:${highlightColor}`]}>
          <SvgEnvelope />
        </div>
        {frequency && (
          <FrequencyHeadingTag
            css={[frequencyHeading, `color: ${highlightColor}`]}
          >
            {frequency}
          </FrequencyHeadingTag>
        )}
      </div>
    </article>
  );
};
