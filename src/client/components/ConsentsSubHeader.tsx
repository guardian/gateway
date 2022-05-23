import React from 'react';
import { css } from '@emotion/react';
import {
  brand,
  neutral,
  space,
  from,
  until,
  textSans,
  headline,
  visuallyHidden,
} from '@guardian/source-foundations';
import { AutoRow, gridRow } from '@/client/styles/Grid';
import { greyBorderSides } from '@/client/styles/Consents';
import { CONSENTS_PAGES_ARR } from '@/client/models/ConsentsPages';
import { ErrorSummary } from '@guardian/source-react-components-development-kitchen';

type Props = {
  autoRow: AutoRow;
  title: string;
  current?: string;
  errorMessage?: string;
  errorContext?: React.ReactNode;
};

type PageStatus = 'active' | 'complete' | 'pending';

const CONSENTS_PAGES_COUNT = CONSENTS_PAGES_ARR.length;
const COMPLETED_BORDER_SIZE = 2;
const COMPLETED_COLOR = brand[400];
const PENDING_BORDER_SIZE = 1;
const PENDING_COLOR = neutral[60];
const CIRCLE_DIAMETER = 12;
const CIRCLE_RADIUS = CIRCLE_DIAMETER / 2;

const h1 = css`
  margin: ${space[6]}px 0 ${space[6]}px;
  ${headline.small({ fontWeight: 'bold' })}};
`;

// For some reason this media query only applies if we use a separate style
const h1ResponsiveText = css`
  ${from.tablet} {
    font-size: 32px;
  }

  ${from.desktop} {
    margin-top: 30px;
  }
`;

const ol = (active: number) => {
  const progressSections = CONSENTS_PAGES_COUNT - 1;
  const progressPercentage = Math.min((active / progressSections) * 100, 100);
  const remainingPercentage = 100 - progressPercentage;

  return css`
    list-style: none;
    height: ${CIRCLE_DIAMETER}px;
    margin: 14px 0 40px;
    position: relative;

    ${from.tablet} {
      margin: 18px 0 28px;
    }

    ${from.desktop} {
      margin: 26px 0 22px;
    }

    &:before,
    &:after {
      content: '';
      position: absolute;
    }

    &:before {
      width: ${progressPercentage}%;
      height: ${COMPLETED_BORDER_SIZE}px;
      background: ${COMPLETED_COLOR};
      top: ${(CIRCLE_DIAMETER - COMPLETED_BORDER_SIZE) / 2}px;
      left: 0;
    }

    &:after {
      width: ${remainingPercentage}%;
      height: ${PENDING_BORDER_SIZE}px;
      background: ${PENDING_COLOR};
      top: ${(CIRCLE_DIAMETER - PENDING_BORDER_SIZE) / 2}px;
      right: 0;
      z-index: -1;
    }
  `;
};

const li = (index: number, status: PageStatus) => {
  const progressSections = CONSENTS_PAGES_COUNT - 1;
  const position = index / progressSections;

  return css`
    ${textSans.xxsmall()}
    position: absolute;
    left: ${position * 100}%;
    color: ${status === 'pending' ? PENDING_COLOR : neutral[7]};

    > span {
      top: ${CIRCLE_DIAMETER + space[1]}px;
      position: absolute;
      width: 90px;
      left: -45px;
      text-align: center;

      /* Hack, see explanation below */
      white-space: nowrap;
    }

    &:first-of-type > span {
      left: -${CIRCLE_RADIUS}px;
      text-align: left;

      /**
       * This allows us to force only "Create password" to wrap on mobile
       */
      ${until.mobileLandscape} {
        white-space: normal;
        width: 60px;
      }
    }

    &:last-of-type > span {
      right: -${CIRCLE_RADIUS}px;
      left: auto;
      text-align: right;
    }

    &::before {
      content: '';
      border-radius: 50%;
      width: ${CIRCLE_DIAMETER}px;
      height: ${CIRCLE_DIAMETER}px;
      position: absolute;
      left: -${CIRCLE_RADIUS}px;
      ${status === 'active' &&
      `
        background: ${neutral[100]};
        border: ${COMPLETED_BORDER_SIZE}px solid ${COMPLETED_COLOR};
      `}
      ${status === 'pending' &&
      `
        background: ${neutral[100]};
        border: ${PENDING_BORDER_SIZE}px solid ${PENDING_COLOR};
      `}
      ${status === 'complete' &&
      `
        background: ${brand[400]}
      `}
    }

    ${status === 'active' && textSans.xxsmall({ fontWeight: 'bold' })}
  `;
};

const progressWrapper = css`
  padding: 0 ${CIRCLE_RADIUS}px;
  overflow: hidden;
`;

const screenReaderTextStyles = css`
  ${visuallyHidden}
`;

const summaryStyles = css`
  margin-top: ${space[6]}px;
`;

export const ConsentsSubHeader = ({
  autoRow,
  title,
  current,
  errorContext,
  errorMessage,
}: Props) => {
  const active = current
    ? (CONSENTS_PAGES_ARR as string[]).indexOf(current)
    : 0;

  const pageProgression = current && (
    <div css={[progressWrapper, autoRow()]}>
      <ol css={ol(active)}>
        {CONSENTS_PAGES_ARR.map((page, index) => {
          const status: PageStatus = (() => {
            if (index === active) {
              return 'active';
            }
            if (index < active) {
              return 'complete';
            }
            return 'pending';
          })();
          const screenReaderText = {
            active: 'Current: ',
            complete: 'Completed: ',
          }[status as string];
          return (
            <li key={page} css={li(index, status)}>
              <span>
                {screenReaderText && (
                  <span css={screenReaderTextStyles}>{screenReaderText}</span>
                )}
                {page}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );

  return (
    <header data-cy="exclude-a11y-check">
      <div css={[gridRow, greyBorderSides]}>
        {pageProgression}
        {errorMessage && (
          <ErrorSummary
            cssOverrides={[autoRow(), summaryStyles]}
            message={errorMessage}
            context={errorContext}
          />
        )}
        <h1 css={[h1, h1ResponsiveText, autoRow()]}>{title}</h1>
      </div>
    </header>
  );
};
