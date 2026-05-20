import React, { useEffect, useState } from 'react';
import { renderToMjml } from '@faire/mjml-react/utils/renderToMjml';
import mjml2html from 'mjml';

/**
 * We have to use `any` here because when upgrading to typescript 5 we get the following error:
 * Argument of type 'React.ReactElement<any, string | React.JSXElementConstructor<any>>' is not assignable to parameter of type 'import("<PATH_TO_PROJECT>/node_modules/@types/react-dom/node_modules/@types/react/index").ReactElement<any, string | import("<PATH_TO_PROJECT>/node_modules/@types/react-dom/node_modules/@types/react/index").JSXElementConstructor<any>>'.
 *
 * Thankfully this is only used by storybook to render email components, and can get away with using `any` here.
 */

const render = async (component: React.ReactElement, wrap: boolean) => {
	const mjml = renderToMjml(component);

	return mjml2html(wrap ? `<mjml><mj-body>${mjml}</mj-body></mjml>` : mjml);
};

export const RenderMJML = ({
	children,
	wrap = false,
}: {
	children: React.ReactElement;
	wrap?: boolean;
}) => {
	const [html, setHtml] = useState<string>('');

	useEffect(() => {
		void render(children, wrap).then(({ html }) => setHtml(html));
	}, [children, wrap]);

	return <div dangerouslySetInnerHTML={{ __html: html }} />;
};
