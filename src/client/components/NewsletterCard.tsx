import React, { FunctionComponent } from 'react';
import { SerializedStyles } from '@emotion/core';

interface NewsletterCardProps {
  description: string;
  frequency?: string;
  title: string;
  cssOverides?: SerializedStyles;
}

export const NewsletterCard: FunctionComponent<NewsletterCardProps> = (
  props,
) => {
  const { description, frequency, title } = props;
  const subtitle = frequency ? <h2>{frequency}</h2> : null;
  return (
    <article css={props.cssOverides}>
      <h1>{title}</h1>
      {subtitle}
      <p>{description}</p>
    </article>
  );
};
