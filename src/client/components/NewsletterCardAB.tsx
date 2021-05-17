import React, { FunctionComponent } from 'react';
import { SerializedStyles, css } from '@emotion/react';
import { CheckboxGroup, Checkbox } from '@guardian/src-checkbox';
import { brand, space, palette } from '@guardian/src-foundations';
import {
  titlepiece,
  textSans,
  body,
} from '@guardian/src-foundations/typography';
import { CONSENTS_MAIN_COLOR } from '@/client/layouts/shared/Consents';
import { NewsLetter } from '@/shared/model/Newsletter';
import { from } from '@guardian/src-foundations/mq';
import { NEWSLETTER_IMAGES } from '@/client/models/Newsletter';

interface NewsletterCardProps {
  newsletter: NewsLetter;
  cssOverrides?: SerializedStyles;
}

const image = (id?: string) => {
  const base = css`
    display: block;
    height: 0;
    width: 0;

    ${from.desktop} {
      height: 100%;
      width: 100%;
      flex: 1 1 auto;
    }
  `;

  if (id) {
    const imagePath = NEWSLETTER_IMAGES[id];

    if (imagePath) {
      return css`
        ${base}
        background-image: url('${imagePath}');
        background-position: center;
        background-repeat: no-repeat;
        background-size: cover;
        padding: 55% 100% 0 0;

        ${from.desktop} {
          padding: 0;
        }
      `;
    }
  }

  return base;
};

const h1 = css`
  color: ${brand[400]};
  ${titlepiece.small()};
  margin: ${space[2]}px 0 ${space[1]}px 0;
  //Override
  font-size: 24px;
`;

const h2 = css`
  color: ${brand[600]};
  ${textSans.small()};
  margin: 0;
`;

const p = css`
  color: ${brand[400]};
  margin: 0 0 ${space[3]}px;
  ${body.small()};
  flex: 2 0 auto;
`;

const borderDiv = css`
  flex: 1 0 auto;
  display: flex;
  flex-direction: column;
  border-left: 2px solid ${brand[500]};
  padding: ${space[3]}px ${space[3]}px ${space[3]}px ${space[3]}px;

  ${from.desktop} {
    flex: 1 1 auto;
    width: 100%;
    border-left: 0;
  }
`;

const article = css`
  display: flex;
  flex-direction: column;
  background-color: ${CONSENTS_MAIN_COLOR};
  border: 0;

  ${from.desktop} {
    flex-direction: row-reverse;
    border-top: 2px solid ${brand[500]};
  }
`;

const subtitleDiv = css`
  display: flex;
  align-items: center;
  margin: 0 0 ${space[6]}px 0;
  & > svg {
    margin: 0 ${space[1]}px 0 0;
  }
`;

// @TODO: hacked background colour, should be fixed in future source checkbox implementation
const checkBoxBackgroundColorBugFix = css`
  background: ${palette.neutral[100]};
  z-index: 0 !important;
`;

const clockSVG = (
  <svg
    css={{ fill: brand[400] }}
    width="15px"
    height="15px"
    viewBox="0 0 11 11"
  >
    <path d="M5.4 0C2.4 0 0 2.4 0 5.4s2.4 5.4 5.4 5.4 5.4-2.4 5.4-5.4S8.4 0 5.4 0zm3 6.8H4.7V1.7h.7L6 5.4l2.4.6v.8z" />
  </svg>
);

// @AB_TEST: Single Newsletter Test Card
export const ABNewsletterCard: FunctionComponent<NewsletterCardProps> = (
  props,
) => {
  const { description, frequency, name } = props.newsletter;
  const subtitle = frequency ? (
    <div css={subtitleDiv}>
      {clockSVG}
      <h2 css={h2}>{frequency}</h2>
    </div>
  ) : null;
  return (
    <article css={[article, props.cssOverrides]}>
      <div css={image(props.newsletter.id)} />
      <div css={borderDiv}>
        <h1 css={h1}>{name}</h1>
        {subtitle}
        <p css={p}>{description}</p>
        <CheckboxGroup name={props.newsletter.id} label={name} hideLabel={true}>
          {/* if the Checkbox is unchecked, this hidden empty value will be sent in form submit POST,
          to signal possible unsubscribe event */}
          <input type="hidden" name={props.newsletter.id} value="" />
          <Checkbox
            value={props.newsletter.id}
            cssOverrides={checkBoxBackgroundColorBugFix}
            label="Sign Up"
            defaultChecked={props.newsletter.subscribed}
          />
        </CheckboxGroup>
      </div>
    </article>
  );
};
