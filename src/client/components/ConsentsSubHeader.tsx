import React from 'react';
import { css, SerializedStyles } from '@emotion/react';
import {
  brand,
  neutral,
  space,
  from,
  textSans,
  headline,
} from '@guardian/source-foundations';
import { AutoRow, gridRow } from '@/client/styles/Grid';
import { CONSENTS_PAGES_ARR } from '@/client/models/ConsentsPages';

type Props = {
  autoRow: AutoRow;
  title: string;
  current?: string;
};

const BORDER_SIZE = 2;
const CIRCLE_DIAMETER = 12;

const greyBorder = css`
  margin: 0 auto;

  ${from.tablet} {
    border-left: 1px solid ${neutral[86]};
    border-right: 1px solid ${neutral[86]};
  }
`;

const h1 = css`
  color: ${neutral[7]};
  margin: ${space[9]}px 0 ${space[6]}px;
  ${headline.small({ fontWeight: 'bold' })}};
`;

// For some reason this media query only applies if we use a separate style
const h1ResponsiveText = css`
  ${from.tablet} {
    font-size: 32px;
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

const li = (numPages: number, isLastPage: boolean) => css`
  ${textSans.xxsmall()}
  ${from.mobileMedium} {
    ${textSans.xsmall()}
  }
  ${from.phablet} {
    ${textSans.small()}
  }
  position: relative;
  width: ${isLastPage ? 'min-content' : 100 / (numPages - 1) + '%'};
  display: flex;
  flex-grow: ${isLastPage ? '0' : '1'};
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

    &::after {
      background-color: ${neutral[60]};
    }
  }

  &::after,
  &.complete::after {
    content: ' ';
    height: ${BORDER_SIZE}px;
    position: absolute;
    /* Border position from top is distance of a semicircle minus half the border thickness */
    top: ${CIRCLE_DIAMETER / 2 + BORDER_SIZE - BORDER_SIZE / 2}px;
    left: 0;
    right: 0;
  }
  &.complete::after {
    height: ${BORDER_SIZE * 2}px;
    background-color: ${brand[400]};
  }
  &::before {
    border: ${BORDER_SIZE}px solid ${neutral[60]};
    border-radius: 50%;
    ${circle}
    z-index: 100;
  }
  &.active::before,
  &.complete::before {
    content: ' ';
    border: 3px solid ${brand[400]};
    ${circle};
  }
  &.complete::before {
    background-color: ${brand[400]};
  }
  &:first-child.complete::before {
    left: 0;
  }

  &:last-child::after {
    border: ${BORDER_SIZE}px solid ${neutral[60]};
    border-radius: 50%;
    ${circle}
    z-index: 100;
    left: 0;
  }
  &.active:last-child::after,
  &.complete:last-child::after {
    content: ' ';
    border: 3px solid ${brand[400]};
    ${circle}
  }
  &.complete:last-child::after {
    background-color: ${brand[400]};
  }

  &:last-child::before,
  &:last-child.complete::before {
    box-sizing: initial;
    border-radius: initial;
    border: none;
    width: initial;
    content: ' ';
    height: ${BORDER_SIZE}px;
    position: absolute;
    /* Border position from top is distance of a semicircle minus half the border thickness */
    top: ${CIRCLE_DIAMETER / 2 + BORDER_SIZE - BORDER_SIZE / 2}px;
    left: 0;
  }
  &:last-child.complete::before {
    height: ${BORDER_SIZE * 2}px;
    background-color: ${brand[400]};
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
    color: ${neutral[60]};
    &.active,
    &.complete {
      color: ${neutral[0]};
    }
    &::after {
      background-color: ${neutral[60]};
    }
    &::before {
      border: 2px solid ${neutral[60]};
      background-color: white;
    }
    &:first-child::before {
      left: 0;
    }
    &:last-child::before {
      background-color: ${neutral[60]};
    }
    &:last-child::after {
      border: 2px solid ${neutral[60]};
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

const maxContentOverride = (isLastPage: boolean) => css`
  width: ${isLastPage ? 'max-content' : 'initial'};
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
            <div css={maxContentOverride(isLastPage)}>{page}</div>
          </li>
        );
      })}
    </ul>
  );
};

export const ConsentsSubHeader = ({ autoRow, title, current }: Props) => (
  <header data-cy="exclude-a11y-check">
    <div css={[greyBorder, gridRow]}>
      {current && (
        <PageProgression
          cssOverrides={[pageProgression, autoRow()]}
          pages={CONSENTS_PAGES_ARR}
          current={current}
        />
      )}
      <h1 css={[h1, h1ResponsiveText, autoRow()]}>{title}</h1>
    </div>
  </header>
);
