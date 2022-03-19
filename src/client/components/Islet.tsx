import React from 'react';
import { SerializedStyles } from '@emotion/react';

type DeferUntil = 'idle' | 'visible';

interface CommonProps {
  type: 'component' | 'script';
  deferUntil?: DeferUntil;
  children?: JSX.Element;
  name?: string;
  args?: Record<string, unknown>;
  cssOverrides?: SerializedStyles;
}

interface ComponentIsletProps extends CommonProps {
  type: 'component';
  children: JSX.Element;
  name?: undefined;
  args?: undefined;
}

interface ScriptIsletProps extends CommonProps {
  type: 'script';
  name: string;
  children?: undefined;
  args?: Record<string, unknown>;
}

type Props = ComponentIsletProps | ScriptIsletProps;

/**
 * Adds islet (Island) of interactivity to the client by either hydrating an server rendered component
 * or by importing and executing a vanilla js script method.
 *
 * @param type - Determines the type of islet
 * 		- `component` - Execute when browser idle
 * 		- `script` - Execute when component appears in viewport
 * @param deferUntil - Delay when client code should execute
 * 		- `idle` - Execute when browser idle
 * 		- `visible` - Execute when component appears in viewport
 * @param children - The component being inserted. Must be a single React Element. Use with `type` of `component`.
 * @param name - The name of the exported method/function from a script being inserted. Use with `type` of `script`.
 * @param args - The arguments object to pass to the given method/function from a script being inserted. Use with `type` of `script`.
 * @param cssOverrides - Overrides for the islet's css styles.
 *
 * See [development docs - `Islet`](https://github.com/guardian/gateway/blob/main/docs/development.md#islets---islands-architecture) for implementation/usage details.
 */
export const Islet = ({
  children,
  name,
  type,
  args,
  deferUntil,
  cssOverrides,
}: Props) => {
  let isletName: string | undefined;
  let isletProps: string | undefined;

  if (type === 'component') {
    isletName = children?.type.name;
    isletProps = JSON.stringify(children?.props);
  } else if (type === 'script') {
    isletName = name;
    isletProps = JSON.stringify(args);
  }

  return (
    <gu-islet
      data-name={isletName}
      data-props={isletProps}
      data-type={type}
      data-defer-until={deferUntil}
      css={cssOverrides}
    >
      {children}
    </gu-islet>
  );
};
