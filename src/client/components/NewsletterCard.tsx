import React, { FunctionComponent } from 'react';
import { SerializedStyles, css } from '@emotion/core';
import { CheckboxGroup, Checkbox } from '@guardian/src-checkbox';
import { brand, space, palette } from '@guardian/src-foundations';
import {
  titlepiece,
  textSans,
  body,
} from '@guardian/src-foundations/typography';

interface NewsletterCardProps {
  description: string;
  frequency?: string;
  title: string;
  cssOverides?: SerializedStyles;
}

const img = css`
  // PLACEHOLDER IMAGE
  display: block;
  padding: 55% calc(100% - 6px) 0 0;
  border: 3px solid black;
  background: linear-gradient(
      to top right,
      transparent 49.5%,
      black 49.5% 50.5%,
      transparent 50.5% 100%
    ),
    linear-gradient(
      to top left,
      transparent 49.5%,
      black 49.5% 50.5%,
      transparent 50.5% 100%
    );
  height: 0;
  width: 0;
`;

const h1 = css`
  color: ${brand[400]};
  ${titlepiece.small()};
  margin: 0 0 ${space[1]}px 0;
  //Override
  font-size: 24px;
`;

const h2 = css`
  color: ${brand[600]};
  ${textSans.small()};
  margin: 0 0 ${space[6]}px 0;
`;

const p = css`
  color: ${brand[400]};
  margin: 0;
  ${body.small()};
  flex: 2 0 auto;
`;

const borderDiv = css`
  flex: 1 0 auto;
  display: flex;
  flex-direction: column;
  border-left: 2px solid ${brand[500]};
  padding: ${space[3]}px ${space[3]}px ${space[3]}px ${space[3]}px;
`;

const article = css`
  display: flex;
  flex-direction: column;
  background-color: ${brand[800]};
`;

// @TODO: hacked background colour, should be fixed in future source checkbox implementation
const checkBoxBackgroundColorBugFix = css`
  background: ${palette.neutral[100]};
  z-index: 0 !important;
`;

export const NewsletterCard: FunctionComponent<NewsletterCardProps> = (
  props,
) => {
  const { description, frequency, title } = props;
  const subtitle = frequency ? <h2 css={h2}>{frequency}</h2> : null;
  return (
    <article css={[article, props.cssOverides]}>
      <img css={img} />
      <div css={borderDiv}>
        <h1 css={h1}>{title}</h1>
        {subtitle}
        <p css={p}>{description}</p>
        <CheckboxGroup name={'sup'}>
          <Checkbox
            cssOverrides={checkBoxBackgroundColorBugFix}
            value={'sup'}
            label="Sign Up"
            checked={false}
          />
        </CheckboxGroup>
      </div>
    </article>
  );
};
