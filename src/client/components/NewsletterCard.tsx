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
  news,
  culture,
} from '@guardian/source-foundations';
import { NewsLetter } from '@/shared/model/Newsletter';
import { NEWSLETTER_IMAGES } from '@/client/models/Newsletter';

interface NewsletterCardProps {
  newsletter: NewsLetter;
  cssOverrides?: SerializedStyles;
  frequency?: string;
}

const image = (id?: string) => {
  const base = css`
    display: block;
    height: 0;
    width: 0;
  `;

  if (id) {
    const imagePath = NEWSLETTER_IMAGES[id];

    if (imagePath) {
      return css`
        ${base}
        padding: 55% 100% 0 0;
        background-image: url('${imagePath}');
        background-position: center;
        background-repeat: no-repeat;
        background-size: cover;
        ${from.tablet} {
          padding: 28% 38% 0 0;
        }
      `;
    }
  }

  return css`
    ${base}
    padding: 55% calc(100% - 6px) 0 0;
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
  `;
};

const h1 = css`
  color: ${brand[400]};
  ${headline.small()};
  margin: ${space[2]}px 0 ${space[1]}px 0;
  /* Override */
  font-size: 24px;
`;

const h2 = css`
  color: ${brand[600]};
  ${textSans.small({ fontWeight: 'bold' })};
  font-size: 12px;
  margin: 0;
`;

const p = css`
  color: ${neutral[0]};
  margin: 0 0 ${space[3]}px;
  ${body.medium()};
  flex: 1;
`;

const article = css`
  display: flex;
  flex-direction: column;
`;

const spaceBottom = css`
  margin-bottom: ${space[5]}px;
`;

// @TODO: hacked background colour, should be fixed in future source checkbox implementation
const checkBoxBackgroundColorBugFix = css`
  background: ${neutral[100]};
  z-index: 0 !important;
`;

export const iconStyles = css`
  width: fit-content;
  border-radius: 100%;
  padding: 2px;
  svg {
    display: block;
    fill: ${neutral[100]};
    height: 22px;
    width: 22px;
  }
  margin-right: ${space[1]}px;
`;

const descriptionBlock = css`
  ${from.tablet} {
    display: flex;
    border-top: 1px solid ${neutral[86]};
    border-bottom: 1px solid ${neutral[86]};
  }
`;

const infoGroup = css`
  position: relative;
  display: flex;
  flex-direction: column;

  ${from.tablet} {
    padding-left: ${space[5]}px;
  }
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

const idColor = (id: string) => {
  if (id.includes('today')) {
    return news[400];
  }
  if (id === 'the-long-read') {
    return brand[400];
  }
  if (id === 'green-light') {
    return news[400];
  }
  if (id === 'bookmarks') {
    return culture[400];
  }
  return brand[400];
};

export const NewsletterCard: FunctionComponent<NewsletterCardProps> = (
  props,
) => {
  const { description, frequency, name, nameId } = props.newsletter;

  return (
    <article
      css={[
        article,
        spaceBottom,
        `border-bottom: 1px solid ${idColor(nameId)}}`,
        props.cssOverrides,
      ]}
    >
      <div css={descriptionBlock}>
        <div css={image(props.newsletter.id)} />
        <div css={[infoGroup, ieFlexOverflowFix]}>
          <h1 css={[h1, `color: ${idColor(nameId)}`]}>{name}</h1>
          <p css={p}>{description}</p>
          <CheckboxGroup
            name={props.newsletter.id}
            label={name}
            hideLabel={true}
          >
            {/* if the Checkbox is unchecked, this hidden empty value will be sent in form submit POST,
            to signal possible unsubscribe event */}
            <input type="hidden" name={props.newsletter.id} value="" />
            <Checkbox
              value={props.newsletter.id}
              cssOverrides={checkBoxBackgroundColorBugFix}
              label="Yes, sign me up"
              defaultChecked={props.newsletter.subscribed}
            />
          </CheckboxGroup>
        </div>
      </div>
      <div css={frequencyStyles}>
        <div css={[iconStyles, `background-color:${idColor(nameId)}`]}>
          <SvgEnvelope />
        </div>
        <h2 css={[h2, `color: ${idColor(nameId)}`]}>{frequency}</h2>
      </div>
    </article>
  );
};
