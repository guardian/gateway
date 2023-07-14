/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import mjml2html from 'mjml';

/**
 * We have to use `any` here because when upgrading to typescript 5 we get the following error:
 * Argument of type 'React.ReactElement<any, string | React.JSXElementConstructor<any>>' is not assignable to parameter of type 'import("<PATH_TO_PROJECT>/node_modules/@types/react-dom/node_modules/@types/react/index").ReactElement<any, string | import("<PATH_TO_PROJECT>/node_modules/@types/react-dom/node_modules/@types/react/index").JSXElementConstructor<any>>'.
 *
 * Thankfully this is only used by storybook to render email components, and can get away with using `any` here.
 */

const render = (component: any) => ({
	__html: mjml2html(renderToStaticMarkup(component)).html,
});

const renderComponent = (component: any) => ({
	__html: mjml2html(`
    <mjml>
      <mj-body>
          <mj-container>
              ${renderToStaticMarkup(component)}
          </mj-container>
      </mj-body>
    </mjml>
  `).html,
});

export const renderMJMLComponent = (component: any) => (
	<div dangerouslySetInnerHTML={renderComponent(component)} />
);

export const renderMJML = (component: any) => (
	<div dangerouslySetInnerHTML={render(component)} />
);
