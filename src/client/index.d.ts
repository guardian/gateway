interface IsletInterface
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {
  ['data-name']?: string;
  ['data-type']?: string;
  ['data-props']?: string;
  ['data-defer-until']?: string;
}

declare namespace JSX {
  interface IntrinsicElements {
    'gu-islet': IsletInterface;
  }
}
