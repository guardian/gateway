import React, { FunctionComponent } from 'react';
import { SerializedStyles, css } from '@emotion/core';
import { brand, space } from '@guardian/src-foundations';
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
  padding: 204px calc(100% - 6px) 0 0;
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
  margin: ${space[3]}px ${space[3]}px ${space[1]}px ${space[3]}px;
  //Override
  font-size: 24px;
`;

const h2 = css`
  color: ${brand[600]};
  ${textSans.small()};
  margin: 0 ${space[3]}px ${space[6]}px ${space[3]}px;
`;

const p = css`
  color: ${brand[400]};
  margin: 0;
  ${body.small()};
  margin: 0 ${space[3]}px ${space[3]}px ${space[3]}px;
`;

const article = css`
  border-left: 2px solid ${brand[500]};
  background-color: ${brand[800]};
`;

export const NewsletterCard: FunctionComponent<NewsletterCardProps> = (
  props,
) => {
  const { description, frequency, title } = props;
  const subtitle = frequency ? <h2 css={h2}>{frequency}</h2> : null;
  return (
    <article css={[article, props.cssOverides]}>
      <img css={img} />
      <h1 css={h1}>{title}</h1>
      {subtitle}
      <p css={p}>{description}</p>
    </article>
  );
};
