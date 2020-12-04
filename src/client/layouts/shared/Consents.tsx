import React, { FunctionComponent } from 'react';
import { brand } from '@guardian/src-foundations/palette';
import { titlepiece, textSans } from '@guardian/src-foundations/typography';
import { css, SerializedStyles } from '@emotion/core';
import { space } from '@guardian/src-foundations';
import { Lines } from '@/client/components/Lines';
import {
  gridRow,
  gridItem,
  MAX_WIDTH,
  gridItemColumnConsents,
  COLUMNS,
} from '@/client/styles/Grid';
import { from } from '@guardian/src-foundations/mq';
import { PageProgression } from '@/client/components/PageProgression';
import { CONSENTS_PAGES_ARR } from '@/client/models/ConsentsPages';

export const CONSENTS_MAIN_COLOR = '#eaf1fd';

const consentsBackground = css`
  background-color: ${CONSENTS_MAIN_COLOR};
`;

export const mainBackground = css`
  position: relative;
  z-index: 0;
  &:before {
    content: ' ';
    ${consentsBackground}
    opacity: 0.4;
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: -1;
  }
`;

// fixes overlapping text issue in IE
// derived from this solution https://stackoverflow.com/a/49368815
export const ieFlexFix = css`
  flex: 0 0 auto;
`;

const blueBorder = css`
  margin: 0 auto;

  ${from.tablet} {
    border-left: 1px solid ${brand[400]};
    border-right: 1px solid ${brand[400]};
  }
`;

const content = css`
  ${gridRow}

  background-color: white;
  width: 100%;
  padding-top: ${space[6]}px;
  padding-bottom: ${space[6]}px;
  ${blueBorder}
`;

const h1 = css`
  color: ${brand[400]};
  margin: ${space[4]}px 0 52px 0;
  ${titlepiece.small({ fontWeight: 'bold' })};
  ${gridItem(gridItemColumnConsents)};
  line-height: 1;
`;

const h2 = css`
  color: ${brand[100]};
  margin: ${space[2]}px 0 ${space[2]}px 0;
  ${textSans.medium()}
  ${gridItem({
    ...gridItemColumnConsents,
    ...{ WIDE: { start: 1, span: COLUMNS.WIDE } },
  })}
`;

const lines = css`
  ${blueBorder}

  ${from.tablet} {
    max-width: ${MAX_WIDTH.TABLET}px;
  }

  ${from.desktop} {
    max-width: ${MAX_WIDTH.DESKTOP}px;
  }

  ${from.wide} {
    max-width: ${MAX_WIDTH.WIDE}px;
  }
`;

const flex = css`
  flex: 1 1 auto;
`;

const height100 = css`
  height: 100%;
`;

const progressionMargin = css`
  margin-bottom: ${space[12]}px;
`;

export const controls = css`
  padding: ${space[9]}px 0 ${space[9]}px 0;
  ${from.tablet} {
    padding: ${space[9]}px 0 ${space[12]}px 0;
  }
  ${from.desktop} {
    padding: ${space[9]}px 0 ${space[24]}px 0;
  }
`;

export const ConsentsHeader: FunctionComponent<{ title: string }> = ({
  title,
}) => (
  <header css={consentsBackground}>
    <div css={[gridRow, blueBorder]}>
      <h2 css={h2}>Your registration</h2>
    </div>
    <Lines n={3} color={brand[400]} cssOverrides={lines} />
    <div css={[gridRow, blueBorder]}>
      <h1 css={h1}>{title}</h1>
    </div>
  </header>
);

export const ConsentsContent: FunctionComponent<{
  cssOverrides?: SerializedStyles;
}> = ({ children, cssOverrides }) => (
  <div css={[content, cssOverrides]}>{children}</div>
);

export const ConsentsBlueBackground: FunctionComponent<{
  cssOverrides?: SerializedStyles;
}> = ({ children, cssOverrides }) => (
  <div css={[consentsBackground, flex, cssOverrides]}>
    <div css={[gridRow, blueBorder, height100]}>{children}</div>
  </div>
);

export const ConsentsProgression: FunctionComponent<{
  current?: string;
}> = ({ current }) => (
  <div css={[gridItem(gridItemColumnConsents), progressionMargin]}>
    <PageProgression pages={CONSENTS_PAGES_ARR} current={current} />
  </div>
);
