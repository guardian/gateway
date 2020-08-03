import React from 'react';
import { css } from '@emotion/core';
import { brand, neutral } from '@guardian/src-foundations/palette';
import { textSans } from '@guardian/src-foundations/typography';

const PAGES = ['Your data', 'Contact', 'Newsletters', 'Review'];
const N = PAGES.length;

const BORDER_SIZE = 2;
const CIRCLE_DIAMETER = 24;

const ul = css`
  display: flex;
  list-style: none;
  height: 54px;
  padding: 0;
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

const li = css`
  ${textSans.small()}
  position: relative;
  width: ${100 / N}%;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  &.active {
    ${textSans.small({ fontWeight: 'bold' })}
  }
  &:after {
    content: ' ';
    background-color: ${neutral[60]};
    height: ${BORDER_SIZE}px;
    position: absolute;
    // Border position from top is distance of a semicircle minus half the border thickness
    top: ${CIRCLE_DIAMETER / 2 + BORDER_SIZE - BORDER_SIZE / 2}px;
    left: ${CIRCLE_DIAMETER + 2 * BORDER_SIZE}px;
    right: 0;
  }
  &:last-child:after {
    display: none;
  }
  &:before {
    border: ${BORDER_SIZE}px solid ${neutral[60]};
    border-radius: 50%;
    ${circle}
  }
  &.active:before {
    background-color: ${brand[400]};
    border: ${BORDER_SIZE}px solid ${brand[400]};
    ${circle}
  }
`;

export const PageProgression = () => (
  <ul css={ul}>
    {PAGES.map((page, i) => (
      <li className={i === 0 ? 'active' : ''} key={i} css={li}>
        <div>{page}</div>
      </li>
    ))}
  </ul>
);
