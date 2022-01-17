import React from 'react';
import { css, SerializedStyles } from '@emotion/react';

import {
  border,
  from,
  text,
  space,
  textSans,
} from '@guardian/source-foundations';

type Sizes = 'full' | 'partial' | 'fit';
type Spaces = 'tight' | 'loose';
type Props = {
  size?: Sizes;
  spaceAbove?: Spaces;
  displayText?: string;
  cssOverrides?: SerializedStyles;
};

const fullStypes = css`
  margin-left: -10px;
  width: calc(100% + 20px);
`;
const partialStyles = css`
  margin-left: -10px;
  width: 160px;
`;

const decideSpace = (
  spaceAbove: Spaces,
  displayText?: string,
): SerializedStyles => {
  switch (spaceAbove) {
    case 'tight':
      return displayText
        ? css`
            margin-top: -3px;
          `
        : css`
            margin-top: ${space[6]}px;
          `;
    case 'loose':
      return displayText
        ? css`
            margin-top: ${space[4]}px;
            ${from.mobileMedium} {
              margin-top: ${space[6]}px;
            }
          `
        : css`
            margin-top: ${space[12]}px;
          `;
  }
};

const decideSize = (size: Sizes) => {
  switch (size) {
    case 'fit':
      return css`
        :before {
          margin-left: 0;
        }

        :after {
          margin-right: 0;
        }
      `;
    case 'full':
      return css`
        :before {
          margin-left: -10px;
        }

        :after {
          margin-right: -10px;
        }
      `;
    case 'partial':
      return css`
        :before {
          margin-left: 30%;
        }

        :after {
          margin-right: 30%;
        }
      `;
  }
};

export const Divider = ({
  size = 'partial',
  spaceAbove = 'loose',
  displayText,
  cssOverrides,
}: Props) => {
  if (displayText) {
    return (
      <div
        css={[
          css`
            display: flex;
            flex-direction: row;
            ${textSans.small()};
            color: ${text.supporting};
            width: 100%;

            :before,
            :after {
              content: '';
              flex: 1 1;
              border-bottom: 1px solid ${border.secondary};
              margin: auto;
            }
            :before {
              margin-right: 10px;
            }
            :after {
              margin-left: 10px;
            }
          `,
          decideSize(size),
          decideSpace(spaceAbove, displayText),
          cssOverrides,
        ]}
      >
        {displayText}
      </div>
    );
  }

  return (
    <hr
      css={[
        css`
          height: 1px;
          border: 0;
          margin-bottom: 3px;
          background-color: ${border.secondary};
        `,
        size === 'partial' ? partialStyles : fullStypes,
        decideSpace(spaceAbove),
      ]}
    />
  );
};
