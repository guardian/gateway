import React, { FunctionComponent } from 'react';
import { css } from '@emotion/core';
import { brand, neutral } from '@guardian/src-foundations/palette';
import { textSans } from '@guardian/src-foundations/typography';
import { SvgCheckmark } from '@guardian/src-icons';

const BORDER_SIZE = 2;
const CIRCLE_DIAMETER = 24;

const ul = css`
  display: flex;
  list-style: none;
  height: 54px;
  padding: 0;
  margin: 0;
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

const li = (numPages: number) => css`
  ${textSans.small()}
  position: relative;
  width: ${100 / numPages}%;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  &.active {
    ${textSans.small({ fontWeight: 'bold' })}
  }
  &::after,
  &.complete::after {
    content: ' ';
    background-color: ${neutral[60]};
    height: ${BORDER_SIZE}px;
    position: absolute;
    // Border position from top is distance of a semicircle minus half the border thickness
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

interface PageProgressionProps {
  pages: string[];
  current?: string;
}

export const PageProgression: FunctionComponent<PageProgressionProps> = ({
  pages,
  current,
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
    <ul css={ul}>
      {pages.map((page, i) => (
        <li className={getClassName(i)} key={i} css={li(pages.length)}>
          <SvgCheckmark />
          <div>{page}</div>
        </li>
      ))}
    </ul>
  );
};
