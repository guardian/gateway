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
