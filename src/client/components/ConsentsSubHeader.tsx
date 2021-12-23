import React from 'react';
import { css } from '@emotion/react';
import { SerializedStyles } from '@emotion/react';
import {
  brand,
  neutral,
  space,
  from,
  textSans,
  titlepiece,
} from '@guardian/source-foundations';
import { AutoRow, gridItemColumnConsents, gridRow } from '@/client/styles/Grid';
import { CONSENTS_PAGES_ARR } from '@/client/models/ConsentsPages';
import { CONSENTS_MAIN_COLOR } from '@/client/layouts/shared/Consents';
import { SvgCheckmark } from '@guardian/source-react-components';

type Props = {
  autoRow: AutoRow;
  title: string;
  current?: string;
};

const BORDER_SIZE = 2;
const CIRCLE_DIAMETER = 24;

const consentsBackground = css`
  background-color: ${CONSENTS_MAIN_COLOR};
`;

// fixes overlapping text issue in IE
// derived from this solution https://stackoverflow.com/a/49368815
const ieFlexFix = css`
  flex: 0 0 auto;
`;

const blueBorder = css`
  margin: 0 auto;

  ${from.tablet} {
    border-left: 1px solid ${brand[400]};
    border-right: 1px solid ${brand[400]};
  }
`;

const h1 = css`
  color: ${brand[400]};
  margin: ${space[12]}px 0 ${space[5]}px 0;
  ${titlepiece.small({ fontWeight: 'bold' })};
  font-size: 38px;
  line-height: 1;
  ${from.tablet} {
    ${titlepiece.medium({ fontWeight: 'bold' })};
    font-size: 42px;
  }
  ${from.desktop} {
    ${titlepiece.large({ fontWeight: 'bold' })};
    font-size: 50px;
  }
`;

const circle = `
  content: ' ';
  box-sizing: content-box;
  border-radius: 50%;
  height: ${CIRCLE_DIAMETER}px;
  position: absolute;
  left: 0;
  top: 0;
  width: ${CIRCLE_DIAMETER}px;
`;

const li = (numPages: number, lastPage: boolean) => css`
  ${textSans.xxsmall()}
  ${from.mobileMedium} {
    ${textSans.xsmall()}
  }
  ${from.phablet} {
    ${textSans.small()}
  }
  position: relative;
  width: ${lastPage ? 'min-content' : 100 / (numPages - 1) + '%'};
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  padding-top: ${space[6] + space[2]}px;
  &.active {
    ${textSans.xxsmall({ fontWeight: 'bold' })}
    ${from.mobileMedium} {
      ${textSans.xsmall({ fontWeight: 'bold' })}
    }
    ${from.phablet} {
      ${textSans.small({ fontWeight: 'bold' })}
    }
  }

  &::after,
  &.complete::after {
    content: ' ';
    background-color: ${neutral[60]};
    height: ${BORDER_SIZE}px;
    position: absolute;
    /* Border position from top is distance of a semicircle minus half the border thickness */
    top: ${CIRCLE_DIAMETER / 2 + BORDER_SIZE - BORDER_SIZE / 2}px;
    left: ${CIRCLE_DIAMETER + 2 * BORDER_SIZE}px;
    right: 0;
  }
  &.complete::after {
    height: ${BORDER_SIZE * 2}px;
    background-color: ${brand[400]};
  }
  &:last-child::after {
    display: none;
  }
  &::before {
    border: ${BORDER_SIZE}px solid ${neutral[60]};
    border-radius: 50%;
    ${circle}
  }
  &.active::before,
  &.complete::before {
    content: ' ';
    background-color: ${brand[400]};
    border: ${BORDER_SIZE}px solid ${brand[400]};
    ${circle}
  }
  & svg {
    display: none;
  }
  &.complete svg {
    position: absolute;
    display: block;
    stroke: white;
    fill: white;
    height: ${CIRCLE_DIAMETER}px;
    width: ${CIRCLE_DIAMETER}px;
    margin: ${BORDER_SIZE}px;
    top: 0;
    left: 0;
    z-index: 1;
  }
`;

const pageProgression = css`
  margin-top: ${space[5]}px;
  margin-bottom: 0;
  li {
    color: ${brand[400]};
    &::after {
      background-color: ${brand[400]};
    }
    &::before {
      border: 2px solid ${brand[400]};
      background-color: white;
    }
  }
`;

const ul = css`
  display: flex;
  list-style: none;
  justify-content: space-between;
  height: 54px;
  padding: 0;
  margin: 0;
`;

const PageProgression = ({
  pages,
  current,
  cssOverrides,
}: {
  pages: string[];
  current?: string;
  cssOverrides?: SerializedStyles | SerializedStyles[];
}) => {
  const active = current ? pages.indexOf(current) : 0;
  const getClassName = (i: number) => {
    switch (true) {
      case i === active:
        return 'active';
      case i < active:
        return 'complete';
      default:
        return '';
    }
  };
  return (
    <ul css={[ul, cssOverrides]}>
      {pages.map((page, i) => {
        const isLastPage = i === pages.length - 1;
        return (
          <li
            className={getClassName(i)}
            key={i}
            css={li(pages.length, isLastPage)}
          >
            <SvgCheckmark />
            <div
              css={css`
                width: max-content;
              `}
            >
              {page}
            </div>
          </li>
        );
      })}
    </ul>
  );
};

export const ConsentsSubHeader = ({ autoRow, title, current }: Props) => (
  <header css={[consentsBackground, ieFlexFix]}>
    <div css={[blueBorder, gridRow]}>
      {current && (
        <PageProgression
          cssOverrides={[pageProgression, autoRow(gridItemColumnConsents)]}
          pages={CONSENTS_PAGES_ARR}
          current={current}
        />
      )}
      <h1 css={[h1, autoRow(gridItemColumnConsents)]}>{title}</h1>
    </div>
  </header>
);
