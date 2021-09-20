import React from 'react';
import { css, SerializedStyles } from '@emotion/react';
import { Container as SourceContainer } from '@guardian/src-layout';
import { brandLine } from '@guardian/src-foundations/palette';
import { from } from '@guardian/src-foundations/mq';
import { space } from '@guardian/src-foundations';

type Props = {
  children: React.ReactNode; // Children are inserted inside the nested div of the section
  sidePadding?: boolean; // Should side padding be added to the content inside the container (nested div)
  topBorder?: boolean; // Show top border
  sideBorders?: boolean; // Show left and right borders
  borderColor?: string; // Set the colour for borders
  backgroundColor?: string; // Sets the background colour of the section (root) element
  cssOverrides?: SerializedStyles;
};

const sidePaddingStyles = css`
  > div {
    padding-left: ${space[3]}px;
    padding-right: ${space[3]}px;
    ${from.tablet} {
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

const sideBorderColors = (color: string) => css`
  border-left-color: ${color} !important;
  border-right-color: ${color};
`;

export const Container = ({
  children,
  sidePadding = true,
  topBorder,
  sideBorders,
  borderColor = brandLine.primary,
  backgroundColor,
  cssOverrides,
}: Props) => {
  return (
    <SourceContainer
      sideBorders={sideBorders}
      topBorder={topBorder}
      borderColor={borderColor}
      backgroundColor={backgroundColor}
      cssOverrides={[
        sidePadding ? sidePaddingStyles : noPaddingStyles,
        sideBorders ? sideBorderColors(borderColor) : css``,
        cssOverrides ? cssOverrides : css``,
      ]}
    >
      {children}
    </SourceContainer>
  );
};
