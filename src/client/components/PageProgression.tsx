import React from 'react';
import { css } from '@emotion/core';
import { brand, neutral } from '@guardian/src-foundations/palette';
import { textSans } from '@guardian/src-foundations/typography';

const PAGES = ['Your data', 'Contact', 'Newsletters', 'Review'];
const N = PAGES.length;

const ul = css`
  display: flex;
  list-style: none;
  height: 54px;
  padding: 0;
`;

const circle = `
  content: ' ';
  border-radius: 50%;
  height: 24px;
  position: absolute;
  left: 0;
  top: 0;
  width: 24px;
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
    height: 2px;
    position: absolute;
    top: 13px;
    left: 28px;
    right: 0;
  }
  &:last-child:after {
    display: none;
  }
  &:before {
    border: 2px solid ${neutral[60]};
    border-radius: 50%;
    ${circle}
  }
  &.active:before {
    background-color: ${brand[400]};
    border: 2px solid ${brand[400]};
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
