import React, { FunctionComponent } from 'react';

interface LinesProps {
  n: number;
  color?: string;
  margin?: string;
}

export const Lines: FunctionComponent<LinesProps> = (props) => {
  const { n, margin } = props;
  const thickness = 1;
  const distance = 6;
  const height = n * distance;
  const color = props.color ? props.color : 'black';

  return (
    <>
      <hr
        css={{
          backgroundImage: `repeating-linear-gradient(to bottom, ${color}, ${color}, ${thickness}px, transparent ${thickness}px, transparent ${distance}px)`,
          backgroundRepeat: 'repeat',
          backgroundPosition: 'top',
          height: `${height}px`,
          border: 0,
          margin: margin ? margin : '12px auto 6px',
          width: '100%',
        }}
      />
    </>
  );
};
