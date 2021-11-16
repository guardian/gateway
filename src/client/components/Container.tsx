import React from 'react';
import { css } from '@emotion/react';
import { Container as SourceContainer } from '@guardian/src-layout';
import { brandLine, neutral } from '@guardian/src-foundations/palette';
import { from } from '@guardian/src-foundations/mq';

type Props = {
  children: React.ReactNode; // Children are inserted inside the nested div of the section
  sidePadding?: boolean; // Should side padding be added to the content inside the container (nested div)
  topBorder?: boolean; // Show top border
  sideBorders?: boolean; // Show left and right borders
  borderColor?: string; // Set the colour for borders
  backgroundColor?: string; // Sets the background colour of the section (root) element
};

const sidePaddingStyles = css`
  > div {
    padding-left: 10px;
    padding-right: 10px;
    ${from.mobileLandscape} {
      padding-left: 20px;
      padding-right: 20px;
    }
  }
`;

const noPaddingStyles = css`
  > div {
    padding: 0;
  }
`;

const sideBorderStyles = (color = neutral[86]) => css`
  > div {
    ${from.tablet} {
      border-left: 1px solid ${color};
      border-right: 1px solid ${color};
    }
  }
`;

export const Container = ({
  children,
  sidePadding = true,
  topBorder,
  sideBorders,
  borderColor = brandLine.primary,
  backgroundColor,
}: Props) => {
  return (
    <SourceContainer
      topBorder={topBorder}
      borderColor={borderColor}
      backgroundColor={backgroundColor}
      cssOverrides={[
        sidePadding ? sidePaddingStyles : noPaddingStyles,
        sideBorders ? sideBorderStyles(borderColor) : css``,
      ]}
    >
      {children}
    </SourceContainer>
  );
};
