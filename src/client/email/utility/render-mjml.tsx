/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { JSXElementConstructor, ReactElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import mjml2html from 'mjml-browser';

const render = (
  component: ReactElement<any, string | JSXElementConstructor<any>>,
) => ({
  __html: mjml2html(renderToStaticMarkup(component)).html,
});

const renderComponent = (
  component: ReactElement<any, string | JSXElementConstructor<any>>,
) => ({
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

export const renderMJMLComponent = (
  component: ReactElement<any, string | JSXElementConstructor<any>>,
) => <div dangerouslySetInnerHTML={renderComponent(component)} />;

export const renderMJML = (
  component: ReactElement<any, string | JSXElementConstructor<any>>,
) => <div dangerouslySetInnerHTML={render(component)} />;
