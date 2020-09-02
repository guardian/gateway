import React, { FunctionComponent } from 'react';
import { SerializedStyles, css } from '@emotion/core';
import { brand } from '@guardian/src-foundations';

interface NewsletterCardProps {
  description: string;
  frequency?: string;
  title: string;
  cssOverides?: SerializedStyles;
}

const article = css`
  background-color: ${brand[800]};
`;

export const NewsletterCard: FunctionComponent<NewsletterCardProps> = (
  props,
) => {
  const { description, frequency, title } = props;
  const subtitle = frequency ? <h2>{frequency}</h2> : null;
  return (
    <article css={[article, props.cssOverides]}>
      <h1>{title}</h1>
      {subtitle}
      <p>{description}</p>
    </article>
  );
};
