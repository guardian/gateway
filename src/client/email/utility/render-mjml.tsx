/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { JSXElementConstructor, ReactElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import mjml2html from 'mjml-browser';

const renderComponent = (
  component: ReactElement<any, string | JSXElementConstructor<any>>,
) => {
  return {
    __html: mjml2html(`
      <mjml>
        <mj-head>
        <mj-style>
            .display-none {
                display: none !important;
            }
        </mj-style>
        <mj-attributes>
          <mj-all font-family="Helvetica, Arial, sans-serif" />
        </mj-attributes>
      </mj-head>
        <mj-body>
            <mj-container>
                ${renderToStaticMarkup(component)}
            </mj-container>
        </mj-body>
      </mjml>
    `).html,
  };
};

export const renderMJML = (
  component: ReactElement<any, string | JSXElementConstructor<any>>,
) => <div dangerouslySetInnerHTML={renderComponent(component)} />;
